package com.campusflow.ai.timetable.controller;

import com.campusflow.ai.timetable.dto.TimetableRequest;
import com.campusflow.ai.timetable.dto.TimetableResponse;
import com.campusflow.ai.timetable.service.TimetableService;
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
 * REST controller for the Timetable module.
 *
 * Role matrix:
 * ┌──────────────────────────────────────┬──────────────────────────────┐
 * │ Endpoint                             │ Allowed Roles                │
 * ├──────────────────────────────────────┼──────────────────────────────┤
 * │ POST   /api/timetable/create         │ ADMIN                        │
 * │ PUT    /api/timetable/update/{id}    │ ADMIN                        │
 * │ DELETE /api/timetable/delete/{id}    │ ADMIN                        │
 * │ GET    /api/timetable/teacher        │ TEACHER (ID from JWT)        │
 * │ GET    /api/timetable/class/{classId}│ STUDENT, ADMIN               │
 * │ GET    /api/timetable/parent         │ PARENT (ID from JWT)         │
 * └──────────────────────────────────────┴──────────────────────────────┘
 *
 * IMPORTANT: TEACHER and PARENT endpoints extract user identity from JWT.
 * No IDs need to be passed manually in the URL.
 */
@Tag(name = "Timetable", description = "Timetable management with role-based access")
@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TimetableController {

    private final TimetableService timetableService;

    // ─── ADMIN: Create ───────────────────────────────────────────────────────────

    @Operation(
        summary = "Create a timetable slot",
        description = "**Role required: ADMIN**\n\n" +
                      "Creates a new timetable entry. Validates time order and checks for " +
                      "scheduling conflicts (same class, same day, overlapping time)."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Timetable slot created",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = TimetableResponse.class),
                examples = @ExampleObject(value = """
                    {
                      "id": 1,
                      "classId": "CLASS-10A",
                      "subject": "Mathematics",
                      "teacherId": "3",
                      "teacherName": "Mr. John",
                      "dayOfWeek": "MONDAY",
                      "startTime": "09:00",
                      "endTime": "10:00"
                    }"""))),
        @ApiResponse(responseCode = "400", description = "Validation error or scheduling conflict"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = @ExampleObject(value = """
            {
              "classId":     "CLASS-10A",
              "subject":     "Mathematics",
              "teacherId":   "3",
              "teacherName": "Mr. John",
              "dayOfWeek":   "MONDAY",
              "startTime":   "09:00",
              "endTime":     "10:00"
            }"""))
    )
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TimetableResponse> create(
            @Valid @RequestBody TimetableRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(timetableService.create(request));
    }

    // ─── ADMIN: Update ───────────────────────────────────────────────────────────

    @Operation(
        summary = "Update a timetable slot",
        description = "**Role required: ADMIN**\n\nUpdates an existing timetable slot by ID."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Timetable slot updated"),
        @ApiResponse(responseCode = "400", description = "Validation error or conflict"),
        @ApiResponse(responseCode = "404", description = "Timetable slot not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = @ExampleObject(value = """
            {
              "classId":     "CLASS-10A",
              "subject":     "Mathematics",
              "teacherId":   "3",
              "teacherName": "Mr. John",
              "dayOfWeek":   "MONDAY",
              "startTime":   "09:00",
              "endTime":     "10:00"
            }"""))
    )
    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TimetableResponse> update(
            @Parameter(description = "Timetable slot ID", example = "1")
            @PathVariable Long id,
            @Valid @RequestBody TimetableRequest request) {
        return ResponseEntity.ok(timetableService.update(id, request));
    }

    // ─── ADMIN: Delete ───────────────────────────────────────────────────────────

    @Operation(
        summary = "Delete a timetable slot",
        description = "**Role required: ADMIN**\n\nPermanently removes a timetable slot by ID."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Timetable slot deleted"),
        @ApiResponse(responseCode = "404", description = "Timetable slot not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(
            @Parameter(description = "Timetable slot ID to delete", example = "1")
            @PathVariable Long id) {
        timetableService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Timetable slot deleted successfully"));
    }

    // ─── TEACHER: View own timetable (JWT-based) ─────────────────────────────────

    @Operation(
        summary = "View my timetable (Teacher)",
        description = "**Role required: TEACHER**\n\n" +
                      "Returns all timetable slots assigned to the logged-in teacher. " +
                      "**No ID needed** — teacher identity is extracted from the JWT token automatically."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Teacher's timetable returned",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    [
                      {
                        "id": 1,
                        "classId": "CLASS-10A",
                        "subject": "Mathematics",
                        "teacherId": "3",
                        "teacherName": "Mr. John",
                        "dayOfWeek": "MONDAY",
                        "startTime": "09:00",
                        "endTime": "10:00"
                      }
                    ]"""))),
        @ApiResponse(responseCode = "400", description = "No timetable found for this teacher"),
        @ApiResponse(responseCode = "403", description = "Access denied — TEACHER role required")
    })
    @GetMapping("/teacher")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<TimetableResponse>> getMyTeacherTimetable(
            @AuthenticationPrincipal UserDetails userDetails) {
        // teacherId is resolved from JWT email — no path variable needed
        return ResponseEntity.ok(
                timetableService.getByTeacherEmail(userDetails.getUsername()));
    }

    // ─── STUDENT: View class timetable ───────────────────────────────────────────

    @Operation(
        summary = "View class timetable (Student)",
        description = "**Role required: STUDENT or ADMIN**\n\n" +
                      "Returns the full weekly timetable for a class by classId."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Class timetable returned",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    [
                      {
                        "id": 1,
                        "classId": "CLASS-10A",
                        "subject": "Mathematics",
                        "teacherId": "3",
                        "teacherName": "Mr. John",
                        "dayOfWeek": "MONDAY",
                        "startTime": "09:00",
                        "endTime": "10:00"
                      }
                    ]"""))),
        @ApiResponse(responseCode = "400", description = "No timetable found for this class"),
        @ApiResponse(responseCode = "403", description = "Access denied — STUDENT role required")
    })
    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<List<TimetableResponse>> getByClass(
            @Parameter(description = "Class identifier e.g. CLASS-10A", example = "CLASS-10A")
            @PathVariable String classId) {
        return ResponseEntity.ok(timetableService.getByClass(classId));
    }

    // ─── PARENT: View child's timetable (JWT-based) ───────────────────────────────

    @Operation(
        summary = "View child's timetable (Parent)",
        description = "**Role required: PARENT**\n\n" +
                      "Returns the timetable for the logged-in parent's linked child. " +
                      "**No ID needed** — parent identity and child link are resolved from the JWT token. " +
                      "The parent's `studentId` field must be set during registration."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Child's timetable returned"),
        @ApiResponse(responseCode = "400", description = "Parent has no linked student or no timetable found",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    { "status": 400, "message": "No student linked to this parent account" }"""))),
        @ApiResponse(responseCode = "403", description = "Access denied — PARENT role required")
    })
    @GetMapping("/parent")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<List<TimetableResponse>> getMyChildTimetable(
            @AuthenticationPrincipal UserDetails userDetails) {
        // parent's linked studentId is resolved from JWT email — no path variable needed
        return ResponseEntity.ok(
                timetableService.getByParentEmail(userDetails.getUsername()));
    }
}
