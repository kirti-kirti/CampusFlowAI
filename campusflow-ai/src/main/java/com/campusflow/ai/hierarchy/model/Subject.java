package com.campusflow.ai.hierarchy.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A subject taught in a ClassRoom by a Teacher.
 *
 * Hierarchy: ClassRoom → Subject ← Teacher
 * Validation: Teacher must belong to the same Department as the ClassRoom.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "subjects",
       indexes = {
           @Index(name = "idx_subject_class",   columnList = "classRoomId"),
           @Index(name = "idx_subject_teacher", columnList = "teacherId"),
           @Index(name = "idx_subject_tenant",  columnList = "tenantId")
       })
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /** FK to ClassRoom.id */
    @Column(nullable = false)
    private Long classRoomId;

    /** FK to User.id (TEACHER role) */
    @Column(nullable = false)
    private Long teacherId;

    /** Denormalized for fast queries */
    @Column(nullable = false)
    private Long departmentId;

    @Column(nullable = false)
    private Long universityId;

    @Column(nullable = false)
    private String tenantId;
}
