package com.campusflow.ai.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Request for POST /api/attendance/session/start
 *
 * teacherId and collegeId are extracted from JWT — not from this DTO.
 *
 * Sample:
 * {
 *   "departmentId": 1,
 *   "classRoomId":  1,
 *   "subject":      "DBMS",
 *   "startTime":    "2026-05-01T10:00:00",
 *   "endTime":      "2026-05-01T11:00:00"
 * }
 */
@Data
public class SessionStartRequest {

    @NotNull(message = "departmentId is required")
    private Long departmentId;

    @NotNull(message = "classRoomId is required")
    private Long classRoomId;

    @NotBlank(message = "subject is required")
    private String subject;

    @NotNull(message = "startTime is required")
    private LocalDateTime startTime;

    @NotNull(message = "endTime is required")
    private LocalDateTime endTime;

    /** Minutes after startTime before attendance is LATE. Default: 15 */
    private int lateThresholdMinutes = 15;

    /** QR rotation interval in seconds. Default: 60 seconds */
    private int qrRotationSeconds = 60;
}
