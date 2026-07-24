package com.angelica.landsalesbackend.lotification.mapper;

import com.angelica.landsalesbackend.lotification.dto.LotificationResponse;
import com.angelica.landsalesbackend.lotification.dto.MapLotificationResponse;
import com.angelica.landsalesbackend.lotification.entity.Lotification;
import org.springframework.stereotype.Component;

@Component
public class LotificationMapper {

    public LotificationResponse toResponse(Lotification lotification) {
        return new LotificationResponse(
                lotification.getId(),
                lotification.getName(),
                lotification.getDescription(),
                lotification.getAddress(),
                lotification.getPlanStorageKey(),
                lotification.getSvgViewBox(),
                lotification.isActive()
        );
    }

    public MapLotificationResponse toMapLotificationResponse(Lotification lotification) {
        return new MapLotificationResponse(
                lotification.getId(),
                lotification.getName(),
                lotification.getSvgViewBox()
        );
    }
}
