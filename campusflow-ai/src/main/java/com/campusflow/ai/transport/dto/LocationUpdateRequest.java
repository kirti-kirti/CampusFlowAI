package com.campusflow.ai.transport.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for POST /api/transport/location
 * Sent by TEACHER/DRIVER to update the bus's current GPS position.
 *
 * Sample JSON:
 * {
 *   "busId":     "BUS-01",
 *   "latitude":  28.6139,
 *   "longitude": 77.2090
 * }
 */
@Data
public class LocationUpdateRequest {

    // busId is optional — backend resolves it from the authenticated driver's assignment
    private String busId;

    @NotNull(message = "latitude is required")
    @DecimalMin(value = "-90.0", message = "latitude must be >= -90.0")
    @DecimalMax(value = "90.0",  message = "latitude must be <= 90.0")
    private Double latitude;

    @NotNull(message = "longitude is required")
    @DecimalMin(value = "-180.0", message = "longitude must be >= -180.0")
    @DecimalMax(value = "180.0",  message = "longitude must be <= 180.0")
    private Double longitude;
}
