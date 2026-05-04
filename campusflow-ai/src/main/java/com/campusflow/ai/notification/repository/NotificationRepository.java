package com.campusflow.ai.notification.repository;

import com.campusflow.ai.notification.model.Notification;
import com.campusflow.ai.notification.model.NotificationTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Data access for Notification entity.
 */
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Returns notifications visible to a specific role.
     * A user sees notifications targeted at their role OR at ALL.
     *
     * Used by GET /api/notifications/my
     */
    @Query("SELECT n FROM Notification n WHERE n.targetRole = :role OR n.targetRole = 'ALL' ORDER BY n.createdAt DESC")
    List<Notification> findByRoleOrAll(@Param("role") NotificationTarget role);

    /**
     * Returns notifications for a specific user (personal notifications).
     * Used when userId is set on the notification.
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Returns all notifications ordered by newest first — for ADMIN view */
    List<Notification> findAllByOrderByCreatedAtDesc();
}
