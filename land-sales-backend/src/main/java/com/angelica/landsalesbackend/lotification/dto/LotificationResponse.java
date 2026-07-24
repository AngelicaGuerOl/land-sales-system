package com.angelica.landsalesbackend.lotification.dto;

public record LotificationResponse(
        Long id,
        String name,
        String description,
        String address,
        String planStorageKey,
        String svgViewBox,
        boolean active
) {
}
