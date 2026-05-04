package com.campusflow.ai.attendance.repository;

import com.campusflow.ai.attendance.model.QRToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface QRTokenRepository extends JpaRepository<QRToken, Long> {

    /**
     * Find a valid token — active + not expired + same college.
     * Uses CURRENT_TIMESTAMP so no Java LocalDateTime param needed.
     */
    @Query("""
        SELECT q FROM QRToken q
        WHERE q.token = :token
          AND q.collegeId = :collegeId
          AND q.isActive = true
          AND q.expiryTime > CURRENT_TIMESTAMP
        """)
    Optional<QRToken> findValidToken(
            @Param("token") String token,
            @Param("collegeId") String collegeId);

    /** Get the current active token for a session */
    Optional<QRToken> findBySessionIdAndCollegeIdAndIsActiveTrue(
            Long sessionId, String collegeId);

    /** Deactivate all tokens for a session (called on rotation and session stop) */
    @Modifying
    @Query("UPDATE QRToken q SET q.isActive = false " +
           "WHERE q.sessionId = :sessionId AND q.collegeId = :collegeId")
    void deactivateAllForSession(
            @Param("sessionId") Long sessionId,
            @Param("collegeId") String collegeId);

    /** Find the current active token for a teacher's active session */
    @Query("""
        SELECT q FROM QRToken q
        JOIN AttendanceSession s ON q.sessionId = s.sessionId
        WHERE s.teacherId = :teacherId
          AND s.collegeId = :collegeId
          AND s.isActive = true
          AND q.isActive = true
          AND q.expiryTime > CURRENT_TIMESTAMP
        """)
    Optional<QRToken> findActiveTokenByTeacher(
            @Param("teacherId") Long teacherId,
            @Param("collegeId") String collegeId);
}
