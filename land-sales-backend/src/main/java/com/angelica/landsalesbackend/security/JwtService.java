package com.angelica.landsalesbackend.security;

import com.angelica.landsalesbackend.user.entity.User;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Service
public class JwtService {

    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final JwtProperties properties;
    private final ObjectMapper objectMapper;

    public JwtService(JwtProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    public Duration expiration() {
        return properties.expiration();
    }

    public String createToken(User user) {
        requireSecret();
        Instant now = Instant.now();
        Instant expiresAt = now.plus(properties.expiration());

        Map<String, Object> header = Map.of("alg", "HS256", "typ", "JWT");
        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("sub", user.getUsername());
        claims.put("uid", user.getId());
        claims.put("iat", now.getEpochSecond());
        claims.put("exp", expiresAt.getEpochSecond());

        String unsignedToken = encodeJson(header) + "." + encodeJson(claims);
        return unsignedToken + "." + sign(unsignedToken);
    }

    public AuthenticatedUser parse(String token) {
        requireSecret();
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new JwtException("Invalid token");
        }

        String unsignedToken = parts[0] + "." + parts[1];
        if (!constantTimeEquals(sign(unsignedToken), parts[2])) {
            throw new JwtException("Invalid token");
        }

        Map<String, Object> claims = decodeJson(parts[1]);
        String username = stringClaim(claims, "sub");
        Long userId = longClaim(claims, "uid");
        long expiresAt = longClaim(claims, "exp");
        if (Instant.now().getEpochSecond() >= expiresAt) {
            throw new JwtException("Expired token");
        }
        return new AuthenticatedUser(userId, username);
    }

    private void requireSecret() {
        if (properties.secret() == null || properties.secret().isBlank()) {
            throw new JwtException("JWT secret is not configured");
        }
    }

    private String encodeJson(Map<String, Object> value) {
        try {
            return ENCODER.encodeToString(objectMapper.writeValueAsBytes(value));
        } catch (Exception ex) {
            throw new JwtException("Could not create token");
        }
    }

    private Map<String, Object> decodeJson(String value) {
        try {
            return objectMapper.readValue(DECODER.decode(value), MAP_TYPE);
        } catch (Exception ex) {
            throw new JwtException("Invalid token");
        }
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(properties.secret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(key);
            return ENCODER.encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new JwtException("Could not sign token");
        }
    }

    private boolean constantTimeEquals(String left, String right) {
        byte[] leftBytes = left.getBytes(StandardCharsets.UTF_8);
        byte[] rightBytes = right.getBytes(StandardCharsets.UTF_8);
        if (leftBytes.length != rightBytes.length) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < leftBytes.length; i++) {
            result |= leftBytes[i] ^ rightBytes[i];
        }
        return result == 0;
    }

    private String stringClaim(Map<String, Object> claims, String name) {
        Object value = claims.get(name);
        if (value instanceof String stringValue && !stringValue.isBlank()) {
            return stringValue;
        }
        throw new JwtException("Invalid token");
    }

    private Long longClaim(Map<String, Object> claims, String name) {
        Object value = claims.get(name);
        if (value instanceof Number numberValue) {
            return numberValue.longValue();
        }
        throw new JwtException("Invalid token");
    }
}
