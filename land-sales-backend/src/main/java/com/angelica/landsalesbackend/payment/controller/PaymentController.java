package com.angelica.landsalesbackend.payment.controller;

import com.angelica.landsalesbackend.payment.dto.*;
import com.angelica.landsalesbackend.payment.entity.PaymentMethod;
import com.angelica.landsalesbackend.payment.service.PaymentService;
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

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService service;
    public PaymentController(PaymentService service) { this.service = service; }
    @PostMapping public ResponseEntity<PaymentDetailResponse> create(@Valid @RequestBody CreatePaymentRequest request, @AuthenticationPrincipal AuthenticatedUser user) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, user)); }
    @GetMapping public Page<PaymentSummaryResponse> find(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size, @RequestParam(required = false) String search, @RequestParam(required = false) PaymentMethod paymentMethod, @RequestParam(required = false) LocalDate dateFrom, @RequestParam(required = false) LocalDate dateTo) { Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 100), Sort.by(Sort.Order.desc("paymentNumber"))); return service.find(search, paymentMethod, dateFrom, dateTo, pageable); }
    @GetMapping("/{id}") public PaymentDetailResponse get(@PathVariable Long id) { return service.get(id); }
}
