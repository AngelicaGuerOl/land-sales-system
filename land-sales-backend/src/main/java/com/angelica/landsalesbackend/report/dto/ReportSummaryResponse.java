package com.angelica.landsalesbackend.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ReportSummaryResponse(
        LocalDate dateFrom,
        LocalDate dateTo,
        long salesCount,
        long soldLotsCount,
        BigDecimal totalAgreedAmount,
        BigDecimal totalDownPayment,
        BigDecimal totalFinancedAmount,
        BigDecimal laterPaymentsAmount,
        BigDecimal totalCollectedAmount,
        BigDecimal outstandingBalance,
        List<BlockSummary> byBlock
) {
    public record BlockSummary(String blockCode, long soldLotsCount, BigDecimal totalAgreedAmount) {}
}
