package com.angelica.landsalesbackend.lotification.service;

import com.angelica.landsalesbackend.block.repository.BlockRepository;
import com.angelica.landsalesbackend.lot.repository.LotRepository;
import com.angelica.landsalesbackend.lotification.dto.LotificationMapResponse;
import com.angelica.landsalesbackend.lotification.dto.LotificationResponse;
import com.angelica.landsalesbackend.lotification.dto.MapLotificationResponse;
import com.angelica.landsalesbackend.lotification.entity.Lotification;
import com.angelica.landsalesbackend.lotification.repository.LotificationRepository;
import com.angelica.landsalesbackend.shared.exception.ResourceNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LotificationService {

    private final LotificationRepository lotificationRepository;
    private final BlockRepository blockRepository;
    private final LotRepository lotRepository;

    public LotificationService(
            LotificationRepository lotificationRepository,
            BlockRepository blockRepository,
            LotRepository lotRepository
    ) {
        this.lotificationRepository = lotificationRepository;
        this.blockRepository = blockRepository;
        this.lotRepository = lotRepository;
    }

    @Transactional(readOnly = true)
    public List<LotificationResponse> findAll() {
        return lotificationRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public LotificationMapResponse getMap(Long id) {
        Lotification lotification = lotificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lotification not found"));

        return new LotificationMapResponse(
                new MapLotificationResponse(lotification.getId(), lotification.getName(), lotification.getSvgViewBox()),
                blockRepository.findMapBlocks(id),
                lotRepository.findMapLots(id)
        );
    }

    private LotificationResponse toResponse(Lotification lotification) {
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
}
