package com.angelica.landsalesbackend.customer.dto;

import jakarta.validation.constraints.NotNull;

public record ChangeCustomerStatusRequest(@NotNull Boolean active) {
}
