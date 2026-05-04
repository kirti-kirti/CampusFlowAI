package com.campusflow.ai.notification.controller;

import com.campusflow.ai.notification.dto.NotificationRequest;
import com.campusflow.ai.notification.dto.NotificationResponse;
import com.campusflow.ai.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
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

/**
 * REST controller for the Notification module.
 *
 * Role matrix:
 * ┌──────────────────────────────────┬──────────────────────────────────┐
 * │ Endpoint                         │ Allowed Roles                    │
 * ├──────────────────────────────────┼──────────────────────────────────┤
 * │ POST /api/notifications/send     │ ADMIN only                       │
 * │ GET  /api/notifications/my       │ ADMIN, TEACHER, STUDENT, PARENT  │
 * └──────────────────────────────────┴──────────────────────────────────┘
 */
@Tag(name = "Notifications", description = "Push notification management with FCM integration")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    // ─── ADMIN: Send Notification ────────────────────────────────────────────────

    @Operation(
        summary = "Send a notification",
        description = "**Role required: ADMIN**\n\n" +
                      "Sends a push notification to the specified target audience and saves it to the database.\n\n" +
                      "**targetRole options:**\n" +
                      "- `ALL` → every user\n" +
                      "- `STUDENT` → only students\n" +
                      "- `TEACHER` → only teachers\n" +
                      "- `PARENT` → only parents\n\n" +
                      "**Optional:** Set `userId` to send a personal notification to one specific user.\n\n" +
                      "**FCM Push:** Requires a valid `firebase-service-account.json`. " +
                      "If Firebase is not configured, the notification is saved to DB only."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Notification sent and saved",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = NotificationResponse.class),
                examples = @ExampleObject(value = """
                    {
                      "id": 1,
                      "title": "Exam Schedule Released",
                      "message": "Final exams start from 15th January. Check the portal.",
                      "targetRole": "STUDENT",
                      "createdAt": "2024-01-10T09:00:00",
                      "userId": null
                    }"""))),
        @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    {
                      "status": 400,
                      "message": "Validation failed",
                      "details": {
                        "title": "title is required",
                        "targetRole": "targetRole is required (ALL, STUDENT, TEACHER, PARENT)"
                      }
                    }"""))),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = {
            @ExampleObject(name = "Broadcast to all students", value = """
                {
                  "title": "Exam Schedule Released",
                  "message": "Final exams start from 15th January. Check the portal for details.",
                  "targetRole": "STUDENT"
                }"""),
            @ExampleObject(name = "Broadcast to all teachers", value = """
                {
                  "title": "Staff Meeting",
                  "message": "Mandatory staff meeting on Friday at 3 PM in the conference hall.",
                  "targetRole": "TEACHER"
                }"""),
            @ExampleObject(name = "Broadcast to all parents", value = """
                {
                  "title": "Parent-Teacher Meeting",
                  "message": "PTM scheduled for 20th January from 10 AM to 1 PM.",
                  "targetRole": "PARENT"
                }"""),
            @ExampleObject(name = "Broadcast to everyone", value = """
                {
                  "title": "School Holiday",
                  "message": "School will remain closed on 26th January for Republic Day.",
                  "targetRole": "ALL"
                }"""),
            @ExampleObject(name = "Personal notification", value = """
                {
                  "title": "Fee Reminder",
                  "message": "Your fee payment is due. Please pay before 31st January.",
                  "targetRole": "STUDENT",
                  "userId": 7
                }""")
        })
    )
    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationResponse> send(
            @Valid @RequestBody NotificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.send(request));
    }

    // ─── All Users: View Own Notifications ───────────────────────────────────────

    @Operation(
        summary = "Get my notifications",
        description = "**Role required: Any authenticated user**\n\n" +
                      "Returns notifications relevant to the logged-in user based on their role.\n\n" +
                      "- **ADMIN** → sees all notifications\n" +
                      "- **STUDENT** → sees notifications targeted at STUDENT or ALL\n" +
                      "- **TEACHER** → sees notifications targeted at TEACHER or ALL\n" +
                      "- **PARENT** → sees notifications targeted at PARENT or ALL\n\n" +
                      "User identity is extracted from the JWT token — no need to pass any ID."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Notifications returned",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    [
                      {
                        "id": 1,
                        "title": "Exam Schedule Released",
                        "message": "Final exams start from 15th January.",
                        "targetRole": "STUDENT",
                        "createdAt": "2024-01-10T09:00:00",
                        "userId": null
                      },
                      {
                        "id": 3,
                        "title": "School Holiday",
                        "message": "School closed on 26th January.",
                        "targetRole": "ALL",
                        "createdAt": "2024-01-08T08:00:00",
                        "userId": null
                      }
                    ]"""))),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                notificationService.getMyNotifications(userDetails.getUsername()));
    }
}
