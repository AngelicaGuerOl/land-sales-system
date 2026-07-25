package com.angelica.landsalesbackend.accountstatement.dto;

import com.angelica.landsalesbackend.sale.entity.SaleInstallmentStatus;
import com.angelica.landsalesbackend.sale.entity.SaleLotStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record AccountStatementResponse(
        CustomerInfo customer, Totals totals, List<SaleInfo> sales
) {
    public record CustomerInfo(Long id, String fullName, String phone, String alternatePhone, String address) {}
    public record Totals(BigDecimal totalAgreedAmount, BigDecimal totalDownPayment, BigDecimal totalFinancedAmount, BigDecimal totalPaid, BigDecimal totalOutstandingBalance, long lotsWithBalance) {}
    public record SaleInfo(Long saleId, String folio, LocalDate saleDate, List<LotInfo> lots) {}
    public record LotInfo(Long saleLotId, Long lotId, String code, String blockCode, String lotNumber, BigDecimal areaM2, BigDecimal frontMeters, BigDecimal depthMeters, BigDecimal agreedPrice, BigDecimal downPayment, BigDecimal financedAmount, BigDecimal totalPaid, BigDecimal outstandingBalance, SaleLotStatus status, List<InstallmentInfo> installments) {}
    public record InstallmentInfo(Long id, int installmentNumber, LocalDate paymentMonth, BigDecimal amount, BigDecimal paidAmount, BigDecimal outstandingAmount, SaleInstallmentStatus status) {}
}
