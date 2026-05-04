package com.campusflow.ai.notification.service;

import com.campusflow.ai.model.Role;
import com.campusflow.ai.model.User;
import com.campusflow.ai.notification.model.NotificationTarget;
import com.campusflow.ai.repository.UserRepository;
import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Handles Firebase Cloud Messaging (FCM) push notification delivery.
 *
 * Architecture:
 *  - Each user has a deviceToken stored in their profile (fcmToken field).
 *  - When a notification is sent, we collect tokens for the target role
 *    and send a multicast message via FCM.
 *
 * Graceful degradation:
 *  - If Firebase is not initialized (no valid service account),
 *    this service logs a warning and skips push — DB record is still saved.
 *  - If a user has no device token, they are skipped silently.
 *
 * NOTE: To enable push notifications:
 *  1. Add an `fcmToken` field to the User entity
 *  2. Provide an API for the mobile app to register its FCM token
 *  3. Replace the placeholder firebase-service-account.json with real credentials
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FcmService {

    private final UserRepository userRepository;

    /**
     * Sends a push notification to all users matching the target role.
     *
     * @param title      notification title
     * @param body       notification body text
     * @param target     which role(s) to notify
     */
    public void sendToRole(String title, String body, NotificationTarget target) {
        if (!isFirebaseReady()) return;

        // Collect FCM tokens for the target audience
        List<String> tokens = resolveTokens(target);

        if (tokens.isEmpty()) {
            log.info("No device tokens found for target: {}. Push skipped.", target);
            return;
        }

        sendMulticast(title, body, tokens);
    }

    /**
     * Sends a push notification to a single specific user.
     *
     * @param title   notification title
     * @param body    notification body
     * @param userId  target user's ID
     */
    public void sendToUser(String title, String body, Long userId) {
        if (!isFirebaseReady()) return;

        userRepository.findById(userId).ifPresentOrElse(user -> {
            String token = getFcmToken(user);
            if (token == null) {
                log.info("User {} has no FCM token. Push skipped.", userId);
                return;
            }
            sendSingle(title, body, token);
        }, () -> log.warn("User {} not found for push notification", userId));
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────────

    /**
     * Resolves FCM tokens for the given target.
     * ALL → tokens from every user
     * STUDENT/TEACHER/PARENT → tokens from users with that role
     */
    private List<String> resolveTokens(NotificationTarget target) {
        List<User> users = target == NotificationTarget.ALL
                ? userRepository.findAll()
                : userRepository.findByRole(Role.valueOf(target.name()));

        return users.stream()
                .map(this::getFcmToken)
                .filter(token -> token != null && !token.isBlank())
                .collect(Collectors.toList());
    }

    /**
     * Sends a multicast message to up to 500 tokens at once (FCM limit).
     * Batches automatically if more than 500 tokens.
     */
    private void sendMulticast(String title, String body, List<String> tokens) {
        // FCM multicast supports max 500 tokens per request
        int batchSize = 500;
        for (int i = 0; i < tokens.size(); i += batchSize) {
            List<String> batch = tokens.subList(i, Math.min(i + batchSize, tokens.size()));

            MulticastMessage message = MulticastMessage.builder()
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .addAllTokens(batch)
                    .build();

            try {
                BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);
                log.info("FCM multicast sent: {} success, {} failure out of {} tokens",
                        response.getSuccessCount(), response.getFailureCount(), batch.size());
            } catch (FirebaseMessagingException e) {
                log.error("FCM multicast failed: {}", e.getMessage());
            }
        }
    }

    /** Sends a single push notification to one device token */
    private void sendSingle(String title, String body, String token) {
        Message message = Message.builder()
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .setToken(token)
                .build();

        try {
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("FCM single message sent: {}", response);
        } catch (FirebaseMessagingException e) {
            log.error("FCM single message failed: {}", e.getMessage());
        }
    }

    /**
     * Extracts the FCM token from a User.
     *
     * Currently returns null because the User entity does not yet have
     * an fcmToken field. To enable push:
     *  1. Add `private String fcmToken;` to the User entity
     *  2. Add POST /api/users/register-token endpoint
     *  3. Replace this method with: return user.getFcmToken();
     */
    private String getFcmToken(User user) {
        return user.getFcmToken();
    }

    /** Returns true only if Firebase Admin SDK was successfully initialized */
    private boolean isFirebaseReady() {
        if (FirebaseApp.getApps().isEmpty()) {
            log.debug("Firebase not initialized — push notification skipped");
            return false;
        }
        return true;
    }
}
