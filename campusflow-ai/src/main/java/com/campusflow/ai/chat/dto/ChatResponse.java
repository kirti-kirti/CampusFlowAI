package com.campusflow.ai.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response body for POST /api/chat/ask
 *
 * Sample JSON:
 * {
 *   "query":     "How do I check my attendance?",
 *   "response":  "You can view your attendance in the Attendance module under GET /api/attendance/student/{id}.",
 *   "timestamp": "2024-01-15T10:05:00"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {

    /** The original query echoed back */
    private String query;

    /** The chatbot's answer */
    private String response;

    /** When the response was generated */
    private LocalDateTime timestamp;
}
