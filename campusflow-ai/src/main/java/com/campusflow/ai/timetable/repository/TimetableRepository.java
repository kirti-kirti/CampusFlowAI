package com.campusflow.ai.timetable.repository;

import com.campusflow.ai.timetable.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Data access layer for Timetable entity.
 * Spring Data JPA auto-implements all methods.
 */
public interface TimetableRepository extends JpaRepository<Timetable, Long> {

    /**
     * Used by STUDENT to view their class timetable.
     * Used by PARENT to view their child's class timetable.
     */
    List<Timetable> findByClassId(String classId);

    /**
     * Used by TEACHER to view their own assigned periods.
     * teacherId is a String matching the teacher's user ID.
     */
    List<Timetable> findByTeacherId(String teacherId);

    /**
     * Used by ADMIN to check for scheduling conflicts
     * (same class, same day, overlapping time).
     */
    List<Timetable> findByClassIdAndDayOfWeek(String classId, String dayOfWeek);
}
