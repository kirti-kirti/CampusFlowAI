package com.campusflow.ai.user.service;

import com.campusflow.ai.dto.FcmTokenRequest;
import com.campusflow.ai.dto.UpdateProfileRequest;
import com.campusflow.ai.dto.UpdateProfileResponse;
import com.campusflow.ai.model.User;
import com.campusflow.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Handles user self-service operations:
 *  - Save / update FCM device token
 *  - Update profile (name, password)
 *
 * User identity is always resolved from the JWT email — never from the request body.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ─── Save FCM Token ──────────────────────────────────────────────────────────

    /**
     * Saves or updates the FCM device token for the authenticated user.
     *
     * Called by the mobile app after:
     *  - First login
     *  - App reinstall (token changes)
     *  - Firebase token refresh
     *
     * @param email      from JWT — cannot be spoofed
     * @param request    contains the new FCM token
     */
    @Transactional
    public Map<String, String> saveFcmToken(String email, FcmTokenRequest request) {
        User user = findByEmail(email);

        String oldToken = user.getFcmToken();
        user.setFcmToken(request.getFcmToken());
        userRepository.save(user);

        log.info("FCM token {} for user {} (id={})",
                oldToken == null ? "registered" : "updated",
                email, user.getId());

        return Map.of(
                "message", "FCM token saved successfully",
                "userId",  String.valueOf(user.getId()),
                "email",   user.getEmail()
        );
    }

    // ─── Update Profile ──────────────────────────────────────────────────────────

    /**
     * Updates name and/or password for the authenticated user.
     * Both fields are optional — only provided fields are changed.
     */
    @Transactional
    public UpdateProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        if ((request.getName() == null || request.getName().isBlank()) &&
            (request.getPassword() == null || request.getPassword().isBlank())) {
            throw new IllegalArgumentException(
                    "Provide at least one field to update: name or password");
        }

        User user = findByEmail(email);

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User saved = userRepository.save(user);

        return UpdateProfileResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .message("Profile updated successfully")
                .build();
    }

    // ─── Admin Listing ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public java.util.List<User> getUsersByRole(com.campusflow.ai.model.Role role, String tenantId) {
        return userRepository.findByRoleAndTenantId(role, tenantId);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────────

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
