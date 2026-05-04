package com.campusflow.ai.hierarchy.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Department belongs to a University.
 * Teachers and Students are assigned to a Department.
 *
 * Hierarchy: University → Department → Class
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "departments",
       uniqueConstraints = @UniqueConstraint(
               name = "uk_dept_name_university",
               columnNames = {"name", "universityId"}),
       indexes = @Index(name = "idx_dept_university", columnList = "universityId"))
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /** FK to University.id — enforces hierarchy */
    @Column(nullable = false)
    private Long universityId;

    /** Tenant scope — mirrors University.code */
    @Column(nullable = false)
    private String tenantId;

    @Column
    private String description;
}
