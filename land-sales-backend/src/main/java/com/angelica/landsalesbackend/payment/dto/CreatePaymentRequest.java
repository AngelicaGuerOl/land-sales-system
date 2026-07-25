package com.angelica.landsalesbackend.payment.dto;

import com.angelica.landsalesbackend.payment.entity.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreatePaymentRequest(
        @NotNull Long customerId,
        @NotNull PaymentMethod paymentMethod,
        @Size(max = 100) String reference,
        @NotEmpty List<@Valid CreatePaymentAllocationRequest> allocations
) {}
