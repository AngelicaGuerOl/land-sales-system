package com.angelica.landsalesbackend.lotification.dto;

import java.util.List;

public record LotificationMapResponse(
        MapLotificationResponse lotification,
        List<MapBlockResponse> blocks,
        List<MapLotResponse> lots
) {
}
