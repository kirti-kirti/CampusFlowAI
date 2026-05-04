package com.campusflow.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request body for POST /api/user/save-token
 *
 * Sample JSON:
 * { "fcmToken": "dGhpcyBpcyBhIHNhbXBsZSB0b2tlbg..." }
 */
@Data
public class FcmTokenRequest {

    @NotBlank(message = "fcmToken is required")
    private String fcmToken;
}
