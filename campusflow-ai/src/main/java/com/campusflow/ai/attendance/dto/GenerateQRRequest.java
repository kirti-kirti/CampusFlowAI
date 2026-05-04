package com.campusflow.ai.attendance.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for POST /api/attendance/generate-qr
 * Sent by a TEACHER to open a new attendance window.
 */
@Data
public class GenerateQRRequest {

    @NotNull(message = "classId is required")
    private Long classId;

    @NotBlank(message = "subject is required")
    private String subject;

    /**
     * How many minutes the QR remains valid.
     * Defaults to 5 if not provided.
     */
    @Min(value = 1, message = "validityMinutes must be at least 1")
    private int validityMinutes = 5;
}
