package com.campusflow.ai.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * Utility class for all JWT operations:
 * - Generate token on login/register
 * - Extract claims (email, role)
 * - Validate token signature and expiry
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationMs;

    /** Build a signing key from the configured secret */
    private Key signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Generate a signed JWT for the given email, role, and tenantId.
     * Token is valid for `jwt.expiration` milliseconds.
     */
    public String generateToken(String email, String role, String tenantId) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("tenantId", tenantId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(signingKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /** Extract the email (subject) from a token */
    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    /** Extract the role claim from a token */
    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    /** Extract the tenantId claim from a token */
    public String extractTenantId(String token) {
        return parseClaims(token).get("tenantId", String.class);
    }

    /**
     * Returns true if the token is well-formed, correctly signed,
     * and not yet expired.
     */
    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /** Parse and return the claims body; throws on any JWT error */
    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
