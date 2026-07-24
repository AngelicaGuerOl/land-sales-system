package com.angelica.landsalesbackend.lot.service;

import com.angelica.landsalesbackend.lot.dto.ChangeLotStatusRequest;
import com.angelica.landsalesbackend.lot.dto.CreateLotRequest;
import com.angelica.landsalesbackend.lot.dto.LotResponse;
import com.angelica.landsalesbackend.lot.dto.LotPriceHistoryResponse;
import com.angelica.landsalesbackend.lot.dto.UpdateLotRequest;
import com.angelica.landsalesbackend.security.AuthenticatedUser;
import com.angelica.landsalesbackend.lot.entity.LotStatus;
import java.util.List;

public interface LotService {

    List<LotResponse> findLots(Long lotificationId, Long blockId, LotStatus status, String search);

    LotResponse getLot(Long id);

    LotResponse createLot(CreateLotRequest request);

    LotResponse updateLot(Long id, UpdateLotRequest request, AuthenticatedUser authenticatedUser);

    LotResponse changeStatus(Long id, ChangeLotStatusRequest request);

    List<LotPriceHistoryResponse> getPriceHistory(Long id);
}
