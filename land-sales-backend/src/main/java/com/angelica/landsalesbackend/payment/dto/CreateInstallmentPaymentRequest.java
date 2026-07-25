package com.angelica.landsalesbackend.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateInstallmentPaymentRequest(
        @NotNull Long installmentId,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount
) {}
