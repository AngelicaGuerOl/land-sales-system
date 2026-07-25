package com.angelica.landsalesbackend.payment.dto;

import com.angelica.landsalesbackend.payment.entity.PaymentMethod;
import com.angelica.landsalesbackend.sale.entity.SaleInstallmentStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record PaymentDetailResponse(
        Long id, Long paymentNumber, LocalDate paymentDate, CustomerInfo customer,
        PaymentMethod paymentMethod, String reference, BigDecimal totalAmount,
        UserInfo receivedBy, LocalDateTime createdAt, List<AllocationInfo> allocations
) {
    public record CustomerInfo(Long id, String fullName, String phone) {}
    public record UserInfo(Long id, String fullName, String username) {}
    public record AllocationInfo(Long saleLotId, String lotCode, String saleFolio, BigDecimal amount, BigDecimal balanceBefore, BigDecimal balanceAfter, List<InstallmentAllocationInfo> installments) {}
    public record InstallmentAllocationInfo(Long installmentId, int installmentNumber, LocalDate paymentMonth, BigDecimal amount, BigDecimal balanceBefore, BigDecimal balanceAfter, SaleInstallmentStatus status) {}
}
