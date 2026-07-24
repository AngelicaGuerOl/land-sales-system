package com.angelica.landsalesbackend.block.mapper;

import com.angelica.landsalesbackend.block.dto.BlockResponse;
import com.angelica.landsalesbackend.block.entity.LandBlock;
import org.springframework.stereotype.Component;

@Component
public class BlockMapper {

    public BlockResponse toResponse(LandBlock block) {
        return new BlockResponse(
                block.getId(),
                block.getLotification().getId(),
                block.getCode(),
                block.getAreaM2(),
                block.getLotCount(),
                block.getReferenceColor()
        );
    }
}
