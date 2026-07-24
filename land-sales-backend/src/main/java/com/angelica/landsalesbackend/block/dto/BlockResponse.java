package com.angelica.landsalesbackend.block.dto;

import java.math.BigDecimal;

public record BlockResponse(
        Long id,
        Long lotificationId,
        String code,
        BigDecimal areaM2,
        Integer lotCount,
        String referenceColor
) {
}
