package com.campusflow.ai.attendance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents one live attendance session started by a teacher.
 *
 * Hierarchy validation (enforced in service):
 *   teacher.departmentId == departmentId
 *   classRoom.departmentId == departmentId
 *   All must share the same collegeId
 *
 * Rotating QR:
 *   QRTokens are generated every QR_ROTATION_SECONDS (10-15 sec).
 *   Only the latest non-expired token is valid.
 *
 * LATE logic:
 *   Student marks within (startTime + lateThresholdMinutes) → PRESENT
 *   Student marks after that window                         → LATE
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attendance_sessions",
       indexes = {
           @Index(name = "idx_sess_college",  columnList = "collegeId"),
           @Index(name = "idx_sess_teacher",  columnList = "teacherId,collegeId"),
           @Index(name = "idx_sess_class",    columnList = "classRoomId,collegeId"),
           @Index(name = "idx_sess_active",   columnList = "isActive,collegeId")
       })
public class AttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sessionId;

    /** Tenant scope — maps to University.code */
    @Column(nullable = false)
    private String collegeId;

    /** FK → Department.id */
    @Column(nullable = false)
    private Long departmentId;

    /** FK → ClassRoom.id */
    @Column(nullable = false)
    private Long classRoomId;

    /** Subject name for display */
    @Column(nullable = false)
    private String subject;

    /** FK → User.id (TEACHER role) */
    @Column(nullable = false)
    private Long teacherId;

    @Column(nullable = false)
    private String teacherName;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    /**
     * Minutes after startTime after which attendance is LATE.
     * Default: 15 minutes.
     */
    @Builder.Default
    @Column(nullable = false)
    private int lateThresholdMinutes = 15;

    /**
     * How often (in seconds) the QR token rotates.
     * Default: 15 seconds.
     */
    @Builder.Default
    @Column(nullable = false)
    private int qrRotationSeconds = 60;

    /** True while session is accepting attendance */
    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;
}
