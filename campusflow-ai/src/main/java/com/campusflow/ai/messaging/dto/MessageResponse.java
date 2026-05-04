package com.campusflow.ai.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Read model for a single message.
 *
 * Sample JSON:
 * {
 *   "id":           1,
 *   "senderId":     3,
 *   "senderName":   "Mr. John",
 *   "receiverId":   7,
 *   "receiverName": "Alice Smith",
 *   "message":      "Please submit your assignment by Friday.",
 *   "timestamp":    "2024-01-15T10:00:00",
 *   "isRead":       false
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    private Long id;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String receiverName;
    private String message;
    private LocalDateTime timestamp;
    private Boolean isRead;
}
