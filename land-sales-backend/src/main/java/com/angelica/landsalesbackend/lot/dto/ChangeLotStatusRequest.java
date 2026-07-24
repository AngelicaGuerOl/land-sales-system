package com.angelica.landsalesbackend.lot.dto;

import com.angelica.landsalesbackend.lot.entity.LotStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ChangeLotStatusRequest(
        @NotNull LotStatus status,
        @NotNull @PositiveOrZero Long version
) {
}
