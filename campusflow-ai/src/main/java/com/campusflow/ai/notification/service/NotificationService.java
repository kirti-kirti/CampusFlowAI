package com.campusflow.ai.notification.service;

import com.campusflow.ai.model.Role;
import com.campusflow.ai.model.User;
import com.campusflow.ai.notification.dto.NotificationRequest;
import com.campusflow.ai.notification.dto.NotificationResponse;
import com.campusflow.ai.notification.model.Notification;
import com.campusflow.ai.notification.model.NotificationTarget;
import com.campusflow.ai.notification.repository.NotificationRepository;
import com.campusflow.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core business logic for the Notification module.
 *
 * Flow for sending a notification:
 *  1. Validate the request
 *  2. Persist the notification to the database
 *  3. Dispatch FCM push notification (fire-and-forget, non-blocking)
 *
 * Flow for receiving notifications:
 *  1. Extract the user's role from their JWT (via email lookup)
 *  2. Query DB for notifications targeted at that role or ALL
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final FcmService fcmService;

    // ─── ADMIN: Send Notification ────────────────────────────────────────────────

    /**
     * Sends a notification to the specified target audience.
     *
     * Steps:
     *  1. Save notification record to DB
     *  2. If userId is set → send personal push to that user
     *  3. Otherwise → send broadcast push to all users of targetRole
     *
     * FCM push is best-effort: DB record is always saved even if push fails.
     */
    @Transactional
    public NotificationResponse send(NotificationRequest request) {
        // 1. Persist to database
        Notification notification = Notification.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .targetRole(request.getTargetRole())
                .createdAt(LocalDateTime.now())
                .userId(request.getUserId())
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Notification saved: id={}, target={}, title='{}'",
                saved.getId(), saved.getTargetRole(), saved.getTitle());

        // 2. Dispatch FCM push (non-blocking — failure doesn't affect DB save)
        try {
            if (request.getUserId() != null) {
                // Personal notification to a specific user
                fcmService.sendToUser(request.getTitle(), request.getMessage(), request.getUserId());
            } else {
                // Broadcast to all users of the target role
                fcmService.sendToRole(request.getTitle(), request.getMessage(), request.getTargetRole());
            }
        } catch (Exception e) {
            // FCM failure is non-fatal — notification is already in DB
            log.error("FCM push failed for notification id={}: {}", saved.getId(), e.getMessage());
        }

        return toResponse(saved);
    }

    // ─── All Users: View Own Notifications ───────────────────────────────────────

    /**
     * Returns notifications visible to the currently authenticated user.
     *
     * Logic:
     *  - ADMIN → sees all notifications
     *  - STUDENT/TEACHER/PARENT → sees notifications targeted at their role + ALL
     *
     * @param email  extracted from JWT by the controller
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Notification> notifications;

        if (user.getRole() == Role.ADMIN) {
            // ADMIN sees everything
            notifications = notificationRepository.findAllByOrderByCreatedAtDesc();
        } else {
            // Map user Role → NotificationTarget
            NotificationTarget target = NotificationTarget.valueOf(user.getRole().name());
            notifications = notificationRepository.findByRoleOrAll(target);
        }

        log.info("Fetched {} notifications for user {} (role: {})",
                notifications.size(), email, user.getRole());

        return notifications.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────────

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .targetRole(n.getTargetRole())
                .createdAt(n.getCreatedAt())
                .userId(n.getUserId())
                .build();
    }
}
