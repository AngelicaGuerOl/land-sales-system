package com.angelica.landsalesbackend.auth.service;

import com.angelica.landsalesbackend.auth.dto.CurrentUserResponse;
import com.angelica.landsalesbackend.auth.dto.LoginRequest;
import com.angelica.landsalesbackend.auth.dto.LoginResponse;
import com.angelica.landsalesbackend.auth.exception.InvalidCredentialsException;
import com.angelica.landsalesbackend.auth.mapper.AuthMapper;
import com.angelica.landsalesbackend.security.AuthenticatedUser;
import com.angelica.landsalesbackend.security.JwtService;
import com.angelica.landsalesbackend.shared.exception.ResourceNotFoundException;
import com.angelica.landsalesbackend.shared.exception.UnauthorizedException;
import com.angelica.landsalesbackend.user.entity.User;
import com.angelica.landsalesbackend.user.repository.UserRepository;
import java.time.OffsetDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthMapper authMapper;
    private final DemoAccessProperties demoAccessProperties;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthMapper authMapper,
            DemoAccessProperties demoAccessProperties
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authMapper = authMapper;
        this.demoAccessProperties = demoAccessProperties;
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .filter(User::isActive)
                .filter(candidate -> passwordEncoder.matches(request.password(), candidate.getPasswordHash()))
                .orElseThrow(InvalidCredentialsException::new);

        return createSession(user);
    }

    @Override
    @Transactional
    public LoginResponse loginDemo() {
        if (!demoAccessProperties.enabled()) {
            throw new ResourceNotFoundException("Resource not found");
        }
        if (!demoAccessProperties.hasUsername()) {
            throw new InvalidCredentialsException();
        }

        User user = userRepository.findByUsername(demoAccessProperties.username())
                .filter(User::isActive)
                .orElseThrow(InvalidCredentialsException::new);

        return createSession(user);
    }

    private LoginResponse createSession(User user) {
        user.setLastLoginAt(OffsetDateTime.now());
        String token = jwtService.createToken(user);

        return new LoginResponse(
                "Bearer",
                token,
                jwtService.expiration().toSeconds(),
                authMapper.toCurrentUserResponse(user)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser(AuthenticatedUser authenticatedUser) {
        if (authenticatedUser == null) {
            throw new UnauthorizedException("Authentication is required");
        }
        User user = userRepository.findById(authenticatedUser.id())
                .filter(User::isActive)
                .orElseThrow(() -> new UnauthorizedException("Invalid token"));
        return authMapper.toCurrentUserResponse(user);
    }
}
