package com.angelica.landsalesbackend.sale.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record CreateSaleRequest(
        @NotNull Long customerId,
        @NotNull LocalDate saleDate,
        @NotEmpty List<@Valid CreateSaleLotRequest> lots
) {}
