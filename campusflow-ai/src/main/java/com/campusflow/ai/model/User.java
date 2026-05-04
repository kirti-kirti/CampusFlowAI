package com.campusflow.ai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Single-table user entity for all roles.
 *
 * Hierarchy fields:
 *  universityId → all roles (multi-tenant root)
 *  departmentId → TEACHER, STUDENT
 *  classRoomId  → STUDENT only
 *  studentId    → PARENT only (comma-separated student IDs for multiple children)
 *
 * Validation rules enforced at registration:
 *  STUDENT  → classRoomId + departmentId must belong to same university
 *  TEACHER  → departmentId must belong to same university
 *  PARENT   → studentId must reference valid students in same university
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users",
       indexes = {
           @Index(name = "idx_user_tenant",     columnList = "tenantId"),
           @Index(name = "idx_user_dept",       columnList = "departmentId"),
           @Index(name = "idx_user_class",      columnList = "classRoomId"),
           @Index(name = "idx_user_role_tenant",columnList = "role,tenantId")
       })
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // ─── Multi-tenant root ────────────────────────────────────────────────────────

    /** Maps to University.code — used as JWT tenantId claim */
    @Column(nullable = false)
    private String tenantId;

    /** FK to University.id */
    @Column(nullable = false)
    private Long universityId;

    // ─── Hierarchy fields ─────────────────────────────────────────────────────────

    /** FK to Department.id — required for TEACHER and STUDENT */
    @Column
    private Long departmentId;

    /** FK to ClassRoom.id — required for STUDENT only */
    @Column
    private Long classRoomId;

    // ─── Role-specific fields ─────────────────────────────────────────────────────

    /**
     * PARENT role: comma-separated student user IDs.
     * Example: "7" or "7,8" for multiple children.
     */
    @Column
    private String studentId;

    /** FCM device token for push notifications */
    @Column
    private String fcmToken;
}
