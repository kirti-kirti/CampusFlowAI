package com.campusflow.ai.notification.model;

/**
 * Defines who a notification is targeted at.
 *
 * ALL     → every user regardless of role
 * STUDENT → only users with STUDENT role
 * TEACHER → only users with TEACHER role
 * PARENT  → only users with PARENT role
 */
public enum NotificationTarget {
    ALL,
    STUDENT,
    TEACHER,
    PARENT
}
