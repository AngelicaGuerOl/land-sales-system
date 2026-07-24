package com.angelica.landsalesbackend.auth.service;

import com.angelica.landsalesbackend.auth.dto.CurrentUserResponse;
import com.angelica.landsalesbackend.auth.dto.LoginRequest;
import com.angelica.landsalesbackend.auth.dto.LoginResponse;
import com.angelica.landsalesbackend.security.AuthenticatedUser;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    CurrentUserResponse getCurrentUser(AuthenticatedUser authenticatedUser);
}
