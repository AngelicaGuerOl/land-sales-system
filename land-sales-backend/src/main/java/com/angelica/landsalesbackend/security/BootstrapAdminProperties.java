package com.angelica.landsalesbackend.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.bootstrap-admin")
public record BootstrapAdminProperties(
        String username,
        String password,
        String fullName
) {

    public boolean isConfigured() {
        return hasText(username) && hasText(password) && hasText(fullName);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
