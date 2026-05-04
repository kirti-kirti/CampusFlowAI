package com.campusflow.ai.service;

import com.campusflow.ai.dto.*;
import com.campusflow.ai.hierarchy.repository.*;
import com.campusflow.ai.model.PasswordResetToken;
import com.campusflow.ai.model.Role;
import com.campusflow.ai.model.User;
import com.campusflow.ai.repository.PasswordResetTokenRepository;
import com.campusflow.ai.repository.UserRepository;
import com.campusflow.ai.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Authentication service with full hierarchy validation on registration.
 *
 * Validation rules:
 *  ALL roles   → universityId must exist and match tenantId
 *  TEACHER     → departmentId must belong to the university
 *  STUDENT     → departmentId + classRoomId must belong to the university
 *                classRoomId must belong to departmentId
 *  PARENT      → studentId must reference valid students in same university
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository       userRepository;
    private final PasswordEncoder      passwordEncoder;
    private final JwtUtil              jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UniversityRepository universityRepository;
    private final DepartmentRepository departmentRepository;
    private final ClassRoomRepository  classRoomRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // ── 1. Validate university exists and code matches tenantId ───────────────
        universityRepository.findByCode(request.getTenantId())
                .filter(u -> u.getId().equals(request.getUniversityId()))
                .orElseThrow(() -> new IllegalArgumentException(
                        "University not found or tenantId/universityId mismatch"));

        // ── 2. Role-specific hierarchy validation ─────────────────────────────────
        switch (request.getRole()) {

            case TEACHER -> {
                if (request.getDepartmentId() == null) {
                    throw new IllegalArgumentException("departmentId is required for TEACHER");
                }
                // Department must belong to this university
                departmentRepository.findByIdAndUniversityId(
                        request.getDepartmentId(), request.getUniversityId())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Department " + request.getDepartmentId() +
                                " does not belong to university " + request.getUniversityId()));
            }

            case STUDENT -> {
                if (request.getDepartmentId() == null) {
                    throw new IllegalArgumentException("departmentId is required for STUDENT");
                }
                if (request.getClassRoomId() == null) {
                    throw new IllegalArgumentException("classRoomId is required for STUDENT");
                }
                // Department must belong to university
                departmentRepository.findByIdAndUniversityId(
                        request.getDepartmentId(), request.getUniversityId())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Department " + request.getDepartmentId() +
                                " does not belong to university " + request.getUniversityId()));
                // ClassRoom must belong to department AND university
                classRoomRepository.findByIdAndDepartmentIdAndTenantId(
                        request.getClassRoomId(),
                        request.getDepartmentId(),
                        request.getTenantId())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "ClassRoom " + request.getClassRoomId() +
                                " does not belong to department " + request.getDepartmentId()));
            }

            case PARENT -> {
                if (request.getStudentId() == null || request.getStudentId().isBlank()) {
                    throw new IllegalArgumentException("studentId is required for PARENT");
                }
                // Validate each linked student belongs to the same university
                for (String sid : request.getStudentId().split(",")) {
                    Long studentId = parseLong(sid.trim(), "studentId");
                    if (!userRepository.existsByIdAndTenantId(studentId, request.getTenantId())) {
                        throw new IllegalArgumentException(
                                "Student " + studentId + " not found in this university");
                    }
                }
            }

            case ADMIN -> {
                // Admin only needs university — no dept/class required
            }
        }

        // ── 3. Build and save user ────────────────────────────────────────────────
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .tenantId(request.getTenantId())
                .universityId(request.getUniversityId())
                .departmentId(request.getDepartmentId())
                .classRoomId(request.getClassRoomId())
                .studentId(request.getStudentId())
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(
                saved.getEmail(), saved.getRole().name(), saved.getTenantId());

        log.info("[{}] User registered: id={}, role={}, dept={}, class={}",
                saved.getTenantId(), saved.getId(), saved.getRole(),
                saved.getDepartmentId(), saved.getClassRoomId());

        return buildAuthResponse(saved, token);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name(), user.getTenantId());

        return buildAuthResponse(user, token);
    }

    public User getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPassword(null);
        return user;
    }

    @Transactional
    public UpdateProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        if ((request.getName() == null || request.getName().isBlank()) &&
            (request.getPassword() == null || request.getPassword().isBlank())) {
            throw new IllegalArgumentException(
                    "Provide at least one field to update: name or password");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        User saved = userRepository.save(user);

        return UpdateProfileResponse.builder()
                .id(saved.getId()).name(saved.getName())
                .email(saved.getEmail()).role(saved.getRole())
                .message("Profile updated successfully").build();
    }
    @Transactional
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User with this email does not exist."));

        // 1. Clean up old tokens
        tokenRepository.deleteByUser(user);

        // 2. Generate new token (valid for 15 minutes)
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();
        tokenRepository.save(resetToken);

        // 3. Send Email (Mocked if mail server is not configured)
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@campusflow.ai");
            message.setTo(email);
            message.setSubject("Password Recovery - CampusFlow AI");
            message.setText("Hello " + user.getName() + ",\n\n" +
                    "We received a request to reset your password. Use the token below to reset it:\n\n" +
                    "TOKEN: " + token + "\n\n" +
                    "This token expires in 15 minutes.\n\n" +
                    "If you didn't request this, please ignore this email.");
            mailSender.send(message);
            log.info("Reset token sent to {}", email);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}. Token: {}", email, e.getMessage(), token);
            // In a demo, we return the token in the response or logs
        }

        return "Reset token has been sent to your email. (DEMO TOKEN: " + token + ")";
    }

    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or non-existent token."));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new IllegalStateException("Token has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Clean up token after use
        tokenRepository.delete(resetToken);

        log.info("Password reset successful for user: {}", user.getEmail());
        return "Password has been reset successfully.";
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .tenantId(user.getTenantId())
                .universityId(user.getUniversityId())
                .build();
    }

    private Long parseLong(String value, String field) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid " + field + ": " + value);
        }
    }
}
