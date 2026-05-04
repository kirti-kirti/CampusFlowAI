package com.campusflow.ai.hierarchy.controller;

import com.campusflow.ai.hierarchy.dto.*;
import com.campusflow.ai.hierarchy.service.HierarchyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Manages the University → Department → Class → Subject hierarchy.
 *
 * ┌──────────────────────────────────────────┬──────────────────────────────┐
 * │ Endpoint                                 │ Role                         │
 * ├──────────────────────────────────────────┼──────────────────────────────┤
 * │ POST   /api/hierarchy/university         │ Public (seed/setup)          │
 * │ GET    /api/hierarchy/universities       │ Public                       │
 * │ POST   /api/hierarchy/department         │ ADMIN                        │
 * │ GET    /api/hierarchy/departments        │ ADMIN                        │
 * │ POST   /api/hierarchy/class              │ ADMIN                        │
 * │ GET    /api/hierarchy/classes/{deptId}   │ ADMIN, TEACHER               │
 * │ POST   /api/hierarchy/subject            │ ADMIN                        │
 * │ GET    /api/hierarchy/subjects/{classId} │ ADMIN, TEACHER, STUDENT      │
 * │ GET    /api/hierarchy/my-subjects        │ TEACHER                      │
 * └──────────────────────────────────────────┴──────────────────────────────┘
 */
@Tag(name = "Hierarchy", description = "University → Department → Class → Subject structure management")
@RestController
@RequestMapping("/api/hierarchy")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class HierarchyController {

    private final HierarchyService hierarchyService;

    // ─── University ───────────────────────────────────────────────────────────────

    @Operation(
        summary = "Create a university",
        description = "Creates a new university. The `code` becomes the `tenantId` for all users of this university."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = @ExampleObject(value = """
            {
              "name":         "Indian Institute of Technology",
              "code":         "IIT-BOM",
              "address":      "Powai, Mumbai",
              "contactEmail": "admin@iitb.ac.in"
            }"""))
    )
    @PostMapping("/university")
    public ResponseEntity<UniversityDto.Response> createUniversity(
            @Valid @RequestBody UniversityDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(hierarchyService.createUniversity(request));
    }

    @Operation(summary = "Get all universities")
    @GetMapping("/universities")
    public ResponseEntity<List<UniversityDto.Response>> getAllUniversities() {
        return ResponseEntity.ok(hierarchyService.getAllUniversities());
    }

    // ─── Department ───────────────────────────────────────────────────────────────

    @Operation(
        summary = "Create a department",
        description = "**Role: ADMIN**\n\n" +
                      "Creates a department under the admin's university. " +
                      "`universityId` is resolved from JWT — not from request body."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = @ExampleObject(value = """
            { "name": "Computer Science Engineering", "description": "CSE Department" }"""))
    )
    @PostMapping("/department")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentDto.Response> createDepartment(
            @Valid @RequestBody DepartmentDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(hierarchyService.createDepartment(request));
    }

    @Operation(summary = "Get all departments in my university", description = "**Role: ADMIN**")
    @GetMapping("/departments")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<DepartmentDto.Response>> getMyDepartments() {
        return ResponseEntity.ok(hierarchyService.getMyDepartments());
    }

    // ─── ClassRoom ────────────────────────────────────────────────────────────────

    @Operation(
        summary = "Create a class",
        description = "**Role: ADMIN**\n\n" +
                      "Creates a class under a department. " +
                      "Validates that `departmentId` belongs to the admin's university."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = @ExampleObject(value = """
            { "name": "CSE-3A", "departmentId": 1, "semester": "Semester 5" }"""))
    )
    @PostMapping("/class")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassRoomDto.Response> createClassRoom(
            @Valid @RequestBody ClassRoomDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(hierarchyService.createClassRoom(request));
    }

    @Operation(summary = "Get classes by department", description = "**Role: ADMIN or TEACHER**")
    @GetMapping("/classes/{departmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<ClassRoomDto.Response>> getClassesByDepartment(
            @Parameter(description = "Department ID", example = "1")
            @PathVariable Long departmentId) {
        return ResponseEntity.ok(hierarchyService.getClassesByDepartment(departmentId));
    }

    // ─── Subject ──────────────────────────────────────────────────────────────────

    @Operation(
        summary = "Assign a subject to a class",
        description = "**Role: ADMIN**\n\n" +
                      "Assigns a subject to a class with a teacher.\n\n" +
                      "**Validation:**\n" +
                      "- ClassRoom must belong to the admin's university\n" +
                      "- Teacher must belong to the same department as the class\n" +
                      "- Teacher must have TEACHER role"
    )
    @ApiResponse(responseCode = "400", description = "Teacher not in same department as class")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = @ExampleObject(value = """
            { "name": "Database Management Systems", "classRoomId": 1, "teacherId": 3 }"""))
    )
    @PostMapping("/subject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SubjectDto.Response> createSubject(
            @Valid @RequestBody SubjectDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(hierarchyService.createSubject(request));
    }

    @Operation(summary = "Get subjects for a class", description = "**Role: ADMIN, TEACHER, STUDENT**")
    @GetMapping("/subjects/{classRoomId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SubjectDto.Response>> getSubjectsByClass(
            @Parameter(description = "ClassRoom ID", example = "1")
            @PathVariable Long classRoomId) {
        return ResponseEntity.ok(hierarchyService.getSubjectsByClass(classRoomId));
    }

    @Operation(
        summary = "Get my subjects (Teacher)",
        description = "**Role: TEACHER**\n\nReturns all subjects assigned to the logged-in teacher."
    )
    @GetMapping("/my-subjects")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<SubjectDto.Response>> getMySubjects(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(hierarchyService.getMySubjects(userDetails.getUsername()));
    }
}
