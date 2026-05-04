package com.campusflow.ai.messaging.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents a single message sent from one user to another.
 *
 * Use case: Teacher → Student/Parent communication.
 * Can be extended to support Student → Teacher replies.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "messages",
       indexes = {
           @Index(name = "idx_sender", columnList = "senderId"),
           @Index(name = "idx_receiver", columnList = "receiverId")
       })
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** User ID of the sender (typically a TEACHER) */
    @Column(nullable = false)
    private Long senderId;

    /** User ID of the recipient (STUDENT or PARENT) */
    @Column(nullable = false)
    private Long receiverId;

    /** Message content */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /** When the message was sent */
    @Column(nullable = false)
    private LocalDateTime timestamp;

    /** Whether the recipient has read the message */
    @Builder.Default
    @Column(nullable = false)
    private Boolean isRead = false;
}
