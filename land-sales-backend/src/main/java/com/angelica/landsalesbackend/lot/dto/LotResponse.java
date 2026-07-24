package com.angelica.landsalesbackend.lot.dto;

import com.angelica.landsalesbackend.lot.entity.LotStatus;
import java.math.BigDecimal;

public record LotResponse(
        Long id,
        Long blockId,
        String blockCode,
        String lotNumber,
        String code,
        BigDecimal areaM2,
        BigDecimal frontMeters,
        BigDecimal depthMeters,
        BigDecimal price,
        LotStatus status,
        String locationReference,
        String notes,
        Long version,
        String svgPath,
        BigDecimal labelX,
        BigDecimal labelY,
        BigDecimal rotation
) {
}
