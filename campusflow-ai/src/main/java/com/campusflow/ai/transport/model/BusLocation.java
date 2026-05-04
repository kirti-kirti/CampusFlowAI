package com.campusflow.ai.transport.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Stores a GPS location ping from a bus.
 *
 * Each update from the driver creates a new record.
 * The latest record (by timestamp) is the current bus position.
 *
 * Latitude range:  -90.0  to  90.0
 * Longitude range: -180.0 to 180.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bus_locations",
       indexes = @Index(name = "idx_bus_location_busid", columnList = "busId"))
public class BusLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** References Bus.busId — the human-readable bus identifier */
    @Column(nullable = false)
    private String busId;

    /** GPS latitude — valid range: -90.0 to 90.0 */
    @Column(nullable = false)
    private Double latitude;

    /** GPS longitude — valid range: -180.0 to 180.0 */
    @Column(nullable = false)
    private Double longitude;

    /** When this location ping was recorded */
    @Column(nullable = false)
    private LocalDateTime timestamp;
}
