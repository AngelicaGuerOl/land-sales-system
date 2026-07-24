package com.angelica.landsalesbackend.block.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record BulkLotRequest(
        @NotNull @Positive Integer startNumber,
        @NotNull @Positive Integer endNumber,
        @NotBlank @Size(max = 20) String numberPrefix,
        @NotNull @Min(0) @Max(10) Integer numberPadding,
        @DecimalMin("0.0") BigDecimal areaM2,
        @DecimalMin("0.0") BigDecimal frontMeters,
        @DecimalMin("0.0") BigDecimal depthMeters,
        @DecimalMin("0.0") BigDecimal currentPrice,
        @Size(max = 2000) String locationReference,
        @Size(max = 5000) String notes
) {
}
