package com.angelica.landsalesbackend.sale.dto;

import com.angelica.landsalesbackend.sale.entity.SaleLotStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record SaleLotResponse(
        Long lotId, String code, String blockCode, String lotNumber, BigDecimal areaM2,
        BigDecimal agreedPrice, BigDecimal downPayment, BigDecimal financedAmount,
        BigDecimal outstandingBalance, int installmentCount, BigDecimal installmentAmount,
        LocalDate firstPaymentMonth, SaleLotStatus status, List<SaleInstallmentResponse> installments
) {}
