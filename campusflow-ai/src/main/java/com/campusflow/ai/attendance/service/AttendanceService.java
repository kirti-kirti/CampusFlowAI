package com.campusflow.ai.attendance.service;

import com.campusflow.ai.attendance.dto.*;
import com.campusflow.ai.attendance.model.*;
import com.campusflow.ai.attendance.repository.*;
import com.campusflow.ai.hierarchy.repository.ClassRoomRepository;
import com.campusflow.ai.hierarchy.repository.DepartmentRepository;
import com.campusflow.ai.model.Role;
import com.campusflow.ai.model.User;
import com.campusflow.ai.repository.UserRepository;
import com.campusflow.ai.security.TenantContext;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Flow:
 *  1. Teacher starts session → first QR generated
 *  2. QR has a validity (e.g. 60s)
 *  3. Students scan the QR while it is valid.
 *  4. Teacher's terminal auto-refreshes the QR every 60s.
 *  5. Teacher polls or receives WS push for the latest QR.
 *
 * Security:
 *  - collegeId from JWT — never from request body
 *  - Teacher must belong to session's department
 *  - Student must belong to session's class
 *  - One attendance per student per session
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final SessionRepository    sessionRepository;
    private final QRTokenRepository    qrTokenRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository       userRepository;
    private final DepartmentRepository departmentRepository;
    private final ClassRoomRepository  classRoomRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ─── 1. Start Session (TEACHER) ──────────────────────────────────────────────

    /**
     * Starts a new attendance session and generates the first rotating QR token.
     *
     * Hierarchy validation:
     *  1. Teacher must belong to the given departmentId (same college)
     *  2. ClassRoom must belong to the given departmentId (same college)
     *  3. Teacher cannot have another active session running
     */
    @Transactional
    public SessionResponse startSession(SessionStartRequest request, String teacherEmail) {
        String collegeId = requireTenant();
        User teacher = findByEmail(teacherEmail);
        validateSameTenant(teacher, collegeId);

        if (teacher.getRole() != Role.TEACHER) {
            throw new IllegalArgumentException("Only TEACHER role can start sessions");
        }

        // 1. Validate teacher belongs to the given department
        if (teacher.getUniversityId() == null) {
            log.warn("Teacher {} has no universityId. Attempting recovery from tenantId.", teacher.getId());
            // Fallback: Use tenantId (collegeId) to validate department
            if (!departmentRepository.findByIdAndTenantId(request.getDepartmentId(), collegeId).isPresent()) {
                 throw new IllegalArgumentException("Department " + request.getDepartmentId() + " not found in your university context");
            }
        } else {
            if (!departmentRepository.existsByIdAndUniversityId(request.getDepartmentId(), teacher.getUniversityId())) {
                throw new IllegalArgumentException("Department " + request.getDepartmentId() + " does not belong to your university");
            }
        }

        if (teacher.getDepartmentId() == null || !teacher.getDepartmentId().equals(request.getDepartmentId())) {
            throw new IllegalArgumentException("You do not belong to department " + request.getDepartmentId());
        }

        // 2. Validate classRoom belongs to the given department
        classRoomRepository.findByIdAndDepartmentIdAndTenantId(
                request.getClassRoomId(), request.getDepartmentId(), collegeId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "ClassRoom " + request.getClassRoomId() +
                        " does not belong to department " + request.getDepartmentId()));

        // 3. Prevent duplicate active sessions for same teacher
        sessionRepository.findByTeacherIdAndCollegeIdAndIsActiveTrue(
                teacher.getId(), collegeId).ifPresent(existing -> {
            throw new IllegalStateException(
                    "You already have an active session (id=" + existing.getSessionId() +
                    "). Stop it before starting a new one.");
        });

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("startTime must be before endTime");
        }

        AttendanceSession session = sessionRepository.save(AttendanceSession.builder()
                .collegeId(collegeId)
                .departmentId(request.getDepartmentId())
                .classRoomId(request.getClassRoomId())
                .subject(request.getSubject())
                .teacherId(teacher.getId())
                .teacherName(teacher.getName())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .lateThresholdMinutes(request.getLateThresholdMinutes())
                .qrRotationSeconds(request.getQrRotationSeconds())
                .isActive(true)
                .build());

        // Generate first QR token immediately
        QRToken qrToken = rotateQRToken(session);

        log.info("[{}] Session started: id={}, class={}, subject={}, teacher={}, rotation={}s",
                collegeId, session.getSessionId(), session.getClassRoomId(),
                session.getSubject(), teacher.getId(), session.getQrRotationSeconds());

        return buildSessionResponse(session, qrToken);
    }

    // ─── 2. Get / Rotate QR Token (TEACHER) ──────────────────────────────────────

    /**
     * Returns the current active QR token for a session.
     * If the current token is expired, generates a new one (rotation on demand).
     *
     * Frontend should call this every (qrRotationSeconds - 1) seconds
     * to keep the displayed QR fresh.
     */
    @Transactional
    public SessionResponse getCurrentQR(Long sessionId, String teacherEmail) {
        String collegeId = requireTenant();
        User teacher = findByEmail(teacherEmail);
        validateSameTenant(teacher, collegeId);

        AttendanceSession session = findSession(sessionId, collegeId);

        if (!session.getIsActive()) {
            throw new IllegalStateException("Session " + sessionId + " is not active");
        }
        if (!session.getTeacherId().equals(teacher.getId())) {
            throw new IllegalArgumentException("You are not the teacher of this session");
        }

        // Get current active token or rotate if it's nearing rotation interval
        // We rotate if the token is older than the session's qrRotationSeconds
        QRToken qrToken = qrTokenRepository
                .findBySessionIdAndCollegeIdAndIsActiveTrue(sessionId, collegeId)
                .filter(t -> ChronoUnit.SECONDS.between(t.getCreatedAt(), LocalDateTime.now()) < session.getQrRotationSeconds())
                .orElseGet(() -> rotateQRToken(session));

        return buildSessionResponse(session, qrToken);
    }
    @Transactional
    public SessionResponse getActiveSession(String teacherEmail) {
        String collegeId = requireTenant();
        User teacher = findByEmail(teacherEmail);
        
        AttendanceSession session = sessionRepository
                .findByTeacherIdAndCollegeIdAndIsActiveTrue(teacher.getId(), collegeId)
                .orElseThrow(() -> new IllegalArgumentException("No active session found for your account."));

        QRToken qrToken = qrTokenRepository
                .findBySessionIdAndCollegeIdAndIsActiveTrue(session.getSessionId(), collegeId)
                .filter(t -> ChronoUnit.SECONDS.between(t.getCreatedAt(), LocalDateTime.now()) < session.getQrRotationSeconds())
                .orElseGet(() -> rotateQRToken(session));

        return buildSessionResponse(session, qrToken);
    }

    // ─── 3. Stop Session (TEACHER) ───────────────────────────────────────────────

    @Transactional
    public Map<String, Object> stopSession(Long sessionId, String teacherEmail) {
        String collegeId = requireTenant();
        User teacher = findByEmail(teacherEmail);
        AttendanceSession session = findSession(sessionId, collegeId);

        if (!session.getTeacherId().equals(teacher.getId())) {
            throw new IllegalArgumentException("You are not the teacher of this session");
        }

        session.setIsActive(false);
        sessionRepository.save(session);

        // Deactivate all tokens for this session immediately
        qrTokenRepository.deactivateAllForSession(sessionId, collegeId);

        long count = attendanceRepository.findByCollegeIdAndSessionId(collegeId, sessionId).size();
        log.info("[{}] Session {} stopped. Total attendance: {}", collegeId, sessionId, count);

        return Map.of(
                "message", "Session stopped successfully",
                "sessionId", sessionId,
                "totalAttendance", count
        );
    }

    // ─── 4. Mark Attendance (STUDENT) ────────────────────────────────────────────

    /**
     * Marks attendance for the authenticated student.
     *
     * Validation chain:
     *  1. QR token must exist, be active, not expired, and match collegeId
     *  2. Session must be active
     *  3. Student must belong to the session's class (hierarchy check)
     *  4. No duplicate attendance for this student+session
     *  5. Determine PRESENT or LATE based on session.startTime + lateThreshold
     */
    @Transactional
    public AttendanceResponse markAttendance(AttendanceRequest request, String callerEmail) {
        log.info("Marking attendance: caller={}, token={}, studentId={}", callerEmail, request.getQrToken(), request.getStudentId());
        
        if (callerEmail == null) {
            throw new IllegalArgumentException("Authentication required: callerEmail is null");
        }

        String collegeId = requireTenant();
        User caller = findByEmail(callerEmail);
        validateSameTenant(caller, collegeId);

        User student;
        if (caller.getRole() == Role.TEACHER || caller.getRole() == Role.ADMIN) {
            if (request.getStudentId() == null || request.getStudentId().isBlank()) {
                throw new IllegalArgumentException("studentId is required for central scanner mode");
            }
            
            Long idToFind = null;
            try {
                idToFind = Long.parseLong(request.getStudentId());
            } catch (NumberFormatException e) {
                // Not a numeric ID
            }

            if (idToFind != null) {
                student = userRepository.findByIdAndTenantId(idToFind, collegeId)
                        .orElseThrow(() -> new IllegalArgumentException("Student with ID " + request.getStudentId() + " not found"));
            } else {
                student = userRepository.findByEmail(request.getStudentId())
                        .filter(u -> collegeId.equals(u.getTenantId()))
                        .orElseThrow(() -> new IllegalArgumentException("Student with identifier " + request.getStudentId() + " not found. Note: central scanning requires student ID or Email."));
            }
            
            if (student.getRole() != Role.STUDENT) {
                throw new IllegalArgumentException("User " + request.getStudentId() + " is not a STUDENT");
            }
        } else {
            student = caller;
            if (student.getRole() != Role.STUDENT) {
                throw new IllegalArgumentException("Only STUDENT role can mark their own attendance");
            }
        }

        // 1. Validate QR token — active + not expired + same college
        QRToken qrToken;
        if (request.getQrToken() != null && !request.getQrToken().isBlank()) {
            qrToken = qrTokenRepository.findValidToken(request.getQrToken(), collegeId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Invalid or expired QR token. Ask your teacher to refresh the QR."));
        } else if (caller.getRole() == Role.TEACHER || caller.getRole() == Role.ADMIN) {
            qrToken = qrTokenRepository.findActiveTokenByTeacher(caller.getId(), collegeId)
                    .orElseThrow(() -> new IllegalArgumentException("You have no active session. Start a session first."));
        } else {
            throw new IllegalArgumentException("QR token is required");
        }

        // 2. Find session and check it's active
        AttendanceSession session = findSession(qrToken.getSessionId(), collegeId);
        if (!session.getIsActive()) {
            throw new IllegalStateException("This session has ended.");
        }

        // 3. Hierarchy check: student must belong to session's class
        if (student.getClassRoomId() == null ||
                !student.getClassRoomId().equals(session.getClassRoomId())) {
            throw new IllegalArgumentException(
                    "You do not belong to the class of this session. " +
                    "Your class: " + student.getClassRoomId() +
                    ", Session class: " + session.getClassRoomId());
        }

        // 4. Prevent duplicate
        if (attendanceRepository.existsByStudentIdAndSessionIdAndCollegeId(
                student.getId(), session.getSessionId(), collegeId)) {
            throw new IllegalStateException("Attendance already marked for this session.");
        }

        // 5. PRESENT or LATE
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lateThreshold = session.getStartTime()
                .plusMinutes(session.getLateThresholdMinutes());
        AttendanceStatus status = now.isAfter(lateThreshold)
                ? AttendanceStatus.LATE
                : AttendanceStatus.PRESENT;

        Attendance saved = attendanceRepository.save(Attendance.builder()
                .collegeId(collegeId)
                .studentId(student.getId())
                .sessionId(session.getSessionId())
                .classRoomId(session.getClassRoomId())
                .departmentId(session.getDepartmentId())
                .subject(session.getSubject())
                .status(status)
                .timestamp(now)
                .build());

        log.info("[{}] Student {} marked {} for session {} ({})",
                collegeId, student.getId(), status,
                session.getSessionId(), session.getSubject());

        return toResponse(saved);
    }

    // ─── 5. View APIs ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getStudentAttendance(String studentEmail) {
        String collegeId = requireTenant();
        User student = findByEmail(studentEmail);
        validateSameTenant(student, collegeId);
        return attendanceRepository.findByCollegeIdAndStudentId(collegeId, student.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getSessionAttendance(Long sessionId, String teacherEmail) {
        String collegeId = requireTenant();
        User teacher = findByEmail(teacherEmail);
        AttendanceSession session = findSession(sessionId, collegeId);
        if (!session.getTeacherId().equals(teacher.getId())) {
            throw new IllegalArgumentException("You are not the teacher of this session");
        }
        return attendanceRepository.findByCollegeIdAndSessionId(collegeId, sessionId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getParentAttendance(String parentEmail) {
        String collegeId = requireTenant();
        User parent = findByEmail(parentEmail);
        validateSameTenant(parent, collegeId);

        if (parent.getStudentId() == null || parent.getStudentId().isBlank()) {
            throw new IllegalArgumentException("No student linked to this parent account.");
        }

        Long studentId = parseLong(parent.getStudentId().split(",")[0].trim(), "studentId");
        User child = userRepository.findByIdAndTenantId(studentId, collegeId)
                .orElseThrow(() -> new IllegalArgumentException("Linked student not found"));
        validateSameTenant(child, collegeId);

        return attendanceRepository.findByCollegeIdAndStudentId(collegeId, studentId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAllAttendance() {
        String collegeId = requireTenant();
        return attendanceRepository.findByCollegeId(collegeId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ─── 6. Reports ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AttendanceReportResponse getStudentReport(String studentEmail) {
        String collegeId = requireTenant();
        User student = findByEmail(studentEmail);
        validateSameTenant(student, collegeId);

        if (student.getRole() != Role.STUDENT) {
            log.warn("User {} is not a student but requested student report", student.getId());
            return AttendanceReportResponse.builder()
                    .collegeId(collegeId)
                    .studentId(student.getId())
                    .percentage(0.0)
                    .subjectBreakdown(Collections.emptyList())
                    .build();
        }

        return buildReport(collegeId, student.getId(), student.getClassRoomId());
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(String email) {
        String collegeId = requireTenant();
        User user = findByEmail(email);
        validateSameTenant(user, collegeId);

        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        long presentToday = attendanceRepository.countByCollegeIdAndTimestampBetween(collegeId, startOfDay, endOfDay);
        long activeSessions = sessionRepository.countByCollegeIdAndIsActiveTrue(collegeId);
        long totalStudents = userRepository.countByTenantIdAndRole(collegeId, Role.STUDENT);

        double avgAttendance = totalStudents > 0 ? round2((presentToday * 100.0) / totalStudents) : 0.0;

        return DashboardStatsResponse.builder()
                .totalPresentToday(presentToday)
                .totalActiveSessions(activeSessions)
                .averageAttendancePercentage(avgAttendance)
                .totalStudents(totalStudents)
                .build();
    }

    @Transactional(readOnly = true)
    public AttendanceReportResponse getParentReport(String parentEmail) {
        String collegeId = requireTenant();
        User parent = findByEmail(parentEmail);
        validateSameTenant(parent, collegeId);

        if (parent.getStudentId() == null || parent.getStudentId().isBlank()) {
            throw new IllegalArgumentException("No student linked to this parent account.");
        }
        Long studentId = parseLong(parent.getStudentId().split(",")[0].trim(), "studentId");
        User student = userRepository.findByIdAndTenantId(studentId, collegeId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        return buildReport(collegeId, studentId, student.getClassRoomId());
    }

    @Transactional(readOnly = true)
    public List<AttendanceReportResponse> getClassReport(Long classRoomId) {
        String collegeId = requireTenant();
        long totalSessions = sessionRepository.countByCollegeIdAndClassRoomId(collegeId, classRoomId);

        return attendanceRepository.getClassSummary(collegeId, classRoomId).stream()
                .map(row -> {
                    Long studentId = ((Number) row[0]).longValue();
                    long total     = ((Number) row[1]).longValue();
                    long attended  = ((Number) row[2]).longValue();
                    long absent    = Math.max(0, totalSessions - attended);
                    double pct     = totalSessions > 0
                            ? round2((attended * 100.0) / totalSessions) : 0.0;
                    return AttendanceReportResponse.builder()
                            .collegeId(collegeId).studentId(studentId)
                            .classRoomId(classRoomId).totalSessions(totalSessions)
                            .attendedSessions(attended).absent(absent).percentage(pct)
                            .build();
                }).collect(Collectors.toList());
    }

    // ─── Scheduler: Auto-close expired sessions only ─────────────────────────────
    // NOTE: QR rotation is NOT done by scheduler.
    // QR regenerates ONLY when a student successfully scans (in markAttendance).

    /**
     * Runs every 60 seconds.
     * Auto-closes sessions that have passed their endTime.
     */
    @org.springframework.scheduling.annotation.Scheduled(fixedDelay = 60000)
    @Transactional
    public void autoCloseSessions() {
        List<AttendanceSession> expired = sessionRepository.findExpiredActiveSessions();
        for (AttendanceSession session : expired) {
            session.setIsActive(false);
            sessionRepository.save(session);
            qrTokenRepository.deactivateAllForSession(
                    session.getSessionId(), session.getCollegeId());
            log.info("[{}] Session {} auto-closed (past endTime)",
                    session.getCollegeId(), session.getSessionId());
        }
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────────

    /**
     * Core rotation logic:
     *  1. Deactivate all existing tokens for this session
     *  2. Generate a new UUID token with expiry = now + qrRotationSeconds
     *  3. Save and return
     */
    private QRToken rotateQRToken(AttendanceSession session) {
        // NOTE: We no longer deactivate old tokens immediately. 
        // This allows a "grace period" where the previous QR still works for a few seconds 
        // after the teacher's screen has already moved to the next one.

        LocalDateTime now = LocalDateTime.now();
        // Expiry is rotation interval + 30s grace period
        LocalDateTime expiry = now.plusSeconds(session.getQrRotationSeconds() + 30);

        QRToken newToken = qrTokenRepository.save(QRToken.builder()
                .token(UUID.randomUUID().toString())
                .sessionId(session.getSessionId())
                .collegeId(session.getCollegeId())
                .createdAt(now)
                .expiryTime(expiry)
                .isActive(true)
                .build());

        log.debug("[{}] New QR token for session {}: expires in {}s",
                session.getCollegeId(), session.getSessionId(),
                session.getQrRotationSeconds());

        // Real-time Push: Notify teacher's terminal to update the QR display
        try {
            SessionResponse response = buildSessionResponse(session, newToken);
            messagingTemplate.convertAndSend("/topic/session/" + session.getSessionId(), response);
            log.info("[{}] Real-time QR rotation pushed for session {}", session.getCollegeId(), session.getSessionId());
        } catch (Exception e) {
            log.warn("Failed to push QR rotation via WebSocket: {}", e.getMessage());
        }

        return newToken;
    }

    private SessionResponse buildSessionResponse(AttendanceSession session, QRToken qrToken) {
        long secondsLeft = ChronoUnit.SECONDS.between(
                LocalDateTime.now(), qrToken.getExpiryTime());

        return SessionResponse.builder()
                .sessionId(session.getSessionId())
                .collegeId(session.getCollegeId())
                .departmentId(session.getDepartmentId())
                .classRoomId(session.getClassRoomId())
                .subject(session.getSubject())
                .teacherId(session.getTeacherId())
                .teacherName(session.getTeacherName())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .lateThresholdMinutes(session.getLateThresholdMinutes())
                .qrRotationSeconds(session.getQrRotationSeconds())
                .isActive(session.getIsActive())
                .qrToken(qrToken.getToken())
                .qrImage(generateQRImage(qrToken.getToken()))
                .qrExpiresAt(qrToken.getExpiryTime())
                .secondsUntilRotation(Math.max(0, secondsLeft))
                .build();
    }

    private AttendanceReportResponse buildReport(
            String collegeId, Long studentId, Long classRoomId) {

        long totalSessions = classRoomId != null
                ? sessionRepository.countByCollegeIdAndClassRoomId(collegeId, classRoomId) : 0;

        long present  = attendanceRepository.countByCollegeIdAndStudentIdAndStatus(
                collegeId, studentId, AttendanceStatus.PRESENT);
        long late     = attendanceRepository.countByCollegeIdAndStudentIdAndStatus(
                collegeId, studentId, AttendanceStatus.LATE);
        long attended = present + late;
        long absent   = Math.max(0, totalSessions - attended);
        double pct    = totalSessions > 0 ? round2((attended * 100.0) / totalSessions) : 0.0;

        List<AttendanceReportResponse.SubjectBreakdown> breakdown =
                attendanceRepository.getSubjectWiseSummary(collegeId, studentId).stream()
                        .map(row -> {
                            String subject = (String) row[0];
                            long total     = ((Number) row[1]).longValue();
                            long att       = ((Number) row[2]).longValue();
                            double subPct  = total > 0 ? round2((att * 100.0) / total) : 0.0;
                            return AttendanceReportResponse.SubjectBreakdown.builder()
                                    .subject(subject).total(total).attended(att)
                                    .percentage(subPct).build();
                        }).collect(Collectors.toList());

        return AttendanceReportResponse.builder()
                .collegeId(collegeId).studentId(studentId).classRoomId(classRoomId)
                .totalSessions(totalSessions).present(present).late(late).absent(absent)
                .attendedSessions(attended).percentage(pct).subjectBreakdown(breakdown)
                .build();
    }

    private String generateQRImage(String content) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, 300, 300);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return Base64.getEncoder().encodeToString(out.toByteArray());
        } catch (WriterException | IOException e) {
            log.error("QR image generation failed", e);
            throw new RuntimeException("QR image generation failed");
        }
    }

    private AttendanceSession findSession(Long sessionId, String collegeId) {
        return sessionRepository.findBySessionIdAndCollegeId(sessionId, collegeId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Session not found: " + sessionId));
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    private void validateSameTenant(User user, String collegeId) {
        if (!collegeId.equals(user.getTenantId())) {
            throw new IllegalArgumentException(
                    "Access denied: user does not belong to this college");
        }
    }

    private String requireTenant() {
        String t = TenantContext.getCurrentTenant();
        if (t == null || t.isBlank()) {
            throw new IllegalStateException("Tenant context not set");
        }
        return t;
    }

    private Long parseLong(String v, String field) {
        try { return Long.parseLong(v); }
        catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid " + field + ": " + v);
        }
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private AttendanceResponse toResponse(Attendance a) {
        return AttendanceResponse.builder()
                .id(a.getId()).collegeId(a.getCollegeId())
                .studentId(a.getStudentId()).sessionId(a.getSessionId())
                .classRoomId(a.getClassRoomId()).departmentId(a.getDepartmentId())
                .subject(a.getSubject()).status(a.getStatus()).timestamp(a.getTimestamp())
                .build();
    }
}
