package com.campusflow.ai.dto;

import com.campusflow.ai.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response body for PUT /api/user/update-profile
 *
 * Sample JSON:
 * {
 *   "id":    1,
 *   "name":  "Alice Johnson",
 *   "email": "alice@school.com",
 *   "role":  "STUDENT",
 *   "message": "Profile updated successfully"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileResponse {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private String message;
}
