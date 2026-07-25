package com.angelica.landsalesbackend.block.service;

import com.angelica.landsalesbackend.block.dto.BlockResponse;
import com.angelica.landsalesbackend.block.dto.BulkLotRequest;
import com.angelica.landsalesbackend.block.dto.BulkLotResponse;
import com.angelica.landsalesbackend.block.dto.CreateBlockRequest;
import com.angelica.landsalesbackend.block.dto.UpdateBlockRequest;
import com.angelica.landsalesbackend.block.entity.LandBlock;
import com.angelica.landsalesbackend.block.exception.BlockConflictException;
import com.angelica.landsalesbackend.block.exception.BulkLotConflictException;
import com.angelica.landsalesbackend.block.exception.BlockNotFoundException;
import com.angelica.landsalesbackend.block.repository.BlockRepository;
import com.angelica.landsalesbackend.lot.repository.LotRepository;
import com.angelica.landsalesbackend.lot.dto.LotResponse;
import com.angelica.landsalesbackend.lot.entity.Lot;
import com.angelica.landsalesbackend.lot.entity.LotStatus;
import java.util.List;
import java.util.ArrayList;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BlockServiceImpl implements BlockService {

    private final BlockRepository blockRepository;
    private final LotRepository lotRepository;

    public BlockServiceImpl(BlockRepository blockRepository, LotRepository lotRepository) {
        this.blockRepository = blockRepository;
        this.lotRepository = lotRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlockResponse> findBlocks(Long lotificationId) {
        return blockRepository.findBlocks(lotificationId);
    }

    @Override
    @Transactional(readOnly = true)
    public BlockResponse getBlock(Long id) {
        return blockRepository.findBlockResponseById(id).orElseThrow(BlockNotFoundException::new);
    }

    @Override
    @Transactional
    public BlockResponse createBlock(CreateBlockRequest request) {
        String code = normalizeCode(request.code());
        ensureUnique(code, null);
        LandBlock block = new LandBlock();
        block.setCode(code);
        block.setAreaM2(request.areaM2());
        block.setLotCount(request.plannedLotCount());
        block.setNotes(request.notes());
        blockRepository.save(block);
        return getBlock(block.getId());
    }

    @Override
    @Transactional
    public BlockResponse updateBlock(Long id, UpdateBlockRequest request) {
        LandBlock block = blockRepository.findById(id).orElseThrow(BlockNotFoundException::new);
        String code = normalizeCode(request.code());
        long registered = lotRepository.countByBlock_Id(id);
        if (registered > 0 && !block.getCode().equals(code)) {
            throw new BlockConflictException("A block with lots cannot change its code");
        }
        ensureUnique(code, id);
        block.setCode(code);
        block.setAreaM2(request.areaM2());
        block.setLotCount(request.plannedLotCount());
        block.setNotes(request.notes());
        blockRepository.save(block);
        return getBlock(id);
    }

    @Override
    @Transactional
    public void deleteBlock(Long id) {
        if (!blockRepository.existsById(id)) throw new BlockNotFoundException();
        if (lotRepository.countByBlock_Id(id) > 0) throw new BlockConflictException("A block with lots cannot be deleted");
        blockRepository.deleteById(id);
    }

    @Override
    @Transactional
    public BulkLotResponse generateLots(Long blockId, BulkLotRequest request) {
        LandBlock block = blockRepository.findById(blockId).orElseThrow(BlockNotFoundException::new);
        if (request.endNumber() < request.startNumber()) {
            throw new BlockConflictException("The ending number must be greater than or equal to the starting number");
        }
        long requestedCount = (long) request.endNumber() - request.startNumber() + 1;
        if (requestedCount > block.getLotCount()) {
            throw new BlockConflictException("The requested range exceeds the planned lot count");
        }

        List<String> lotNumbers = new ArrayList<>();
        List<String> codes = new ArrayList<>();
        for (long number = request.startNumber(); number <= request.endNumber(); number++) {
            String lotNumber = request.numberPrefix() + String.format(Locale.ROOT, "%0" + request.numberPadding() + "d", number);
            lotNumbers.add(lotNumber);
            codes.add(block.getCode() + "-" + lotNumber);
        }

        List<String> conflicts = new ArrayList<>();
        lotRepository.findByBlock_IdAndLotNumberIn(blockId, lotNumbers)
                .forEach(lot -> conflicts.add(lot.getLotNumber()));
        lotRepository.findByCodeIn(codes)
                .forEach(lot -> conflicts.add(lot.getCode()));
        if (!conflicts.isEmpty()) {
            throw new BulkLotConflictException("Some lots already exist", conflicts.stream().distinct().toList());
        }

        List<Lot> lots = new ArrayList<>();
        for (int index = 0; index < lotNumbers.size(); index++) {
            Lot lot = new Lot();
            lot.setBlock(block);
            lot.setLotNumber(lotNumbers.get(index));
            lot.setCode(codes.get(index));
            lot.setAreaM2(request.areaM2());
            lot.setFrontMeters(request.frontMeters());
            lot.setDepthMeters(request.depthMeters());
            lot.setCurrentPrice(request.currentPrice());
            lot.setLocationReference(request.locationReference());
            lot.setNotes(request.notes());
            lot.setStatus(LotStatus.AVAILABLE);
            lots.add(lot);
        }
        lotRepository.saveAllAndFlush(lots);
        List<LotResponse> createdLots = lots.stream()
                .map(lot -> lotRepository.findLotResponseById(lot.getId()).orElseThrow())
                .toList();
        return new BulkLotResponse(block.getId(), block.getCode(), lots.size(), lots.size(), createdLots);
    }

    private void ensureUnique(String code, Long currentId) {
        boolean duplicate = currentId == null
                ? blockRepository.existsByCode(code)
                : blockRepository.existsByCodeAndIdNot(code, currentId);
        if (duplicate) throw new BlockConflictException("The block code already exists");
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(java.util.Locale.ROOT);
    }
}
