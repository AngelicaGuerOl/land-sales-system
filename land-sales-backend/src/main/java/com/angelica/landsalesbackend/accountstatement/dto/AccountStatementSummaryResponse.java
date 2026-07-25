package com.angelica.landsalesbackend.accountstatement.dto;

import java.math.BigDecimal;

public record AccountStatementSummaryResponse(
        Long customerId, String customerName, String phone, long financedLotCount,
        BigDecimal totalAgreedAmount, BigDecimal totalDownPayment, BigDecimal totalPaid,
        BigDecimal totalOutstandingBalance
) {}
