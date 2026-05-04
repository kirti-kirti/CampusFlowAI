package com.campusflow.ai.transport.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request body for POST /api/transport/add and PUT /api/transport/update/{busId}
 * Used by ADMIN only.
 *
 * Sample JSON:
 * {
 *   "busId":         "BUS-01",
 *   "busNumber":     "MH-12-AB-1234",
 *   "driverName":    "Ramesh Kumar",
 *   "driverId":      "5",
 *   "routeName":     "Sector-5 → School → Sector-12",
 *   "assignedClass": "CLASS-10A"
 * }
 */
@Data
public class BusRequest {

    @NotBlank(message = "busId is required")
    private String busId;

    @NotBlank(message = "busNumber is required")
    private String busNumber;

    @NotBlank(message = "driverName is required")
    private String driverName;

    @NotBlank(message = "driverId is required")
    private String driverId;

    @NotBlank(message = "routeName is required")
    private String routeName;

    /** Optional: class assigned to this bus for student/parent tracking */
    private String assignedClass;
}
