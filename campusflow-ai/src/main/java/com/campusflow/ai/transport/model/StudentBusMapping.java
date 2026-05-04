package com.campusflow.ai.transport.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Tracks which students are currently on which bus.
 *
 * One active mapping per student at a time.
 * Status transitions: OUT_BUS → IN_BUS (check-in) → OUT_BUS (check-out)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "student_bus_mapping",
       indexes = {
           @Index(name = "idx_sbm_student", columnList = "studentId"),
           @Index(name = "idx_sbm_bus",     columnList = "busId"),
           @Index(name = "idx_sbm_status",  columnList = "busId,status")
       })
public class StudentBusMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK → User.id (STUDENT role) */
    @Column(nullable = false)
    private Long studentId;

    /** FK → Bus.busId */
    @Column(nullable = false)
    private String busId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BusStatus status = BusStatus.OUT_BUS;

    /** Tenant scope */
    @Column(nullable = false)
    private String tenantId;

    /** When the student last checked in */
    @Column
    private LocalDateTime checkedInAt;

    /** When the student last checked out */
    @Column
    private LocalDateTime checkedOutAt;
}
