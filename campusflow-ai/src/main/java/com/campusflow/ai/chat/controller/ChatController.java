package com.campusflow.ai.chat.controller;

import com.campusflow.ai.chat.dto.ChatRequest;
import com.campusflow.ai.chat.dto.ChatResponse;
import com.campusflow.ai.chat.model.ChatHistory;
import com.campusflow.ai.chat.service.ChatService;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for the CampusFlow AI Chatbot.
 *
 * Accessible by ALL authenticated roles — no role restriction.
 *
 * Endpoints:
 *  POST /api/chat/ask      → Ask a question, get an instant response
 *  GET  /api/chat/history  → View your conversation history
 */
@Tag(name = "AI Chatbot", description = "CampusFlow AI assistant — ask anything about the platform")
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ChatController {

    private final ChatService chatService;

    // ─── Ask a Question ──────────────────────────────────────────────────────────

    @Operation(
        summary = "Ask the AI chatbot",
        description = "**Role required: Any authenticated user**\n\n" +
                      "Send a natural language query and receive an instant response. " +
                      "The chatbot understands questions about:\n\n" +
                      "- 📋 **Attendance** — marking, viewing, reports\n" +
                      "- 📅 **Timetable** — class and teacher schedules\n" +
                      "- 🚌 **Transport** — bus tracking and routes\n" +
                      "- 🔔 **Notifications** — announcements\n" +
                      "- 🔐 **Login / Profile** — account management\n\n" +
                      "Every conversation is saved to history automatically."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Chatbot response returned",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = ChatResponse.class),
                examples = {
                    @ExampleObject(name = "Attendance query", value = """
                        {
                          "query":     "How do I mark my attendance?",
                          "response":  "To mark attendance, scan the QR code shown by your teacher. Use POST /api/attendance/mark with the QR token.",
                          "timestamp": "2024-01-15T10:05:00"
                        }"""),
                    @ExampleObject(name = "Timetable query", value = """
                        {
                          "query":     "Show me my timetable",
                          "response":  "The Timetable module shows your weekly class schedule. Students: GET /api/timetable/class/{classId} | Teachers: GET /api/timetable/teacher/{teacherId} | Parents: GET /api/timetable/parent/{studentId}.",
                          "timestamp": "2024-01-15T10:06:00"
                        }"""),
                    @ExampleObject(name = "Transport query", value = """
                        {
                          "query":     "Where is my bus?",
                          "response":  "It looks like you're asking about location tracking. Type 'transport' to learn how to track your school bus.",
                          "timestamp": "2024-01-15T10:07:00"
                        }"""),
                    @ExampleObject(name = "Help query", value = """
                        {
                          "query":     "help",
                          "response":  "I can help you with:\\n📋 Attendance — mark, view, reports\\n📅 Timetable — class and teacher schedules\\n🚌 Transport — bus tracking and routes\\n🔔 Notifications — announcements\\n🔐 Login / Profile — account management\\n\\nJust ask me anything about these topics!",
                          "timestamp": "2024-01-15T10:08:00"
                        }""")
                })),
        @ApiResponse(responseCode = "400", description = "Empty or too-long query",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    {
                      "status": 400,
                      "message": "Validation failed",
                      "details": { "query": "Query cannot be empty" }
                    }"""))),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = {
            @ExampleObject(name = "Attendance",    value = """
                { "query": "How do I mark my attendance?" }"""),
            @ExampleObject(name = "Timetable",     value = """
                { "query": "Show me my timetable" }"""),
            @ExampleObject(name = "Bus tracking",  value = """
                { "query": "Where is my bus?" }"""),
            @ExampleObject(name = "Notification",  value = """
                { "query": "Are there any new notifications?" }"""),
            @ExampleObject(name = "Greeting",      value = """
                { "query": "Hello" }"""),
            @ExampleObject(name = "Help",          value = """
                { "query": "help" }"""),
            @ExampleObject(name = "Login help",    value = """
                { "query": "I forgot my password" }"""),
            @ExampleObject(name = "Exam",          value = """
                { "query": "When are the exams?" }""")
        })
    )
    @PostMapping("/ask")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ChatResponse> ask(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                chatService.ask(request, userDetails.getUsername()));
    }

    // ─── Chat History ────────────────────────────────────────────────────────────

    @Operation(
        summary = "Get my chat history",
        description = "**Role required: Any authenticated user**\n\n" +
                      "Returns all previous conversations for the logged-in user, " +
                      "ordered by newest first. Identity is extracted from the JWT token."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Chat history returned",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    [
                      {
                        "id":        2,
                        "userId":    1,
                        "userEmail": "alice@school.com",
                        "query":     "Where is my bus?",
                        "response":  "Track your bus in real-time at GET /api/transport/location/{busId}.",
                        "timestamp": "2024-01-15T10:07:00"
                      },
                      {
                        "id":        1,
                        "userId":    1,
                        "userEmail": "alice@school.com",
                        "query":     "How do I mark my attendance?",
                        "response":  "To mark attendance, scan the QR code shown by your teacher.",
                        "timestamp": "2024-01-15T10:05:00"
                      }
                    ]"""))),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ChatHistory>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                chatService.getHistory(userDetails.getUsername()));
    }
}
