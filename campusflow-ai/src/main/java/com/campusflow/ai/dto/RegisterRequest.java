package com.campusflow.ai.dto;

import com.campusflow.ai.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Payload for POST /api/auth/register
 *
 * Hierarchy fields:
 *  tenantId     → required for all roles (maps to University.code)
 *  universityId → required for all roles
 *  departmentId → required for TEACHER and STUDENT
 *  classRoomId  → required for STUDENT
 *  studentId    → required for PARENT (comma-separated student IDs)
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Must be a valid email address")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    // ─── Multi-tenant ─────────────────────────────────────────────────────────────

    /** University code — used as tenantId in JWT */
    @NotBlank(message = "tenantId (university code) is required")
    private String tenantId;

    @NotNull(message = "universityId is required")
    private Long universityId;

    // ─── Hierarchy ────────────────────────────────────────────────────────────────

    /** Required for TEACHER and STUDENT */
    private Long departmentId;

    /** Required for STUDENT */
    private Long classRoomId;

    /** Required for PARENT — comma-separated student user IDs */
    private String studentId;
}
