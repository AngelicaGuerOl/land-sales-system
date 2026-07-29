package com.angelica.landsalesbackend.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.angelica.landsalesbackend.auth.dto.LoginRequest;
import com.angelica.landsalesbackend.auth.dto.LoginResponse;
import com.angelica.landsalesbackend.auth.exception.InvalidCredentialsException;
import com.angelica.landsalesbackend.auth.mapper.AuthMapper;
import com.angelica.landsalesbackend.security.JwtService;
import com.angelica.landsalesbackend.shared.exception.ResourceNotFoundException;
import com.angelica.landsalesbackend.user.entity.User;
import com.angelica.landsalesbackend.user.repository.UserRepository;
import java.time.Duration;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    UserRepository userRepository;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    JwtService jwtService;

    private final AuthMapper authMapper = new AuthMapper();

    @Test
    void demoLoginReturnsSessionWhenEnabledAndUserIsActive() {
        User demoUser = user("demo", true);
        AuthServiceImpl service = service(new DemoAccessProperties(true, "demo"));
        when(userRepository.findByUsername("demo")).thenReturn(Optional.of(demoUser));
        when(jwtService.createToken(demoUser)).thenReturn("demo-token");
        when(jwtService.expiration()).thenReturn(Duration.ofHours(2));

        LoginResponse response = service.loginDemo();

        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.accessToken()).isEqualTo("demo-token");
        assertThat(response.user().username()).isEqualTo("demo");
        assertThat(response.user().fullName()).isEqualTo("Demo User");
        assertThat(demoUser.getLastLoginAt()).isNotNull();
    }

    @Test
    void demoLoginReturnsNotFoundWhenDisabled() {
        AuthServiceImpl service = service(new DemoAccessProperties(false, "demo"));

        assertThatThrownBy(service::loginDemo)
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void demoLoginRejectsMissingUser() {
        AuthServiceImpl service = service(new DemoAccessProperties(true, "missing-demo"));
        when(userRepository.findByUsername("missing-demo")).thenReturn(Optional.empty());

        assertThatThrownBy(service::loginDemo)
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void demoLoginRejectsInactiveUser() {
        AuthServiceImpl service = service(new DemoAccessProperties(true, "demo"));
        when(userRepository.findByUsername("demo")).thenReturn(Optional.of(user("demo", false)));

        assertThatThrownBy(service::loginDemo)
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void loginStillUsesPasswordAuthentication() {
        User user = user("admin", true);
        AuthServiceImpl service = service(new DemoAccessProperties(false, ""));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", user.getPasswordHash())).thenReturn(true);
        when(jwtService.createToken(user)).thenReturn("access-token");
        when(jwtService.expiration()).thenReturn(Duration.ofHours(2));

        LoginResponse response = service.login(new LoginRequest("admin", "password"));

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.user().username()).isEqualTo("admin");
        verify(passwordEncoder).matches("password", user.getPasswordHash());
    }

    private AuthServiceImpl service(DemoAccessProperties properties) {
        return new AuthServiceImpl(userRepository, passwordEncoder, jwtService, authMapper, properties);
    }

    private User user(String username, boolean active) {
        User user = new User();
        user.setId(1L);
        user.setUsername(username);
        user.setFullName(username.equals("demo") ? "Demo User" : "Admin User");
        user.setPasswordHash("stored-password-hash");
        user.setActive(active);
        return user;
    }
}
