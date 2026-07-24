package com.angelica.landsalesbackend.security;

public class JwtException extends RuntimeException {

    public JwtException(String message) {
        super(message);
    }
}
