package com.angelica.landsalesbackend.security;

public record AuthenticatedUser(
        Long id,
        String username
) {
}
