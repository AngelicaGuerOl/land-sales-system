package com.angelica.landsalesbackend.payment.service;

import com.angelica.landsalesbackend.payment.dto.CreatePaymentRequest;
import com.angelica.landsalesbackend.payment.dto.PaymentDetailResponse;
import com.angelica.landsalesbackend.payment.dto.PaymentSummaryResponse;
import com.angelica.landsalesbackend.payment.entity.PaymentMethod;
import com.angelica.landsalesbackend.security.AuthenticatedUser;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentService {
    PaymentDetailResponse create(CreatePaymentRequest request, AuthenticatedUser authenticatedUser);
    Page<PaymentSummaryResponse> find(String search, PaymentMethod paymentMethod, LocalDate dateFrom, LocalDate dateTo, Pageable pageable);
    PaymentDetailResponse get(Long id);
}
