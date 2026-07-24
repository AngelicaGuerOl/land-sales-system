package com.angelica.landsalesbackend.lot.service;

import com.angelica.landsalesbackend.lot.dto.LotResponse;
import com.angelica.landsalesbackend.lot.entity.LotStatus;
import com.angelica.landsalesbackend.lot.exception.LotNotFoundException;
import com.angelica.landsalesbackend.lot.mapper.LotMapper;
import com.angelica.landsalesbackend.lot.repository.LotRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LotServiceImpl implements LotService {

    private final LotRepository lotRepository;
    private final LotMapper lotMapper;

    public LotServiceImpl(LotRepository lotRepository, LotMapper lotMapper) {
        this.lotRepository = lotRepository;
        this.lotMapper = lotMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LotResponse> findLots(Long lotificationId, Long blockId, LotStatus status, String search) {
        return lotRepository.findLots(lotificationId, blockId, status, lotMapper.normalizeSearch(search));
    }

    @Override
    @Transactional(readOnly = true)
    public LotResponse getLot(Long id) {
        return lotRepository.findLotResponseById(id)
                .orElseThrow(LotNotFoundException::new);
    }
}
