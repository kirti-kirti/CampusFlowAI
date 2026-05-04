package com.campusflow.ai.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request body for POST /api/chat/ask
 *
 * Sample JSON:
 * { "query": "How do I check my attendance?" }
 */
@Data
public class ChatRequest {

    @NotBlank(message = "Query cannot be empty")
    @Size(max = 500, message = "Query must not exceed 500 characters")
    private String query;
}
