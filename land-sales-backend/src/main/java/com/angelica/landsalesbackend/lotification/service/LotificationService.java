package com.angelica.landsalesbackend.lotification.service;

import com.angelica.landsalesbackend.lotification.dto.LotificationMapResponse;
import com.angelica.landsalesbackend.lotification.dto.LotificationResponse;
import java.util.List;

public interface LotificationService {

    List<LotificationResponse> findAll();

    LotificationMapResponse getMap(Long id);
}
