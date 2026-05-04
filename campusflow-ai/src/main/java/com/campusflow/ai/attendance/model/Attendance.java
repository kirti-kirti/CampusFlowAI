package com.campusflow.ai.attendance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * One attendance record per student per session.
 *
 * Unique constraint: one student can only mark once per session per college.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attendance",
       uniqueConstraints = @UniqueConstraint(
               name = "uk_student_session_college",
               columnNames = {"studentId", "sessionId", "collegeId"}),
       indexes = {
           @Index(name = "idx_att_student",  columnList = "studentId,collegeId"),
           @Index(name = "idx_att_session",  columnList = "sessionId,collegeId"),
           @Index(name = "idx_att_class",    columnList = "classRoomId,collegeId")
       })
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String collegeId;

    @Column(nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private Long sessionId;

    /** Denormalized from session for fast reporting */
    @Column(nullable = false)
    private Long classRoomId;

    @Column(nullable = false)
    private Long departmentId;

    @Column(nullable = false)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
