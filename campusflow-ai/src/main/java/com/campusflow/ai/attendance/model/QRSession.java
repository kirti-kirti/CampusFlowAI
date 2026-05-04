package com.campusflow.ai.attendance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents a QR code session created by a teacher for a specific class.
 *
 * Lifecycle:
 *   Teacher calls POST /generate-qr  →  QRSession is created with a UUID token
 *   Students scan within expiryTime  →  Attendance records are created
 *   After expiryTime                 →  QR is rejected as expired
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "qr_sessions")
public class QRSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** UUID token embedded in the QR code image */
    @Column(nullable = false, unique = true)
    private String qrCode;

    /** The class this session belongs to */
    @Column(nullable = false)
    private Long classId;

    /** Subject being taught in this session */
    @Column(nullable = false)
    private String subject;

    /** User ID of the teacher who generated this QR */
    @Column(nullable = false)
    private Long createdBy;

    /** When the QR was generated */
    @Column(nullable = false)
    private LocalDateTime createdAt;

    /**
     * QR becomes invalid after this time.
     * Default: 5 minutes after createdAt.
     */
    @Column(nullable = false)
    private LocalDateTime expiryTime;

    /** Convenience method — true if the QR window has passed */
    @Transient
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryTime);
    }
}
