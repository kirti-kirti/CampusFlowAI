package com.campusflow.ai.chat.service;

import com.campusflow.ai.chat.dto.ChatRequest;
import com.campusflow.ai.chat.dto.ChatResponse;
import com.campusflow.ai.chat.model.ChatHistory;
import com.campusflow.ai.chat.repository.ChatHistoryRepository;
import com.campusflow.ai.model.User;
import com.campusflow.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * CampusFlow AI Chatbot — rule-based NLP engine.
 *
 * How it works:
 *  1. Normalize the query (lowercase, trim)
 *  2. Match against a priority-ordered keyword map
 *  3. First match wins → return the mapped response
 *  4. No match → return a helpful fallback with suggestions
 *  5. Persist the conversation to chat_history table
 *
 * To upgrade to a real AI (e.g. OpenAI GPT):
 *  - Replace resolveResponse() with an HTTP call to the AI API
 *  - Keep the rest of the service unchanged
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatHistoryRepository chatHistoryRepository;
    private final UserRepository userRepository;

    /**
     * Keyword → Response map.
     * LinkedHashMap preserves insertion order — more specific keywords first.
     * Matching is case-insensitive and checks if the query CONTAINS the keyword.
     */
    private static final Map<String, String> KNOWLEDGE_BASE = new LinkedHashMap<>() {{

        // ── Attendance ──────────────────────────────────────────────────────────
        put("mark attendance",
                "To mark attendance, scan the QR code shown by your teacher. " +
                "Use POST /api/attendance/mark with the QR token.");
        put("attendance report",
                "View your attendance report at GET /api/attendance/student/{id}. " +
                "Parents can check via GET /api/attendance/parent/{studentId}.");
        put("attendance",
                "The Attendance module lets students mark attendance via QR code. " +
                "Teachers generate QR codes, and parents can view their child's attendance.");

        // ── Timetable ───────────────────────────────────────────────────────────
        put("class schedule",
                "Your class schedule is available at GET /api/timetable/class/{classId}.");
        put("teacher schedule",
                "Teachers can view their schedule at GET /api/timetable/teacher/{teacherId}.");
        put("timetable",
                "The Timetable module shows your weekly class schedule. " +
                "Students: GET /api/timetable/class/{classId} | " +
                "Teachers: GET /api/timetable/teacher/{teacherId} | " +
                "Parents: GET /api/timetable/parent/{studentId}.");

        // ── Transport ───────────────────────────────────────────────────────────
        put("bus location",
                "Track your bus in real-time at GET /api/transport/location/{busId}. " +
                "Parents can track their child's bus at GET /api/transport/parent/{studentId}.");
        put("bus route",
                "Bus route details are available in the Transport module. " +
                "Contact your admin for route assignments.");
        put("transport",
                "The Transport module provides real-time GPS tracking of school buses. " +
                "Students and parents can track buses, and drivers update locations.");
        put("bus",
                "You can track your school bus location at GET /api/transport/location/{busId}.");

        // ── Notifications ───────────────────────────────────────────────────────
        put("notification",
                "View your notifications at GET /api/notifications/my. " +
                "Admins can send notifications to specific roles via POST /api/notifications/send.");
        put("announcement",
                "School announcements are sent as notifications. " +
                "Check GET /api/notifications/my to see all your notifications.");

        // ── Authentication ──────────────────────────────────────────────────────
        put("forgot password",
                "To reset your password, contact your school administrator. " +
                "Password reset via email will be available in a future update.");
        put("change password",
                "Password change functionality is available in your profile settings. " +
                "Contact admin if you need assistance.");
        put("login",
                "Login using POST /api/auth/login with your email and password. " +
                "You will receive a JWT token to use for all other requests.");
        put("register",
                "New accounts are created by the admin. " +
                "Contact your school administrator to get registered.");
        put("profile",
                "View your profile at GET /api/auth/profile using your JWT token.");
        put("token",
                "Your JWT token is valid for 24 hours. " +
                "Login again via POST /api/auth/login to get a new token.");

        // ── Roles ───────────────────────────────────────────────────────────────
        put("admin",
                "Admins have full access: manage users, buses, timetables, " +
                "send notifications, and view all records.");
        put("teacher",
                "Teachers can generate QR codes for attendance, " +
                "view their timetable, and update bus location.");
        put("student",
                "Students can mark attendance via QR, view their timetable, " +
                "track their bus, and receive notifications.");
        put("parent",
                "Parents can view their child's attendance, timetable, " +
                "track their child's bus, and receive notifications.");

        // ── General ─────────────────────────────────────────────────────────────
        put("help",
                "I can help you with:\n" +
                "📋 Attendance — mark, view, reports\n" +
                "📅 Timetable — class and teacher schedules\n" +
                "🚌 Transport — bus tracking and routes\n" +
                "🔔 Notifications — announcements\n" +
                "🔐 Login / Profile — account management\n\n" +
                "Just ask me anything about these topics!");
        put("hello",       "Hello! 👋 Welcome to CampusFlow AI. How can I help you today?");
        put("hi",          "Hi there! 👋 I'm the CampusFlow AI assistant. Ask me anything!");
        put("hey",         "Hey! 👋 How can I assist you today?");
        put("good morning","Good morning! 🌅 How can I help you today?");
        put("good evening","Good evening! 🌆 How can I assist you?");
        put("thank",       "You're welcome! 😊 Feel free to ask if you need anything else.");
        put("bye",         "Goodbye! 👋 Have a great day!");
        put("what can you do",
                "I'm the CampusFlow AI assistant! I can help you with attendance, " +
                "timetables, transport tracking, notifications, and account management. " +
                "Type 'help' to see all topics.");
        put("feature",
                "CampusFlow AI includes: Authentication, QR Attendance, " +
                "Timetable Management, Transport Tracking, and Push Notifications.");
        put("contact",
                "For technical support, contact your school administrator " +
                "or email support@campusflow.ai.");
        put("exam",
                "Exam schedules are announced via notifications. " +
                "Check GET /api/notifications/my for the latest updates.");
        put("holiday",
                "Holiday announcements are sent as notifications. " +
                "Check GET /api/notifications/my for school holiday updates.");
        put("fee",
                "Fee management will be available in a future update. " +
                "Contact your school administrator for fee-related queries.");
        put("result",
                "Results and marks management will be available in a future update. " +
                "Contact your teacher or administrator for current results.");
    }};

    // ─── Main Chat Method ────────────────────────────────────────────────────────

    /**
     * Processes a user query and returns a chatbot response.
     * Saves the conversation to chat_history for future reference.
     *
     * @param request   contains the user's query
     * @param userEmail email extracted from JWT
     */
    @Transactional
    public ChatResponse ask(ChatRequest request, String userEmail) {
        String query = request.getQuery().trim();
        String answer = resolveResponse(query);
        LocalDateTime now = LocalDateTime.now();

        // Persist conversation history
        saveHistory(query, answer, userEmail, now);

        log.info("Chat: user={}, query='{}', matched={}",
                userEmail, query.length() > 50 ? query.substring(0, 50) + "..." : query,
                !answer.startsWith("I'm not sure"));

        return ChatResponse.builder()
                .query(query)
                .response(answer)
                .timestamp(now)
                .build();
    }

    /**
     * Returns chat history for the authenticated user.
     * Useful for displaying conversation history in the UI.
     */
    @Transactional(readOnly = true)
    public List<ChatHistory> getHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return chatHistoryRepository.findByUserIdOrderByTimestampDesc(user.getId());
    }

    // ─── Rule-Based Engine ───────────────────────────────────────────────────────

    /**
     * Matches the query against the knowledge base.
     *
     * Strategy:
     *  1. Normalize: lowercase + trim
     *  2. Iterate the LinkedHashMap in insertion order (specific → general)
     *  3. Return the first keyword that is contained in the query
     *  4. If no match → return a helpful fallback message
     */
    private String resolveResponse(String query) {
        String normalized = query.toLowerCase().trim();

        for (Map.Entry<String, String> entry : KNOWLEDGE_BASE.entrySet()) {
            if (normalized.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        // Intelligent fallback — suggests related topics
        return buildFallback(normalized);
    }

    /**
     * Builds a context-aware fallback when no keyword matches.
     * Tries to detect partial intent and suggest the right module.
     */
    private String buildFallback(String query) {
        // Partial intent detection
        if (query.contains("qr") || query.contains("scan") || query.contains("present")) {
            return "It looks like you're asking about attendance. " +
                   "Students can mark attendance by scanning the QR code shown by their teacher. " +
                   "Type 'attendance' for more details.";
        }
        if (query.contains("time") || query.contains("class") || query.contains("period")) {
            return "It looks like you're asking about your schedule. " +
                   "Type 'timetable' to learn how to view your class schedule.";
        }
        if (query.contains("track") || query.contains("location") || query.contains("where")) {
            return "It looks like you're asking about location tracking. " +
                   "Type 'transport' to learn how to track your school bus.";
        }
        if (query.contains("message") || query.contains("alert") || query.contains("update")) {
            return "It looks like you're asking about messages or updates. " +
                   "Type 'notification' to learn about the notification system.";
        }

        // Generic fallback
        return "I'm not sure about that. 🤔 Here's what I can help you with:\n\n" +
               "• Type 'attendance' — for attendance queries\n" +
               "• Type 'timetable' — for schedule queries\n" +
               "• Type 'transport' — for bus tracking\n" +
               "• Type 'notification' — for announcements\n" +
               "• Type 'help' — for a full list of topics\n\n" +
               "Or contact your administrator for further assistance.";
    }

    /** Persists the conversation turn to the database */
    private void saveHistory(String query, String response,
                             String userEmail, LocalDateTime timestamp) {
        userRepository.findByEmail(userEmail).ifPresent(user ->
                chatHistoryRepository.save(ChatHistory.builder()
                        .userId(user.getId())
                        .userEmail(userEmail)
                        .query(query)
                        .response(response)
                        .timestamp(timestamp)
                        .build())
        );
    }
}
