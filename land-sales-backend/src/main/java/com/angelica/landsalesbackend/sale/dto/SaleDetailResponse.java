package com.angelica.landsalesbackend.sale.dto;

import com.angelica.landsalesbackend.sale.entity.SaleStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record SaleDetailResponse(
        Long id, String folio, LocalDate saleDate, CustomerInfo customer, UserInfo createdBy,
        BigDecimal totalAgreedPrice, BigDecimal totalDownPayment, BigDecimal totalFinancedAmount,
        SaleStatus status, LocalDateTime createdAt, LocalDateTime updatedAt, List<SaleLotResponse> lots
) {
    public record CustomerInfo(Long id, String fullName, String phone, String alternatePhone, String address) {}
    public record UserInfo(Long id, String fullName, String username) {}
}
