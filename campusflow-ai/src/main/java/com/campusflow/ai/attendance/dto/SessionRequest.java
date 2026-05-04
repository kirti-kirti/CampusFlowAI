package com.campusflow.ai.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Request body for POST /api/attendance/session/create
 *
 * collegeId and teacherId are NOT in this DTO —
 * they are extracted from the JWT token automatically.
 *
 * Sample JSON:
 * {
 *   "classId":   "CSE-3",
 *   "subject":   "DBMS",
 *   "startTime": "2026-05-01T10:00:00",
 *   "endTime":   "2026-05-01T11:00:00"
 * }
 */
@Data
public class SessionRequest {

    @NotBlank(message = "classId is required")
    private String classId;

    @NotBlank(message = "subject is required")
    private String subject;

    @NotNull(message = "startTime is required")
    private LocalDateTime startTime;

    @NotNull(message = "endTime is required")
    private LocalDateTime endTime;

    /** Minutes after startTime before attendance is LATE. Default: 15 */
    private int lateThresholdMinutes = 15;

    /** QR validity in minutes. Default: 10 */
    private int qrValidityMinutes = 10;
}
