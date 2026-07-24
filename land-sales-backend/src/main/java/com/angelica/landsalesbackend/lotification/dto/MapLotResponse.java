package com.angelica.landsalesbackend.lotification.dto;

import com.angelica.landsalesbackend.lot.entity.LotStatus;
import java.math.BigDecimal;

public record MapLotResponse(
        Long id,
        String code,
        Long blockId,
        String blockCode,
        String lotNumber,
        BigDecimal areaM2,
        BigDecimal frontMeters,
        BigDecimal depthMeters,
        BigDecimal price,
        LotStatus status,
        String svgPath,
        BigDecimal labelX,
        BigDecimal labelY,
        BigDecimal rotation
) {
}
