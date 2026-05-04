package com.campusflow.ai.attendance.repository;

import com.campusflow.ai.attendance.model.Attendance;
import com.campusflow.ai.attendance.model.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByCollegeIdAndStudentId(String collegeId, Long studentId);
    List<Attendance> findByCollegeIdAndSessionId(String collegeId, Long sessionId);
    List<Attendance> findByCollegeId(String collegeId);

    boolean existsByStudentIdAndSessionIdAndCollegeId(
            Long studentId, Long sessionId, String collegeId);

    long countByCollegeIdAndStudentIdAndStatus(
            String collegeId, Long studentId, AttendanceStatus status);

    long countByCollegeIdAndTimestampBetween(String collegeId, LocalDateTime start, LocalDateTime end);

    @Query("""
        SELECT a.subject,
               COUNT(a),
               SUM(CASE WHEN a.status IN ('PRESENT','LATE') THEN 1 ELSE 0 END)
        FROM Attendance a
        WHERE a.collegeId = :collegeId AND a.studentId = :studentId
        GROUP BY a.subject
        """)
    List<Object[]> getSubjectWiseSummary(
            @Param("collegeId") String collegeId,
            @Param("studentId") Long studentId);

    @Query("""
        SELECT a.studentId,
               COUNT(a),
               SUM(CASE WHEN a.status IN ('PRESENT','LATE') THEN 1 ELSE 0 END)
        FROM Attendance a
        WHERE a.collegeId = :collegeId AND a.classRoomId = :classRoomId
        GROUP BY a.studentId
        """)
    List<Object[]> getClassSummary(
            @Param("collegeId") String collegeId,
            @Param("classRoomId") Long classRoomId);
}
