package com.angelica.landsalesbackend.auth.dto;

public record CurrentUserResponse(
        Long id,
        String username,
        String fullName
) {
}
