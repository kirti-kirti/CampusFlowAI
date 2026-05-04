package com.campusflow.ai.attendance.repository;

import com.campusflow.ai.attendance.model.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SessionRepository extends JpaRepository<AttendanceSession, Long> {

    Optional<AttendanceSession> findBySessionIdAndCollegeId(Long sessionId, String collegeId);

    /** Find the active session for a teacher (only one active session per teacher) */
    Optional<AttendanceSession> findByTeacherIdAndCollegeIdAndIsActiveTrue(
            Long teacherId, String collegeId);

    /** All active sessions for a class */
    List<AttendanceSession> findByClassRoomIdAndCollegeIdAndIsActiveTrue(
            Long classRoomId, String collegeId);

    List<AttendanceSession> findByCollegeId(String collegeId);

    List<AttendanceSession> findByTeacherIdAndCollegeId(Long teacherId, String collegeId);

    long countByCollegeIdAndClassRoomId(String collegeId, Long classRoomId);

    long countByCollegeIdAndIsActiveTrue(String collegeId);


    /** Find all sessions that are active but past their endTime (for auto-close scheduler) */
    @Query("SELECT s FROM AttendanceSession s WHERE s.isActive = true AND s.endTime < CURRENT_TIMESTAMP")
    List<AttendanceSession> findExpiredActiveSessions();
}
