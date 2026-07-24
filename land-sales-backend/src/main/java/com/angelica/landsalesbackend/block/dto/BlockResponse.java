package com.angelica.landsalesbackend.block.dto;

import java.math.BigDecimal;

public record BlockResponse(
        Long id,
        Long lotificationId,
        String lotificationName,
        String code,
        BigDecimal areaM2,
        Integer plannedLotCount,
        Long registeredLotCount,
        String notes,
        java.time.OffsetDateTime createdAt,
        java.time.OffsetDateTime updatedAt
) {
}
