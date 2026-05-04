package com.campusflow.ai.notification.dto;

import com.campusflow.ai.notification.model.NotificationTarget;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request body for POST /api/notifications/send
 * Only ADMIN can use this endpoint.
 *
 * Sample JSON:
 * {
 *   "title":      "Exam Schedule Released",
 *   "message":    "Final exams start from 15th January. Check the portal for details.",
 *   "targetRole": "STUDENT"
 * }
 */
@Data
public class NotificationRequest {

    @NotBlank(message = "title is required")
    @Size(max = 100, message = "title must not exceed 100 characters")
    private String title;

    @NotBlank(message = "message is required")
    @Size(max = 1000, message = "message must not exceed 1000 characters")
    private String message;

    /**
     * Who should receive this notification.
     * Accepted values: ALL, STUDENT, TEACHER, PARENT
     */
    @NotNull(message = "targetRole is required (ALL, STUDENT, TEACHER, PARENT)")
    private NotificationTarget targetRole;

    /**
     * Optional: target a specific user by ID.
     * When set, only that user receives the notification.
     * When null, all users of targetRole receive it.
     */
    private Long userId;
}
