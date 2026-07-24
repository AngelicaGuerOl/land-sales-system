package com.angelica.landsalesbackend.lot.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record LotPriceHistoryResponse(
        Long id,
        BigDecimal previousPrice,
        BigDecimal newPrice,
        String reason,
        String changedBy,
        OffsetDateTime changedAt
) {
}
