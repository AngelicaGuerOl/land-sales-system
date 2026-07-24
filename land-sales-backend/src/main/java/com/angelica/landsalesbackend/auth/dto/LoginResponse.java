package com.angelica.landsalesbackend.auth.dto;

public record LoginResponse(
        String tokenType,
        String accessToken,
        long expiresInSeconds,
        CurrentUserResponse user
) {
}
