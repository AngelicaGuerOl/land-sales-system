package com.angelica.landsalesbackend.lot.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateLotRequest(
        @NotNull @Positive Long blockId,
        @NotBlank @Size(max = 50) String lotNumber,
        @Size(max = 100) String code,
        @DecimalMin(value = "0.0") BigDecimal areaM2,
        @DecimalMin(value = "0.0") BigDecimal frontMeters,
        @DecimalMin(value = "0.0") BigDecimal depthMeters,
        @DecimalMin(value = "0.0") BigDecimal currentPrice,
        @Size(max = 2000) String locationReference,
        @Size(max = 5000) String notes,
        @NotNull @PositiveOrZero Long version,
        @Size(max = 1000) String priceChangeReason
) {
}
