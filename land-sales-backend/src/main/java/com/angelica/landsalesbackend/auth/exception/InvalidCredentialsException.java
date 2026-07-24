package com.angelica.landsalesbackend.auth.exception;

import com.angelica.landsalesbackend.shared.exception.UnauthorizedException;

public class InvalidCredentialsException extends UnauthorizedException {

    public InvalidCredentialsException() {
        super("Invalid credentials");
    }
}
