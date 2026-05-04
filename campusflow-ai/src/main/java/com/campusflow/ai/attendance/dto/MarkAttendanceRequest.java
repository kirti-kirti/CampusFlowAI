package com.campusflow.ai.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request body for POST /api/attendance/mark
 * Sent by a STUDENT after scanning the QR code.
 *
 * studentId is NOT required here — it is extracted from the JWT token
 * to prevent students from marking attendance on behalf of others.
 */
@Data
public class MarkAttendanceRequest {

    @NotBlank(message = "qrCode is required")
    private String qrCode;
}
