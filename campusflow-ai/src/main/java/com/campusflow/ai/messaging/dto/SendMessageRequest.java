package com.campusflow.ai.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request body for POST /api/messages/send
 *
 * senderId is NOT required — it is extracted from the JWT token.
 *
 * Sample JSON:
 * {
 *   "receiverId": 5,
 *   "message":    "Please submit your assignment by Friday."
 * }
 */
@Data
public class SendMessageRequest {

    @NotNull(message = "receiverId is required")
    private Long receiverId;

    @NotBlank(message = "message cannot be empty")
    @Size(max = 1000, message = "message must not exceed 1000 characters")
    private String message;
}
