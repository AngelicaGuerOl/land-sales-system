package com.angelica.landsalesbackend.sale.service;

import com.angelica.landsalesbackend.customer.entity.Customer;
import com.angelica.landsalesbackend.customer.exception.CustomerNotFoundException;
import com.angelica.landsalesbackend.customer.repository.CustomerRepository;
import com.angelica.landsalesbackend.lot.entity.Lot;
import com.angelica.landsalesbackend.lot.entity.LotStatus;
import com.angelica.landsalesbackend.lot.exception.LotNotFoundException;
import com.angelica.landsalesbackend.lot.repository.LotRepository;
import com.angelica.landsalesbackend.sale.dto.*;
import com.angelica.landsalesbackend.sale.entity.*;
import com.angelica.landsalesbackend.sale.exception.*;
import com.angelica.landsalesbackend.sale.mapper.SaleMapper;
import com.angelica.landsalesbackend.sale.repository.SaleRepository;
import com.angelica.landsalesbackend.security.AuthenticatedUser;
import com.angelica.landsalesbackend.shared.exception.UnauthorizedException;
import com.angelica.landsalesbackend.user.entity.User;
import com.angelica.landsalesbackend.user.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SaleServiceImpl implements SaleService {
    private static final BigDecimal ZERO = new BigDecimal("0.00");
    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final LotRepository lotRepository;
    private final UserRepository userRepository;
    private final SaleMapper saleMapper;

    public SaleServiceImpl(SaleRepository saleRepository, CustomerRepository customerRepository, LotRepository lotRepository, UserRepository userRepository, SaleMapper saleMapper) {
        this.saleRepository = saleRepository; this.customerRepository = customerRepository; this.lotRepository = lotRepository; this.userRepository = userRepository; this.saleMapper = saleMapper;
    }

    @Override @Transactional
    public SaleDetailResponse create(CreateSaleRequest request, AuthenticatedUser authenticatedUser) {
        Customer customer = customerRepository.findById(request.customerId()).orElseThrow(CustomerNotFoundException::new);
        if (!customer.isActive()) throw new SaleConflictException("The customer is inactive");
        if (authenticatedUser == null) throw new UnauthorizedException("Authentication is required");
        User createdBy = userRepository.findById(authenticatedUser.id()).orElseThrow(() -> new UnauthorizedException("Invalid user"));
        List<Long> ids = request.lots().stream().map(CreateSaleLotRequest::lotId).toList();
        if (new HashSet<>(ids).size() != ids.size()) throw new SaleValidationException("A lot cannot be repeated in the same sale");
        List<Long> lockIds = ids.stream().sorted().toList();
        List<Lot> lockedLots = lotRepository.findAllByIdInForUpdate(lockIds);
        if (lockedLots.size() != ids.size()) throw new LotNotFoundException();
        Map<Long, Lot> lotsById = lockedLots.stream().collect(Collectors.toMap(Lot::getId, Function.identity()));
        for (Long id : ids) {
            Lot lot = lotsById.get(id);
            if (lot.getStatus() != LotStatus.AVAILABLE) throw new SaleConflictException("Lot " + lot.getCode() + " is no longer available");
        }

        Sale sale = new Sale();
        sale.setFolio(buildFolio(request.saleDate(), saleRepository.nextFolioSequence()));
        sale.setCustomer(customer); sale.setSaleDate(request.saleDate()); sale.setCreatedBy(createdBy); sale.setStatus(SaleStatus.ACTIVE);
        BigDecimal totalPrice = ZERO, totalDown = ZERO, totalFinanced = ZERO;
        List<SaleLot> saleLots = new ArrayList<>();
        for (CreateSaleLotRequest item : request.lots()) {
            Lot lot = lotsById.get(item.lotId());
            BigDecimal price = money(item.agreedPrice()); BigDecimal down = money(item.downPayment());
            if (price.signum() <= 0) throw new SaleValidationException("Agreed price must be greater than zero");
            if (down.signum() < 0 || down.compareTo(price) > 0) throw new SaleValidationException("Down payment must be between zero and the agreed price");
            BigDecimal financed = price.subtract(down).setScale(2, RoundingMode.UNNECESSARY);
            if (financed.signum() == 0) {
                if (item.installmentCount() != 0) throw new SaleValidationException("A fully paid lot cannot have installments");
            } else if (item.installmentCount() <= 0) {
                throw new SaleValidationException("Financed lots require installments");
            }
            SaleLot saleLot = buildSaleLot(sale, lot, price, down, financed, item);
            saleLots.add(saleLot); totalPrice = totalPrice.add(price); totalDown = totalDown.add(down); totalFinanced = totalFinanced.add(financed);
            lot.setStatus(LotStatus.SOLD);
        }
        sale.setTotalAgreedPrice(money(totalPrice)); sale.setTotalDownPayment(money(totalDown)); sale.setTotalFinancedAmount(money(totalFinanced));
        sale.setStatus(saleLots.stream().allMatch(saleLot -> saleLot.getStatus() == SaleLotStatus.PAID) ? SaleStatus.PAID : SaleStatus.ACTIVE);
        sale.getSaleLots().addAll(saleLots);
        Sale saved = saleRepository.save(sale);
        return toDetail(saved, saleLots);
    }

    private SaleLot buildSaleLot(Sale sale, Lot lot, BigDecimal price, BigDecimal down, BigDecimal financed, CreateSaleLotRequest item) {
        SaleLot result = new SaleLot(); result.setSale(sale); result.setLot(lot); result.setAgreedPrice(price); result.setDownPayment(down); result.setFinancedAmount(financed); result.setOutstandingBalance(financed);
        if (financed.signum() == 0) { result.setInstallmentCount(0); result.setInstallmentAmount(ZERO); result.setStatus(SaleLotStatus.PAID); }
        else {
            int count = item.installmentCount(); BigDecimal base = financed.divide(BigDecimal.valueOf(count), 2, RoundingMode.DOWN); LocalDate firstPaymentMonth = sale.getSaleDate().plusMonths(1).withDayOfMonth(1); result.setInstallmentCount(count); result.setInstallmentAmount(money(base)); result.setStatus(SaleLotStatus.ACTIVE);
            for (int number = 1; number <= count; number++) { BigDecimal amount = number == count ? financed.subtract(base.multiply(BigDecimal.valueOf(count - 1L))) : base; SaleInstallment installment = new SaleInstallment(); installment.setSaleLot(result); installment.setInstallmentNumber(number); installment.setPaymentMonth(firstPaymentMonth.plusMonths(number - 1L)); installment.setAmount(money(amount)); installment.setPaidAmount(ZERO); installment.setStatus(SaleInstallmentStatus.PENDING); result.getInstallments().add(installment); }
        }
        return result;
    }

    @Override @Transactional(readOnly = true)
    public Page<SaleSummaryResponse> find(String search, SaleStatus status, LocalDate dateFrom, LocalDate dateTo, Pageable pageable) {
        return saleRepository.search(search == null ? "" : search.trim(), status, dateFrom, dateTo, pageable).map(this::toSummary);
    }

    @Override @Transactional(readOnly = true)
    public SaleDetailResponse get(Long id) { Sale sale = saleRepository.findDetailById(id).orElseThrow(SaleNotFoundException::new); return toDetail(sale, sale.getSaleLots()); }

    private SaleSummaryResponse toSummary(Sale sale) { List<String> codes = sale.getSaleLots().stream().map(sl -> sl.getLot().getCode()).toList(); return new SaleSummaryResponse(sale.getId(), sale.getFolio(), sale.getSaleDate(), sale.getCustomer().getId(), sale.getCustomer().getFullName(), sale.getCustomer().getPhone(), codes.size(), codes, sale.getTotalAgreedPrice(), sale.getTotalDownPayment(), sale.getTotalFinancedAmount(), sale.getStatus(), sale.getCreatedAt()); }
    private SaleDetailResponse toDetail(Sale sale, List<SaleLot> lots) { var customer = sale.getCustomer(); var user = sale.getCreatedBy(); var ci = new SaleDetailResponse.CustomerInfo(customer.getId(), customer.getFullName(), customer.getPhone(), customer.getAlternatePhone(), customer.getAddress()); var ui = new SaleDetailResponse.UserInfo(user.getId(), user.getFullName(), user.getUsername()); List<SaleLotResponse> responses = lots.stream().map(this::toLotResponse).toList(); return new SaleDetailResponse(sale.getId(), sale.getFolio(), sale.getSaleDate(), ci, ui, sale.getTotalAgreedPrice(), sale.getTotalDownPayment(), sale.getTotalFinancedAmount(), sale.getStatus(), sale.getCreatedAt(), sale.getUpdatedAt(), responses); }
    private SaleLotResponse toLotResponse(SaleLot sl) { Lot lot = sl.getLot(); List<SaleInstallmentResponse> installments = sl.getInstallments().stream().sorted(Comparator.comparing(SaleInstallment::getPaymentMonth).thenComparing(SaleInstallment::getInstallmentNumber)).map(saleMapper::toInstallmentResponse).toList(); LocalDate firstPaymentMonth = installments.isEmpty() ? null : installments.get(0).paymentMonth(); return new SaleLotResponse(lot.getId(), lot.getCode(), lot.getBlock().getCode(), lot.getLotNumber(), lot.getAreaM2(), lot.getFrontMeters(), lot.getDepthMeters(), sl.getAgreedPrice(), sl.getDownPayment(), sl.getFinancedAmount(), sl.getOutstandingBalance(), sl.getInstallmentCount(), sl.getInstallmentAmount(), firstPaymentMonth, sl.getStatus(), installments); }
    private BigDecimal money(BigDecimal value) { return value.setScale(2, RoundingMode.HALF_UP); }
    private String buildFolio(LocalDate date, Long sequence) { return String.format(Locale.ROOT, "VTA-%d-%06d", date.getYear(), sequence); }
}
