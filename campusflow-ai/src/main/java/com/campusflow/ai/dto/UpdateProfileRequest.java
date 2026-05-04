package com.campusflow.ai.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request body for PUT /api/user/update-profile
 *
 * Both fields are optional — send only what you want to update.
 *
 * Sample JSON (update both):
 * { "name": "Alice Johnson", "password": "newpass123" }
 *
 * Sample JSON (update name only):
 * { "name": "Alice Johnson" }
 *
 * Sample JSON (update password only):
 * { "password": "newpass123" }
 */
@Data
public class UpdateProfileRequest {

    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}
