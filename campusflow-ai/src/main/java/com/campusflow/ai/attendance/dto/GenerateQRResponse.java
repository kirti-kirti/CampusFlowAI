package com.campusflow.ai.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response for POST /api/attendance/generate-qr
 *
 * qrCode   → raw UUID token (embed in QR image on the frontend)
 * qrImage  → Base64-encoded PNG of the QR code (ready for <img src="data:image/png;base64,...">)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateQRResponse {

    private Long sessionId;
    private String qrCode;

    /** Base64-encoded PNG — frontend can render this directly */
    private String qrImage;

    private Long classId;
    private String subject;
    private LocalDateTime createdAt;
    private LocalDateTime expiryTime;
}
