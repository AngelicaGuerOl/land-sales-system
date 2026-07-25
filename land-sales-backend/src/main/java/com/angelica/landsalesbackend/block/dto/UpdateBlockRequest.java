package com.angelica.landsalesbackend.block.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateBlockRequest(
        @NotBlank @Size(max = 50) String code,
        @DecimalMin("0.0") BigDecimal areaM2,
        @NotNull @Min(0) Integer plannedLotCount,
        @Size(max = 5000) String notes
) {
}
