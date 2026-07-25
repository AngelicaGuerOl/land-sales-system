package com.angelica.landsalesbackend.payment.service;

import com.angelica.landsalesbackend.customer.entity.Customer;
import com.angelica.landsalesbackend.customer.exception.CustomerNotFoundException;
import com.angelica.landsalesbackend.customer.repository.CustomerRepository;
import com.angelica.landsalesbackend.payment.dto.*;
import com.angelica.landsalesbackend.payment.entity.*;
import com.angelica.landsalesbackend.payment.exception.*;
import com.angelica.landsalesbackend.payment.repository.PaymentRepository;
import com.angelica.landsalesbackend.sale.entity.*;
import com.angelica.landsalesbackend.sale.repository.SaleInstallmentRepository;
import com.angelica.landsalesbackend.sale.repository.SaleLotRepository;
import com.angelica.landsalesbackend.security.AuthenticatedUser;
import com.angelica.landsalesbackend.shared.exception.UnauthorizedException;
import com.angelica.landsalesbackend.user.entity.User;
import com.angelica.landsalesbackend.user.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentServiceImpl implements PaymentService {
    private static final BigDecimal ZERO = new BigDecimal("0.00");
    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final SaleLotRepository saleLotRepository;
    private final SaleInstallmentRepository installmentRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository, CustomerRepository customerRepository, UserRepository userRepository, SaleLotRepository saleLotRepository, SaleInstallmentRepository installmentRepository) {
        this.paymentRepository = paymentRepository; this.customerRepository = customerRepository; this.userRepository = userRepository; this.saleLotRepository = saleLotRepository; this.installmentRepository = installmentRepository;
    }

    @Override @Transactional
    public PaymentDetailResponse create(CreatePaymentRequest request, AuthenticatedUser authenticatedUser) {
        Customer customer = customerRepository.findById(request.customerId()).orElseThrow(CustomerNotFoundException::new);
        if (authenticatedUser == null) throw new UnauthorizedException("Authentication is required");
        User receivedBy = userRepository.findById(authenticatedUser.id()).orElseThrow(() -> new UnauthorizedException("Invalid user"));
        LocalDate paymentDate = LocalDate.now(ZoneId.systemDefault());
        List<Long> lotIds = request.allocations().stream().map(CreatePaymentAllocationRequest::saleLotId).toList();
        if (new HashSet<>(lotIds).size() != lotIds.size()) throw new PaymentValidationException("A lot cannot be repeated in the same payment");
        List<SaleLot> lockedLots = saleLotRepository.findAllByIdInForUpdate(lotIds);
        if (lockedLots.size() != lotIds.size()) throw new PaymentValidationException("One or more sale lots do not exist");
        Map<Long, SaleLot> lotsById = lockedLots.stream().collect(Collectors.toMap(SaleLot::getId, Function.identity()));
        Map<Long, CreatePaymentAllocationRequest> requestsByLot = request.allocations().stream().collect(Collectors.toMap(CreatePaymentAllocationRequest::saleLotId, Function.identity()));
        for (SaleLot lot : lockedLots) {
            if (!lot.getSale().getCustomer().getId().equals(customer.getId())) throw new PaymentValidationException("A sale lot does not belong to the selected customer");
            if (lot.getOutstandingBalance().signum() <= 0) throw new PaymentConflictException("Sale lot " + lot.getLot().getCode() + " has no outstanding balance");
            if (paymentDate.isBefore(lot.getSale().getSaleDate())) throw new PaymentValidationException("No se puede registrar un pago con fecha anterior a la venta del lote " + lot.getLot().getCode() + ".");
        }
        List<SaleInstallment> lockedInstallments = installmentRepository.findAllBySaleLotIdInForUpdate(lotIds);
        Map<Long, SaleInstallment> installmentsById = lockedInstallments.stream().collect(Collectors.toMap(SaleInstallment::getId, Function.identity()));
        Set<Long> requestedInstallmentIds = new HashSet<>();
        List<PreparedAllocation> prepared = new ArrayList<>();
        BigDecimal total = ZERO;
        for (Long lotId : lotIds) {
            SaleLot lot = lotsById.get(lotId); CreatePaymentAllocationRequest allocationRequest = requestsByLot.get(lotId);
            List<SaleInstallment> installments = lockedInstallments.stream().filter(i -> i.getSaleLot().getId().equals(lotId)).sorted(Comparator.comparing(SaleInstallment::getPaymentMonth).thenComparing(SaleInstallment::getInstallmentNumber)).toList();
            Map<Long, CreateInstallmentPaymentRequest> requested = new HashMap<>();
            for (CreateInstallmentPaymentRequest item : allocationRequest.installments()) {
                if (!requestedInstallmentIds.add(item.installmentId())) throw new PaymentValidationException("An installment cannot be repeated in the same payment");
                if (!installmentsById.containsKey(item.installmentId()) || !installmentsById.get(item.installmentId()).getSaleLot().getId().equals(lotId)) throw new PaymentValidationException("An installment does not belong to the selected sale lot");
                requested.put(item.installmentId(), item);
            }
            boolean skippedUnpaid = false; boolean priorPartial = false; BigDecimal lotAmount = ZERO; List<PreparedInstallment> preparedInstallments = new ArrayList<>();
            for (SaleInstallment installment : installments) {
                BigDecimal remaining = installment.getAmount().subtract(installment.getPaidAmount()).setScale(2, RoundingMode.HALF_UP);
                CreateInstallmentPaymentRequest item = requested.get(installment.getId());
                if (remaining.signum() <= 0) { if (item != null) throw new PaymentConflictException("Installment " + installment.getInstallmentNumber() + " is already paid"); continue; }
                if (item == null) { skippedUnpaid = true; continue; }
                if (skippedUnpaid || priorPartial) throw new PaymentValidationException("Installments must be paid in order");
                BigDecimal amount = money(item.amount());
                if (amount.signum() <= 0 || amount.compareTo(remaining) > 0) throw new PaymentValidationException("Payment exceeds the installment balance");
                BigDecimal after = remaining.subtract(amount).setScale(2, RoundingMode.HALF_UP);
                preparedInstallments.add(new PreparedInstallment(installment, amount, remaining, after)); lotAmount = lotAmount.add(amount); total = total.add(amount);
                if (after.signum() > 0) priorPartial = true;
            }
            if (lotAmount.signum() <= 0) throw new PaymentValidationException("Each selected lot must have a payment");
            if (lotAmount.compareTo(lot.getOutstandingBalance()) > 0) throw new PaymentConflictException("Payment exceeds the sale lot balance");
            prepared.add(new PreparedAllocation(lot, lotAmount, lot.getOutstandingBalance(), lot.getOutstandingBalance().subtract(lotAmount), preparedInstallments));
        }
        if (total.signum() <= 0) throw new PaymentValidationException("Payment total must be greater than zero");
        Payment payment = new Payment(); payment.setPaymentNumber(paymentRepository.nextPaymentNumber()); payment.setCustomer(customer); payment.setPaymentDate(paymentDate); payment.setTotalAmount(money(total)); payment.setPaymentMethod(request.paymentMethod()); payment.setReference(blankToNull(request.reference())); payment.setReceivedBy(receivedBy);
        for (PreparedAllocation item : prepared) {
            PaymentAllocation allocation = new PaymentAllocation(); allocation.setPayment(payment); allocation.setSaleLot(item.lot()); allocation.setAmount(money(item.amount())); allocation.setBalanceBefore(item.before()); allocation.setBalanceAfter(item.after()); payment.getAllocations().add(allocation);
            for (PreparedInstallment preparedInstallment : item.installments()) {
                SaleInstallment installment = preparedInstallment.installment(); installment.setPaidAmount(installment.getPaidAmount().add(preparedInstallment.amount()).setScale(2, RoundingMode.HALF_UP)); installment.setStatus(installment.getPaidAmount().compareTo(installment.getAmount()) == 0 ? SaleInstallmentStatus.PAID : SaleInstallmentStatus.PARTIAL);
                InstallmentPaymentAllocation installmentAllocation = new InstallmentPaymentAllocation(); installmentAllocation.setPaymentAllocation(allocation); installmentAllocation.setInstallment(installment); installmentAllocation.setAmount(preparedInstallment.amount()); installmentAllocation.setInstallmentBalanceBefore(preparedInstallment.before()); installmentAllocation.setInstallmentBalanceAfter(preparedInstallment.after()); allocation.getInstallments().add(installmentAllocation);
            }
            item.lot().setOutstandingBalance(item.after()); if (item.after().signum() == 0) item.lot().setStatus(SaleLotStatus.PAID);
            Sale sale = item.lot().getSale(); if (sale.getSaleLots().stream().allMatch(saleLot -> saleLot.getStatus() == SaleLotStatus.PAID)) sale.setStatus(SaleStatus.PAID);
        }
        return toDetail(paymentRepository.save(payment));
    }

    @Override @Transactional(readOnly = true)
    public Page<PaymentSummaryResponse> find(String search, PaymentMethod paymentMethod, LocalDate dateFrom, LocalDate dateTo, Pageable pageable) { return paymentRepository.search(search == null ? "" : search.trim(), paymentMethod, dateFrom, dateTo, pageable).map(this::toSummary); }

    @Override @Transactional(readOnly = true)
    public PaymentDetailResponse get(Long id) { return toDetail(paymentRepository.findById(id).orElseThrow(PaymentNotFoundException::new)); }

    private PaymentSummaryResponse toSummary(Payment payment) { List<String> codes = payment.getAllocations().stream().sorted(Comparator.comparing(a -> a.getSaleLot().getLot().getCode())).map(a -> a.getSaleLot().getLot().getCode()).toList(); return new PaymentSummaryResponse(payment.getId(), payment.getPaymentNumber(), payment.getPaymentDate(), payment.getCustomer().getId(), payment.getCustomer().getFullName(), payment.getCustomer().getPhone(), codes, payment.getTotalAmount(), payment.getPaymentMethod(), payment.getReceivedBy().getFullName(), payment.getCreatedAt()); }
    private PaymentDetailResponse toDetail(Payment payment) { var customer = payment.getCustomer(); var user = payment.getReceivedBy(); var allocations = payment.getAllocations().stream().sorted(Comparator.comparing(a -> a.getSaleLot().getLot().getCode())).map(a -> new PaymentDetailResponse.AllocationInfo(a.getSaleLot().getId(), a.getSaleLot().getLot().getCode(), displayFolio(a.getSaleLot().getSale().getFolio()), a.getAmount(), a.getBalanceBefore(), a.getBalanceAfter(), a.getInstallments().stream().sorted(Comparator.comparing((InstallmentPaymentAllocation i) -> i.getInstallment().getPaymentMonth()).thenComparing(i -> i.getInstallment().getInstallmentNumber())).map(i -> new PaymentDetailResponse.InstallmentAllocationInfo(i.getInstallment().getId(), i.getInstallment().getInstallmentNumber(), i.getInstallment().getPaymentMonth(), i.getAmount(), i.getInstallmentBalanceBefore(), i.getInstallmentBalanceAfter(), i.getInstallment().getStatus())).toList())).toList(); return new PaymentDetailResponse(payment.getId(), payment.getPaymentNumber(), payment.getPaymentDate(), new PaymentDetailResponse.CustomerInfo(customer.getId(), customer.getFullName(), customer.getPhone()), payment.getPaymentMethod(), payment.getReference(), payment.getTotalAmount(), new PaymentDetailResponse.UserInfo(user.getId(), user.getFullName(), user.getUsername()), payment.getCreatedAt(), allocations); }

    private String displayFolio(String folio) {
        if (folio != null && folio.matches("VTA-\\d{4}-\\d+")) {
            return folio.substring(folio.lastIndexOf('-') + 1).replaceFirst("^0+(?!$)", "");
        }
        return folio;
    }
    private BigDecimal money(BigDecimal value) { return value.setScale(2, RoundingMode.HALF_UP); }
    private String blankToNull(String value) { return value == null || value.trim().isEmpty() ? null : value.trim(); }
    private record PreparedAllocation(SaleLot lot, BigDecimal amount, BigDecimal before, BigDecimal after, List<PreparedInstallment> installments) {}
    private record PreparedInstallment(SaleInstallment installment, BigDecimal amount, BigDecimal before, BigDecimal after) {}
}
