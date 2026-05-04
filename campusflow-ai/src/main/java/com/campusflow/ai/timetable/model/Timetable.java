package com.campusflow.ai.timetable.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a single timetable slot for a class.
 *
 * One row = one subject period for a specific class on a specific day.
 * Example: Class-10A | Mathematics | Monday | 09:00 - 10:00 | Mr. John
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "timetable")
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The class this slot belongs to (e.g. "CLASS-10A", "CLASS-9B") */
    @Column(nullable = false)
    private String classId;

    /** Subject being taught (e.g. "Mathematics", "Physics") */
    @Column(nullable = false)
    private String subject;

    /** References the teacher's user ID in the users table */
    @Column(nullable = false)
    private String teacherId;

    /** Denormalized teacher name for fast display without a join */
    @Column(nullable = false)
    private String teacherName;

    /** Day of the week (e.g. "MONDAY", "TUESDAY") */
    @Column(nullable = false)
    private String dayOfWeek;

    /** Period start time in HH:mm format (e.g. "09:00") */
    @Column(nullable = false)
    private String startTime;

    /** Period end time in HH:mm format (e.g. "10:00") */
    @Column(nullable = false)
    private String endTime;
}
