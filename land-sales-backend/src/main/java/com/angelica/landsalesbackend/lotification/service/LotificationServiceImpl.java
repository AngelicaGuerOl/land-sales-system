package com.angelica.landsalesbackend.lotification.service;

import com.angelica.landsalesbackend.block.repository.BlockRepository;
import com.angelica.landsalesbackend.lot.repository.LotRepository;
import com.angelica.landsalesbackend.lotification.dto.LotificationMapResponse;
import com.angelica.landsalesbackend.lotification.dto.LotificationResponse;
import com.angelica.landsalesbackend.lotification.entity.Lotification;
import com.angelica.landsalesbackend.lotification.exception.LotificationNotFoundException;
import com.angelica.landsalesbackend.lotification.mapper.LotificationMapper;
import com.angelica.landsalesbackend.lotification.repository.LotificationRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LotificationServiceImpl implements LotificationService {

    private final LotificationRepository lotificationRepository;
    private final BlockRepository blockRepository;
    private final LotRepository lotRepository;
    private final LotificationMapper lotificationMapper;

    public LotificationServiceImpl(
            LotificationRepository lotificationRepository,
            BlockRepository blockRepository,
            LotRepository lotRepository,
            LotificationMapper lotificationMapper
    ) {
        this.lotificationRepository = lotificationRepository;
        this.blockRepository = blockRepository;
        this.lotRepository = lotRepository;
        this.lotificationMapper = lotificationMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LotificationResponse> findAll() {
        return lotificationRepository.findAllByOrderByNameAsc()
                .stream()
                .map(lotificationMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LotificationMapResponse getMap(Long id) {
        Lotification lotification = lotificationRepository.findById(id)
                .orElseThrow(LotificationNotFoundException::new);

        return new LotificationMapResponse(
                lotificationMapper.toMapLotificationResponse(lotification),
                blockRepository.findMapBlocks(id),
                lotRepository.findMapLots(id)
        );
    }
}
