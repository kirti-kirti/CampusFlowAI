package com.campusflow.ai.notification.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Persisted notification record.
 *
 * Every notification sent by ADMIN is stored here so that
 * users can retrieve their notification history via GET /api/notifications/my.
 *
 * targetRole determines which users can see this notification:
 *   ALL     → visible to everyone
 *   STUDENT → visible only to students
 *   TEACHER → visible only to teachers
 *   PARENT  → visible only to parents
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Short headline shown in the push notification banner */
    @Column(nullable = false)
    private String title;

    /** Full notification body text */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /** Who this notification is addressed to */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationTarget targetRole;

    /** When the notification was created / sent */
    @Column(nullable = false)
    private LocalDateTime createdAt;

    /**
     * Optional: ID of a specific user for personal notifications.
     * Null means the notification is broadcast to all users of targetRole.
     */
    @Column
    private Long userId;
}
