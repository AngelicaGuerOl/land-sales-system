package com.angelica.landsalesbackend.payment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreatePaymentAllocationRequest(
        @NotNull Long saleLotId,
        @NotEmpty List<@Valid CreateInstallmentPaymentRequest> installments
) {}
