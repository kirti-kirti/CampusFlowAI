package com.campusflow.ai.attendance.controller;

import com.campusflow.ai.attendance.dto.*;
import com.campusflow.ai.attendance.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Rotating QR Attendance Controller.
 *
 * ┌──────────────────────────────────────────┬──────────────────────────────┐
 * │ Endpoint                                 │ Role                         │
 * ├──────────────────────────────────────────┼──────────────────────────────┤
 * │ POST /session/start                      │ TEACHER                      │
 * │ GET  /session/{id}/qr                    │ TEACHER (rotating QR)        │
 * │ POST /session/{id}/stop                  │ TEACHER                      │
 * │ POST /mark                               │ STUDENT                      │
 * │ GET  /student                            │ STUDENT (JWT)                │
 * │ GET  /session/{id}                       │ TEACHER (JWT)                │
 * │ GET  /parent                             │ PARENT  (JWT)                │
 * │ GET  /all                                │ ADMIN                        │
 * │ GET  /report/student                     │ STUDENT                      │
 * │ GET  /report/parent                      │ PARENT                       │
 * │ GET  /report/class/{classRoomId}         │ TEACHER, ADMIN               │
 * └──────────────────────────────────────────┴──────────────────────────────┘
 */
@Tag(name = "Attendance", description = "Rotating QR attendance — multi-tenant, hierarchy-validated, PRESENT/LATE/ABSENT")
@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AttendanceController {

    private final AttendanceService attendanceService;

    // ─── TEACHER: Start Session ───────────────────────────────────────────────────

    @Operation(
        summary = "Start attendance session",
        description = """
                **Role: TEACHER**
                
                Starts a new attendance session and generates the first rotating QR token.
                
                **Hierarchy validation:**
                - Teacher must belong to the given `departmentId`
                - `classRoomId` must belong to the given `departmentId`
                - All must share the same `collegeId` from JWT
                
                **Rotating QR:**
                - First token generated immediately
                - Scheduler auto-rotates every `qrRotationSeconds` (default: 15s)
                - Teacher polls `GET /session/{id}/qr` to get the latest token
                
                **LATE logic:**
                - Student marks within `startTime + lateThresholdMinutes` → PRESENT
                - After that → LATE
                """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Session started with first QR token",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = SessionResponse.class),
                examples = @ExampleObject(value = """
                    {
                      "sessionId": 1,
                      "collegeId": "COLLEGE-001",
                      "departmentId": 1,
                      "classRoomId": 1,
                      "subject": "DBMS",
                      "teacherName": "Mr. John",
                      "startTime": "2026-05-01T10:00:00",
                      "endTime": "2026-05-01T11:00:00",
                      "lateThresholdMinutes": 15,
                      "qrRotationSeconds": 15,
                      "isActive": true,
                      "qrToken": "550e8400-e29b-41d4-a716-446655440000",
                      "qrImage": "iVBORw0KGgoAAAANSUhEUgAA...",
                      "qrExpiresAt": "2026-05-01T10:00:15",
                      "secondsUntilRotation": 15
                    }"""))),
        @ApiResponse(responseCode = "400", description = "Hierarchy validation failed or already has active session"),
        @ApiResponse(responseCode = "403", description = "TEACHER role required")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = @ExampleObject(value = """
            {
              "departmentId":         1,
              "classRoomId":          1,
              "subject":              "DBMS",
              "startTime":            "2026-05-01T10:00:00",
              "endTime":              "2026-05-01T11:00:00",
              "lateThresholdMinutes": 15,
              "qrRotationSeconds":    15
            }"""))
    )
    @PostMapping("/session/start")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<SessionResponse> startSession(
            @Valid @RequestBody SessionStartRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(attendanceService.startSession(request, userDetails.getUsername()));
    }

    // ─── TEACHER: Get Current Rotating QR ────────────────────────────────────────

    @Operation(
        summary = "Get current rotating QR token",
        description = """
                **Role: TEACHER**
                
                Returns the current active QR token for a session.
                If the token has expired, a new one is generated automatically.
                
                **Frontend should poll this every (`qrRotationSeconds` - 1) seconds**
                to keep the displayed QR fresh on the classroom screen.
                
                Response includes `secondsUntilRotation` — use this to schedule the next poll.
                """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Current QR token returned",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    {
                      "sessionId": 1,
                      "qrToken": "new-uuid-after-rotation",
                      "qrImage": "iVBORw0KGgoAAAANSUhEUgAA...",
                      "qrExpiresAt": "2026-05-01T10:00:30",
                      "secondsUntilRotation": 12
                    }"""))),
        @ApiResponse(responseCode = "400", description = "Session not active or not your session")
    })
    @GetMapping("/session/{sessionId}/qr")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<SessionResponse> getCurrentQR(
            @Parameter(description = "Session ID", example = "1")
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                attendanceService.getCurrentQR(sessionId, userDetails.getUsername()));
    }

    @Operation(summary = "Get my current active session",
               description = "**Role: TEACHER** — Returns the current active session for the logged-in teacher if one exists.")
    @GetMapping("/session/active")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<SessionResponse> getActiveSession(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(attendanceService.getActiveSession(userDetails.getUsername()));
    }

    // ─── TEACHER: Stop Session ────────────────────────────────────────────────────

    @Operation(
        summary = "Stop attendance session",
        description = "**Role: TEACHER**\n\nStops the session and deactivates all QR tokens. " +
                      "Returns total attendance count."
    )
    @PostMapping("/session/{sessionId}/stop")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> stopSession(
            @Parameter(description = "Session ID", example = "1")
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                attendanceService.stopSession(sessionId, userDetails.getUsername()));
    }

    // ─── STUDENT: Mark Attendance ─────────────────────────────────────────────────

    @Operation(
        summary = "Mark attendance by scanning QR",
        description = """
                **Role: STUDENT**
                
                Student submits the QR token after scanning from the classroom screen.
                
                **Security checks:**
                - Token must be active and not expired (rotates every 10-15 sec)
                - Token must belong to student's college (cross-tenant blocked)
                - Student must belong to the session's class (hierarchy check)
                - One attendance per student per session (duplicate blocked)
                
                **Status:**
                - Within `lateThresholdMinutes` of session start → **PRESENT**
                - After threshold → **LATE**
                """
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Attendance marked",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    {
                      "id": 1,
                      "studentId": 5,
                      "sessionId": 1,
                      "subject": "DBMS",
                      "status": "PRESENT",
                      "timestamp": "2026-05-01T10:05:00"
                    }"""))),
        @ApiResponse(responseCode = "400", description = "Invalid/expired QR, wrong class, or duplicate"),
        @ApiResponse(responseCode = "403", description = "STUDENT role required")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = @ExampleObject(
            value = "{ \"qrToken\": \"550e8400-e29b-41d4-a716-446655440000\" }"))
    )
    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<AttendanceResponse> markAttendance(
            @Valid @RequestBody AttendanceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(attendanceService.markAttendance(request, userDetails.getUsername()));
    }

    @Operation(summary = "Get dashboard real-time stats",
               description = "Returns real-time data for the dashboard: present today, active sessions, etc.")
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT', 'ADMIN', 'PARENT')")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(attendanceService.getDashboardStats(userDetails.getUsername()));
    }

    // ─── View APIs ────────────────────────────────────────────────────────────────

    @Operation(summary = "View my attendance (Student)",
               description = "**Role: STUDENT** — Returns all attendance records. Identity from JWT.")
    @GetMapping("/student")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<List<AttendanceResponse>> getStudentAttendance(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                attendanceService.getStudentAttendance(userDetails.getUsername()));
    }

    @Operation(summary = "View session attendance (Teacher)",
               description = "**Role: TEACHER** — Returns all attendance for a specific session.")
    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<AttendanceResponse>> getSessionAttendance(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                attendanceService.getSessionAttendance(sessionId, userDetails.getUsername()));
    }

    @Operation(summary = "View child's attendance (Parent)",
               description = "**Role: PARENT** — Returns child's attendance. Identity from JWT.")
    @GetMapping("/parent")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<List<AttendanceResponse>> getParentAttendance(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                attendanceService.getParentAttendance(userDetails.getUsername()));
    }

    @Operation(summary = "View all attendance (Admin)",
               description = "**Role: ADMIN** — Returns all attendance for the admin's college.")
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AttendanceResponse>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    // ─── Reports ──────────────────────────────────────────────────────────────────

    @Operation(summary = "My attendance report (Student)",
               description = "**Role: STUDENT** — Analytics: total, present, late, absent, %, subject breakdown.")
    @GetMapping("/report/student")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<AttendanceReportResponse> getStudentReport(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                attendanceService.getStudentReport(userDetails.getUsername()));
    }

    @Operation(summary = "Child's attendance report (Parent)",
               description = "**Role: PARENT** — Analytics for linked child.")
    @GetMapping("/report/parent")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<AttendanceReportResponse> getParentReport(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                attendanceService.getParentReport(userDetails.getUsername()));
    }

    @Operation(summary = "Class attendance report (Teacher/Admin)",
               description = "**Role: TEACHER or ADMIN** — Per-student % for entire class.")
    @GetMapping("/report/class/{classRoomId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<AttendanceReportResponse>> getClassReport(
            @Parameter(description = "ClassRoom ID", example = "1")
            @PathVariable Long classRoomId) {
        return ResponseEntity.ok(attendanceService.getClassReport(classRoomId));
    }
}
