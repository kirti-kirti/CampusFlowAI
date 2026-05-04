package com.campusflow.ai.notification.dto;

import com.campusflow.ai.notification.model.NotificationTarget;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Read model for a single notification.
 * Returned by both POST /send and GET /my.
 *
 * Sample JSON:
 * {
 *   "id":         1,
 *   "title":      "Exam Schedule Released",
 *   "message":    "Final exams start from 15th January.",
 *   "targetRole": "STUDENT",
 *   "createdAt":  "2024-01-10T09:00:00",
 *   "userId":     null
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private Long id;
    private String title;
    private String message;
    private NotificationTarget targetRole;
    private LocalDateTime createdAt;
    private Long userId;
}
