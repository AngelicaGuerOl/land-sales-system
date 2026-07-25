package com.angelica.landsalesbackend.sale.service;

import com.angelica.landsalesbackend.sale.dto.CreateSaleRequest;
import com.angelica.landsalesbackend.sale.dto.SaleDetailResponse;
import com.angelica.landsalesbackend.sale.dto.SaleSummaryResponse;
import com.angelica.landsalesbackend.sale.entity.SaleStatus;
import com.angelica.landsalesbackend.security.AuthenticatedUser;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SaleService {
    SaleDetailResponse create(CreateSaleRequest request, AuthenticatedUser authenticatedUser);
    Page<SaleSummaryResponse> find(String search, SaleStatus status, LocalDate dateFrom, LocalDate dateTo, Pageable pageable);
    SaleDetailResponse get(Long id);
}
