package com.angelica.landsalesbackend.lot.service;

import com.angelica.landsalesbackend.lot.dto.LotResponse;
import com.angelica.landsalesbackend.lot.entity.LotStatus;
import java.util.List;

public interface LotService {

    List<LotResponse> findLots(Long lotificationId, Long blockId, LotStatus status, String search);

    LotResponse getLot(Long id);
}
