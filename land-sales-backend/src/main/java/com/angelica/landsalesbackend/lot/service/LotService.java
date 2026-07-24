package com.angelica.landsalesbackend.lot.service;

import com.angelica.landsalesbackend.lot.dto.LotResponse;
import com.angelica.landsalesbackend.lot.entity.LotStatus;
import com.angelica.landsalesbackend.lot.repository.LotRepository;
import com.angelica.landsalesbackend.shared.exception.ResourceNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LotService {

    private final LotRepository lotRepository;

    public LotService(LotRepository lotRepository) {
        this.lotRepository = lotRepository;
    }

    @Transactional(readOnly = true)
    public List<LotResponse> findLots(Long lotificationId, Long blockId, LotStatus status, String search) {
        String normalizedSearch = search == null || search.isBlank() ? null : search.trim();
        return lotRepository.findLots(lotificationId, blockId, status, normalizedSearch);
    }

    @Transactional(readOnly = true)
    public LotResponse getLot(Long id) {
        return lotRepository.findLotResponseById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lot not found"));
    }
}
