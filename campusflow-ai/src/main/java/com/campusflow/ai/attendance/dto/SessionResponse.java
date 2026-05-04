package com.campusflow.ai.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response for session start and QR generation.
 *
 * qrToken   → current rotating token (changes every qrRotationSeconds)
 * qrImage   → Base64 PNG — render with <img src="data:image/png;base64,...">
 * expiresAt → when this token expires (frontend should auto-refresh before this)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {

    private Long sessionId;
    private String collegeId;
    private Long departmentId;
    private Long classRoomId;
    private String subject;
    private Long teacherId;
    private String teacherName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int lateThresholdMinutes;
    private int qrRotationSeconds;
    private Boolean isActive;

    /** Current rotating QR token */
    private String qrToken;

    /** Base64-encoded PNG QR image */
    private String qrImage;

    /** When this token expires — frontend polls before this time */
    private LocalDateTime qrExpiresAt;

    /** Seconds remaining before next rotation */
    private long secondsUntilRotation;
}
