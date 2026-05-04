package com.campusflow.ai.transport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Read model for a Bus record.
 *
 * Sample JSON:
 * {
 *   "id":            1,
 *   "busId":         "BUS-01",
 *   "busNumber":     "MH-12-AB-1234",
 *   "driverName":    "Ramesh Kumar",
 *   "driverId":      "5",
 *   "routeName":     "Sector-5 → School → Sector-12",
 *   "assignedClass": "CLASS-10A"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusResponse {

    private Long id;
    private String busId;
    private String busNumber;
    private String driverName;
    private String driverId;
    private String routeName;
    private String assignedClass;
    private Integer capacity;
    private Long studentCount;
}
