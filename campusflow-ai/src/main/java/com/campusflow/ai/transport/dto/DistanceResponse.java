package com.campusflow.ai.transport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response for GET /api/transport/distance
 * Returns the straight-line distance between the user and the bus.
 *
 * Sample JSON:
 * {
 *   "busId":              "BUS-01",
 *   "busLatitude":        28.6139,
 *   "busLongitude":       77.2090,
 *   "userLatitude":       28.6200,
 *   "userLongitude":      77.2150,
 *   "distanceKm":         0.87,
 *   "googleMapsUrl":      "https://maps.google.com/?q=28.6139,77.2090",
 *   "googleDirectionsUrl":"https://www.google.com/maps/dir/28.6200,77.2150/28.6139,77.2090"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DistanceResponse {

    private String busId;
    private Double busLatitude;
    private Double busLongitude;
    private Double userLatitude;
    private Double userLongitude;

    /** Straight-line distance in kilometres (Haversine formula) */
    private Double distanceKm;

    /** Opens bus location in Google Maps */
    private String googleMapsUrl;

    /** Opens turn-by-turn directions from user to bus in Google Maps */
    private String googleDirectionsUrl;
}
