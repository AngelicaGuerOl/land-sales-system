package com.angelica.landsalesbackend.lot.service;

import com.angelica.landsalesbackend.block.entity.LandBlock;
import com.angelica.landsalesbackend.block.exception.BlockNotFoundException;
import com.angelica.landsalesbackend.block.repository.BlockRepository;
import com.angelica.landsalesbackend.lot.dto.ChangeLotStatusRequest;
import com.angelica.landsalesbackend.lot.dto.CreateLotRequest;
import com.angelica.landsalesbackend.lot.dto.LotPriceHistoryResponse;
import com.angelica.landsalesbackend.lot.dto.LotResponse;
import com.angelica.landsalesbackend.lot.dto.UpdateLotRequest;
import com.angelica.landsalesbackend.lot.entity.Lot;
import com.angelica.landsalesbackend.lot.entity.LotPriceHistory;
import com.angelica.landsalesbackend.lot.entity.LotStatus;
import com.angelica.landsalesbackend.lot.exception.LotConflictException;
import com.angelica.landsalesbackend.lot.exception.LotNotFoundException;
import com.angelica.landsalesbackend.lot.exception.LotValidationException;
import com.angelica.landsalesbackend.lot.mapper.LotMapper;
import com.angelica.landsalesbackend.lot.repository.LotPriceHistoryRepository;
import com.angelica.landsalesbackend.lot.repository.LotRepository;
import com.angelica.landsalesbackend.security.AuthenticatedUser;
import com.angelica.landsalesbackend.shared.exception.UnauthorizedException;
import com.angelica.landsalesbackend.user.entity.User;
import com.angelica.landsalesbackend.user.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LotServiceImpl implements LotService {

    private final LotRepository lotRepository;
    private final LotMapper lotMapper;
    private final BlockRepository blockRepository;
    private final LotPriceHistoryRepository lotPriceHistoryRepository;
    private final UserRepository userRepository;

    public LotServiceImpl(
            LotRepository lotRepository,
            LotMapper lotMapper,
            BlockRepository blockRepository,
            LotPriceHistoryRepository lotPriceHistoryRepository,
            UserRepository userRepository
    ) {
        this.lotRepository = lotRepository;
        this.lotMapper = lotMapper;
        this.blockRepository = blockRepository;
        this.lotPriceHistoryRepository = lotPriceHistoryRepository;
        this.userRepository = userRepository;
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

    @Override
    @Transactional
    public LotResponse createLot(CreateLotRequest request) {
        LandBlock block = findBlock(request.blockId());
        String lotNumber = normalizeLotNumber(request.lotNumber());
        String code = resolveCode(block, lotNumber, request.code());
        ensureUniqueLot(block.getId(), lotNumber, code, null);

        Lot lot = new Lot();
        lot.setBlock(block);
        lot.setLotNumber(lotNumber);
        lot.setCode(code);
        lot.setAreaM2(request.areaM2());
        lot.setFrontMeters(request.frontMeters());
        lot.setDepthMeters(request.depthMeters());
        lot.setCurrentPrice(request.currentPrice());
        lot.setStatus(LotStatus.AVAILABLE);
        lot.setLocationReference(request.locationReference());
        lot.setNotes(request.notes());
        lotRepository.save(lot);
        return getLot(lot.getId());
    }

    @Override
    @Transactional
    public LotResponse updateLot(Long id, UpdateLotRequest request, AuthenticatedUser authenticatedUser) {
        Lot lot = findLot(id);
        ensureVersion(lot, request.version());

        if (lot.getStatus() == LotStatus.SOLD) {
            if (!Objects.equals(lot.getBlock().getId(), request.blockId())
                    || !lot.getLotNumber().equals(normalizeLotNumber(request.lotNumber()))
                    || (!isBlank(request.code()) && !lot.getCode().equals(request.code().trim()))
                    || !samePrice(lot.getCurrentPrice(), request.currentPrice())
                    || !Objects.equals(lot.getAreaM2(), request.areaM2())
                    || !Objects.equals(lot.getFrontMeters(), request.frontMeters())
                    || !Objects.equals(lot.getDepthMeters(), request.depthMeters())) {
                throw new LotConflictException("Sold lots only allow locationReference and notes to be edited");
            }
            lot.setLocationReference(request.locationReference());
            lot.setNotes(request.notes());
        } else {
            LandBlock block = findBlock(request.blockId());
            String lotNumber = normalizeLotNumber(request.lotNumber());
            String code = resolveCode(block, lotNumber, request.code());
            ensureUniqueLot(block.getId(), lotNumber, code, lot.getId());

            boolean priceChanged = !samePrice(lot.getCurrentPrice(), request.currentPrice());
            if (priceChanged && isBlank(request.priceChangeReason())) {
                throw new LotValidationException("A reason is required when the price changes");
            }

            BigDecimal previousPrice = lot.getCurrentPrice();
            lot.setBlock(block);
            lot.setLotNumber(lotNumber);
            lot.setCode(code);
            lot.setAreaM2(request.areaM2());
            lot.setFrontMeters(request.frontMeters());
            lot.setDepthMeters(request.depthMeters());
            lot.setCurrentPrice(request.currentPrice());
            lot.setLocationReference(request.locationReference());
            lot.setNotes(request.notes());

            if (priceChanged) {
                lotPriceHistoryRepository.save(priceHistory(lot, previousPrice, request.currentPrice(), request.priceChangeReason(), authenticatedUser));
            }
        }

        lotRepository.save(lot);
        return getLot(id);
    }

    @Override
    @Transactional
    public LotResponse changeStatus(Long id, ChangeLotStatusRequest request) {
        Lot lot = findLot(id);
        ensureVersion(lot, request.version());
        if (lot.getStatus() == LotStatus.SOLD) {
            throw new LotConflictException("Sold lots cannot change status manually");
        }
        if (!isManualStatus(request.status()) || request.status() == lot.getStatus()) {
            throw new LotConflictException("Only AVAILABLE to BLOCKED and BLOCKED to AVAILABLE are allowed");
        }
        lot.setStatus(request.status());
        lotRepository.save(lot);
        return getLot(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LotPriceHistoryResponse> getPriceHistory(Long id) {
        if (!lotRepository.existsById(id)) {
            throw new LotNotFoundException();
        }
        return lotPriceHistoryRepository.findResponsesByLotId(id);
    }

    private Lot findLot(Long id) {
        return lotRepository.findById(id).orElseThrow(LotNotFoundException::new);
    }

    private LandBlock findBlock(Long id) {
        return blockRepository.findById(id).orElseThrow(BlockNotFoundException::new);
    }

    private void ensureUniqueLot(Long blockId, String lotNumber, String code, Long currentLotId) {
        boolean duplicateNumber = currentLotId == null
                ? lotRepository.existsByBlock_IdAndLotNumber(blockId, lotNumber)
                : lotRepository.existsByBlock_IdAndLotNumberAndIdNot(blockId, lotNumber, currentLotId);
        boolean duplicateCode = currentLotId == null
                ? lotRepository.existsByCode(code)
                : lotRepository.existsByCodeAndIdNot(code, currentLotId);
        if (duplicateNumber || duplicateCode) {
            throw new LotConflictException("The lot number or generated code already exists");
        }
    }

    private void ensureVersion(Lot lot, Long version) {
        if (!Objects.equals(lot.getVersion(), version)) {
            throw new LotConflictException("The lot was modified by another user");
        }
    }

    private LotPriceHistory priceHistory(
            Lot lot,
            BigDecimal previousPrice,
            BigDecimal newPrice,
            String reason,
            AuthenticatedUser authenticatedUser
    ) {
        if (authenticatedUser == null) {
            throw new UnauthorizedException("Authentication is required");
        }
        User user = userRepository.findById(authenticatedUser.id())
                .orElseThrow(() -> new UnauthorizedException("Invalid user"));
        LotPriceHistory history = new LotPriceHistory();
        history.setLot(lot);
        history.setPreviousPrice(previousPrice);
        history.setNewPrice(newPrice);
        history.setReason(reason.trim());
        history.setChangedBy(user);
        return history;
    }

    private String normalizeLotNumber(String lotNumber) {
        return lotNumber.trim();
    }

    private String buildCode(LandBlock block, String lotNumber) {
        String code = block.getCode() + "-" + lotNumber;
        if (code.length() > 100) {
            throw new LotValidationException("The generated code cannot exceed 100 characters");
        }
        return code;
    }

    private String resolveCode(LandBlock block, String lotNumber, String requestedCode) {
        return isBlank(requestedCode) ? buildCode(block, lotNumber) : requestedCode.trim();
    }

    private boolean samePrice(BigDecimal left, BigDecimal right) {
        if (left == null || right == null) {
            return left == null && right == null;
        }
        return left.compareTo(right) == 0;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private boolean isManualStatus(LotStatus status) {
        return status == LotStatus.AVAILABLE || status == LotStatus.BLOCKED;
    }
}
