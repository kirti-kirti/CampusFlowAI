package com.campusflow.ai.transport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response for GET /api/transport/location/{busId}
 * Returns the latest GPS position of a bus.
 *
 * Sample JSON:
 * {
 *   "busId":           "BUS-01",
 *   "busNumber":       "MH-12-AB-1234",
 *   "driverName":      "Ramesh Kumar",
 *   "routeName":       "Sector-5 → School → Sector-12",
 *   "latitude":        28.6139,
 *   "longitude":       77.2090,
 *   "lastUpdatedTime": "2024-01-15T08:30:00",
 *   "googleMapsUrl":   "https://maps.google.com/?q=28.6139,77.2090"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusLocationResponse {

    private String busId;
    private String busNumber;
    private String driverName;
    private String routeName;
    private Double latitude;
    private Double longitude;
    private LocalDateTime lastUpdatedTime;

    /** Direct Google Maps link — open in browser or mobile app */
    private String googleMapsUrl;
    private Long studentCount;
    private Integer capacity;
}
