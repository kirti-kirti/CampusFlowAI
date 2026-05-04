package com.campusflow.ai.chat.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Persists every chat interaction for history and analytics.
 *
 * One row = one question + answer pair for a specific user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "chat_history",
       indexes = @Index(name = "idx_chat_userid", columnList = "userId"))
public class ChatHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user who asked the question (from JWT) */
    @Column(nullable = false)
    private Long userId;

    /** User's email for display purposes */
    @Column(nullable = false)
    private String userEmail;

    /** The question asked */
    @Column(nullable = false, length = 500)
    private String query;

    /** The chatbot's answer */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String response;

    /** When the conversation happened */
    @Column(nullable = false)
    private LocalDateTime timestamp;
}
