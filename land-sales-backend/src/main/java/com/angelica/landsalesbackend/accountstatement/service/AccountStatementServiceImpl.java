package com.angelica.landsalesbackend.accountstatement.service;

import com.angelica.landsalesbackend.accountstatement.dto.AccountStatementResponse;
import com.angelica.landsalesbackend.accountstatement.dto.AccountStatementSummaryResponse;
import com.angelica.landsalesbackend.accountstatement.repository.AccountStatementRepository;
import com.angelica.landsalesbackend.customer.entity.Customer;
import com.angelica.landsalesbackend.customer.exception.CustomerNotFoundException;
import com.angelica.landsalesbackend.customer.repository.CustomerRepository;
import com.angelica.landsalesbackend.sale.entity.Sale;
import com.angelica.landsalesbackend.sale.entity.SaleInstallment;
import com.angelica.landsalesbackend.sale.entity.SaleLot;
import com.angelica.landsalesbackend.sale.repository.SaleRepository;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountStatementServiceImpl implements AccountStatementService {
    private static final BigDecimal ZERO = new BigDecimal("0.00");
    private final AccountStatementRepository statementRepository;
    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;

    public AccountStatementServiceImpl(AccountStatementRepository statementRepository, CustomerRepository customerRepository, SaleRepository saleRepository) {
        this.statementRepository = statementRepository; this.customerRepository = customerRepository; this.saleRepository = saleRepository;
    }

    @Override @Transactional(readOnly = true)
    public Page<AccountStatementSummaryResponse> findCustomers(String search, Pageable pageable) {
        return statementRepository.search(search == null ? "" : search.trim(), pageable);
    }

    @Override @Transactional(readOnly = true)
    public AccountStatementResponse getCustomerStatement(Long customerId) {
        Customer customer = customerRepository.findById(customerId).orElseThrow(CustomerNotFoundException::new);
        List<Sale> sales = saleRepository.findAllByCustomerIdWithLots(customerId);
        List<AccountStatementResponse.SaleInfo> saleInfos = sales.stream().map(this::toSale).toList();
        BigDecimal agreed = ZERO, down = ZERO, financed = ZERO, paid = ZERO, outstanding = ZERO;
        long lotsWithBalance = 0;
        for (Sale sale : sales) for (SaleLot lot : sale.getSaleLots()) {
            agreed = agreed.add(lot.getAgreedPrice()); down = down.add(lot.getDownPayment()); financed = financed.add(lot.getFinancedAmount());
            outstanding = outstanding.add(lot.getOutstandingBalance()); paid = paid.add(lot.getFinancedAmount().subtract(lot.getOutstandingBalance()));
            if (lot.getOutstandingBalance().signum() > 0) lotsWithBalance++;
        }
        var customerInfo = new AccountStatementResponse.CustomerInfo(customer.getId(), customer.getFullName(), customer.getPhone(), customer.getAlternatePhone(), customer.getAddress());
        var totals = new AccountStatementResponse.Totals(agreed, down, financed, paid, outstanding, lotsWithBalance);
        return new AccountStatementResponse(customerInfo, totals, saleInfos);
    }

    private AccountStatementResponse.SaleInfo toSale(Sale sale) {
        List<AccountStatementResponse.LotInfo> lots = sale.getSaleLots().stream().sorted(Comparator.comparing((SaleLot sl) -> sl.getLot().getCode())).map(this::toLot).toList();
        return new AccountStatementResponse.SaleInfo(sale.getId(), displayFolio(sale.getFolio()), sale.getSaleDate(), lots);
    }

    private String displayFolio(String folio) {
        if (folio != null && folio.matches("VTA-\\d{4}-\\d+")) {
            return folio.substring(folio.lastIndexOf('-') + 1).replaceFirst("^0+(?!$)", "");
        }
        return folio;
    }

    private AccountStatementResponse.LotInfo toLot(SaleLot lot) {
        List<AccountStatementResponse.InstallmentInfo> installments = lot.getInstallments().stream()
                .sorted(Comparator.comparing(SaleInstallment::getPaymentMonth).thenComparing(SaleInstallment::getInstallmentNumber))
                .map(i -> new AccountStatementResponse.InstallmentInfo(i.getId(), i.getInstallmentNumber(), i.getPaymentMonth(), i.getAmount(), i.getPaidAmount(), i.getAmount().subtract(i.getPaidAmount()), i.getStatus())).toList();
        return new AccountStatementResponse.LotInfo(lot.getId(), lot.getLot().getId(), lot.getLot().getCode(), lot.getLot().getBlock().getCode(), lot.getLot().getLotNumber(), lot.getLot().getAreaM2(), lot.getLot().getFrontMeters(), lot.getLot().getDepthMeters(), lot.getAgreedPrice(), lot.getDownPayment(), lot.getFinancedAmount(), lot.getFinancedAmount().subtract(lot.getOutstandingBalance()), lot.getOutstandingBalance(), lot.getStatus(), installments);
    }
}
