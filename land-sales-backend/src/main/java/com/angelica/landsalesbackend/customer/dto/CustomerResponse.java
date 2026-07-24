package com.angelica.landsalesbackend.customer.dto;

import java.time.LocalDateTime;

public record CustomerResponse(
        Long id,
        String fullName,
        String phone,
        String alternatePhone,
        String address,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
