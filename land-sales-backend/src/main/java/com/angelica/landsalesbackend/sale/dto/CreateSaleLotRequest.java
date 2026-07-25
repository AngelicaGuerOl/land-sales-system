package com.angelica.landsalesbackend.sale.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateSaleLotRequest(
        @NotNull Long lotId,
        @NotNull BigDecimal agreedPrice,
        @NotNull BigDecimal downPayment,
        @NotNull Integer installmentCount
) {}
