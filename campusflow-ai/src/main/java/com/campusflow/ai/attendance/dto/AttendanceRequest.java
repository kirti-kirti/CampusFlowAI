package com.campusflow.ai.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request for POST /api/attendance/mark
 *
 * studentId and collegeId are from JWT — not from this DTO.
 */
@Data
public class AttendanceRequest {

    private String qrToken;

    private String studentId;
}
