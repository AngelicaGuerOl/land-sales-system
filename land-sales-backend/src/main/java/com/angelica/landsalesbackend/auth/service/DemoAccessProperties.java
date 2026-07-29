package com.angelica.landsalesbackend.auth.service;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.demo")
public record DemoAccessProperties(
        boolean enabled,
        String username
) {

    public boolean hasUsername() {
        return username != null && !username.isBlank();
    }
}
