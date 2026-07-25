package com.angelica.landsalesbackend.payment.dto;

import com.angelica.landsalesbackend.payment.entity.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record PaymentSummaryResponse(
        Long id, Long paymentNumber, LocalDate paymentDate, Long customerId, String customerName,
        String customerPhone, List<String> lotCodes, BigDecimal totalAmount,
        PaymentMethod paymentMethod, String receivedByName, LocalDateTime createdAt
) {}
