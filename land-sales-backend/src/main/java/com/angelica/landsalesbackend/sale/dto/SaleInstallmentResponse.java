package com.angelica.landsalesbackend.sale.dto;

import com.angelica.landsalesbackend.sale.entity.SaleInstallmentStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record SaleInstallmentResponse(int installmentNumber, LocalDate paymentMonth, BigDecimal amount, BigDecimal paidAmount, SaleInstallmentStatus status) {}
