package com.campusflow.ai.transport.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a school bus registered in the system.
 *
 * One Bus → many BusLocation records (location history).
 * The busId is a human-readable identifier (e.g. "BUS-01"),
 * separate from the auto-generated DB primary key.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "buses")
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Human-readable bus identifier (e.g. "BUS-01", "BUS-A") */
    @Column(nullable = false, unique = true)
    private String busId;

    /** Vehicle registration number (e.g. "MH-12-AB-1234") */
    @Column(nullable = false)
    private String busNumber;

    /** Full name of the assigned driver */
    @Column(nullable = false)
    private String driverName;

    /** References the driver's user ID in the users table */
    @Column(nullable = false)
    private String driverId;

    /** Route description (e.g. "Sector-5 → School → Sector-12") */
    @Column(nullable = false)
    private String routeName;

    /**
     * The class/student group assigned to this bus.
     * Used to resolve which bus a student or parent should track.
     * Example: "CLASS-10A" or a comma-separated list.
     */
    @Column
    private String assignedClass;

    @Column
    @Builder.Default
    private Integer capacity = 40;
}
