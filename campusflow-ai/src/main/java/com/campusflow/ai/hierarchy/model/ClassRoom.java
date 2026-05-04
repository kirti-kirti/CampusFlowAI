package com.campusflow.ai.hierarchy.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A class/section within a Department.
 * Named ClassRoom to avoid conflict with java.lang.Class.
 *
 * Hierarchy: University → Department → ClassRoom → Student
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "classrooms",
       uniqueConstraints = @UniqueConstraint(
               name = "uk_class_name_dept",
               columnNames = {"name", "departmentId"}),
       indexes = {
           @Index(name = "idx_class_dept",   columnList = "departmentId"),
           @Index(name = "idx_class_tenant", columnList = "tenantId")
       })
public class ClassRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** e.g. "CSE-3A", "CLASS-10A", "Batch-2024" */
    @Column(nullable = false)
    private String name;

    /** FK to Department.id */
    @Column(nullable = false)
    private Long departmentId;

    /** FK to University.id */
    @Column(nullable = false)
    private Long universityId;

    /** Tenant scope */
    @Column(nullable = false)
    private String tenantId;

    /** Academic year or semester */
    @Column
    private String semester;
}
