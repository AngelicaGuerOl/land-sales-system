package com.angelica.landsalesbackend.sale.controller;

import com.angelica.landsalesbackend.sale.dto.CreateSaleRequest;
import com.angelica.landsalesbackend.sale.dto.SaleDetailResponse;
import com.angelica.landsalesbackend.sale.dto.SaleSummaryResponse;
import com.angelica.landsalesbackend.sale.entity.SaleStatus;
import com.angelica.landsalesbackend.sale.service.SaleService;
import com.angelica.landsalesbackend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/sales")
public class SaleController {
    private final SaleService saleService;
    public SaleController(SaleService saleService) { this.saleService = saleService; }
    @PostMapping public ResponseEntity<SaleDetailResponse> create(@Valid @RequestBody CreateSaleRequest request, @AuthenticationPrincipal AuthenticatedUser user) { return ResponseEntity.status(HttpStatus.CREATED).body(saleService.create(request, user)); }
    @GetMapping public Page<SaleSummaryResponse> find(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size, @RequestParam(required = false) String search, @RequestParam(required = false) SaleStatus status, @RequestParam(required = false) LocalDate dateFrom, @RequestParam(required = false) LocalDate dateTo) { Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 100), Sort.by(Sort.Order.desc("saleDate"), Sort.Order.desc("createdAt"))); return saleService.find(search, status, dateFrom, dateTo, pageable); }
    @GetMapping("/{id}") public SaleDetailResponse get(@PathVariable Long id) { return saleService.get(id); }
}
