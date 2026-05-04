package com.campusflow.ai.attendance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Rotating QR token for an attendance session.
 *
 * Rotation strategy:
 *   - New token generated every qrRotationSeconds (10-15 sec)
 *   - Previous tokens are expired (expiryTime set to past)
 *   - Only the latest non-expired token is valid
 *   - Token is a UUID — unpredictable, cannot be guessed
 *
 * Security:
 *   - collegeId prevents cross-tenant token usage
 *   - Short expiry prevents screenshot/sharing attacks
 *   - One attendance per student per session prevents replay
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "qr_tokens",
       indexes = {
           @Index(name = "idx_qr_token",      columnList = "token"),
           @Index(name = "idx_qr_session",    columnList = "sessionId,collegeId"),
           @Index(name = "idx_qr_active",     columnList = "sessionId,isActive")
       })
public class QRToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** UUID — unpredictable rotating token */
    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Long sessionId;

    /** Tenant scope */
    @Column(nullable = false)
    private String collegeId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    /** Set to now + qrRotationSeconds */
    @Column(nullable = false)
    private LocalDateTime expiryTime;

    /**
     * False when this token has been rotated out.
     * Only one token per session should have isActive = true.
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    @Transient
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryTime);
    }
}
