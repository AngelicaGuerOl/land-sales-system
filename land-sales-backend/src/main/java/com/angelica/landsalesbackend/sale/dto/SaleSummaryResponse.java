package com.angelica.landsalesbackend.sale.dto;

import com.angelica.landsalesbackend.sale.entity.SaleStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record SaleSummaryResponse(
        Long id, String folio, LocalDate saleDate, Long customerId, String customerName,
        String customerPhone, int lotCount, List<String> lotCodes,
        BigDecimal totalAgreedPrice, BigDecimal totalDownPayment, BigDecimal totalFinancedAmount,
        SaleStatus status, LocalDateTime createdAt
) {}
