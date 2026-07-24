package com.angelica.landsalesbackend.block.dto;

import com.angelica.landsalesbackend.lot.dto.LotResponse;
import java.util.List;

public record BulkLotResponse(
        Long blockId,
        String blockCode,
        int requestedCount,
        int createdCount,
        List<LotResponse> createdLots
) {
}
