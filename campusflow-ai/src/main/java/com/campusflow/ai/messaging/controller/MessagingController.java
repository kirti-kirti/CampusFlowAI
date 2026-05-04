package com.campusflow.ai.messaging.controller;

import com.campusflow.ai.messaging.dto.MessageResponse;
import com.campusflow.ai.messaging.dto.SendMessageRequest;
import com.campusflow.ai.messaging.service.MessagingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
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
 * REST controller for the Messaging module.
 *
 * Role matrix:
 * ┌──────────────────────────────────┬──────────────────────────────────────┐
 * │ Endpoint                         │ Who can use it                       │
 * ├──────────────────────────────────┼──────────────────────────────────────┤
 * │ POST /api/messages/send          │ TEACHER, ADMIN (to anyone)           │
 * │                                  │ STUDENT, PARENT (to TEACHER/ADMIN)   │
 * │ GET  /api/messages/chat/{userId} │ All authenticated users              │
 * └──────────────────────────────────┴──────────────────────────────────────┘
 */
@Tag(name = "Messaging", description = "Direct messaging between teachers, students, and parents")
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class MessagingController {

    private final MessagingService messagingService;

    // ─── Send Message ────────────────────────────────────────────────────────────

    @Operation(
        summary = "Send a message",
        description = "**Role required: Any authenticated user**\n\n" +
                      "Sends a direct message to another user.\n\n" +
                      "**Role rules:**\n" +
                      "- TEACHER / ADMIN → can message anyone\n" +
                      "- STUDENT / PARENT → can only message TEACHER or ADMIN\n\n" +
                      "The sender's identity is taken from the JWT token — no need to pass senderId."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Message sent successfully",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    {
                      "id":           1,
                      "senderId":     3,
                      "senderName":   "Mr. John",
                      "receiverId":   7,
                      "receiverName": "Alice Smith",
                      "message":      "Please submit your assignment by Friday.",
                      "timestamp":    "2024-01-15T10:00:00",
                      "isRead":       false
                    }"""))),
        @ApiResponse(responseCode = "400", description = "Validation error or role restriction",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = {
                    @ExampleObject(name = "Role restriction", value = """
                        { "status": 400, "message": "Students and Parents can only message Teachers or Admins" }"""),
                    @ExampleObject(name = "Self message", value = """
                        { "status": 400, "message": "You cannot send a message to yourself" }"""),
                    @ExampleObject(name = "Receiver not found", value = """
                        { "status": 400, "message": "Receiver not found with ID: 99" }""")
                })),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = {
            @ExampleObject(name = "Teacher → Student", value = """
                {
                  "receiverId": 7,
                  "message":    "Please submit your assignment by Friday."
                }"""),
            @ExampleObject(name = "Parent → Teacher", value = """
                {
                  "receiverId": 3,
                  "message":    "Can we schedule a meeting to discuss my child's progress?"
                }""")
        })
    )
    @PostMapping("/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> send(
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messagingService.send(userDetails.getUsername(), request));
    }

    // ─── Get Conversation ────────────────────────────────────────────────────────

    @Operation(
        summary = "Get conversation with a user",
        description = "**Role required: Any authenticated user**\n\n" +
                      "Returns the full message history between the authenticated user " +
                      "and the specified user, ordered oldest to newest (chat style).\n\n" +
                      "Also automatically marks all unread messages from the other user as read."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Conversation returned",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    [
                      {
                        "id":           1,
                        "senderId":     3,
                        "senderName":   "Mr. John",
                        "receiverId":   7,
                        "receiverName": "Alice Smith",
                        "message":      "Please submit your assignment by Friday.",
                        "timestamp":    "2024-01-15T10:00:00",
                        "isRead":       true
                      },
                      {
                        "id":           2,
                        "senderId":     7,
                        "senderName":   "Alice Smith",
                        "receiverId":   3,
                        "receiverName": "Mr. John",
                        "message":      "Sure, I will submit it by Thursday.",
                        "timestamp":    "2024-01-15T10:05:00",
                        "isRead":       true
                      }
                    ]"""))),
        @ApiResponse(responseCode = "400", description = "User not found"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/chat/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MessageResponse>> getConversation(
            @Parameter(description = "The other user's ID", example = "3")
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                messagingService.getConversation(userDetails.getUsername(), userId));
    }
}
