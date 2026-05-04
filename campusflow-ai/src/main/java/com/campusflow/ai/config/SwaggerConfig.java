package com.campusflow.ai.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI 3 / Swagger UI configuration for CampusFlow AI.
 *
 * Swagger UI  → http://localhost:8080/swagger-ui/index.html
 * API JSON    → http://localhost:8080/v3/api-docs
 */
@Configuration
public class SwaggerConfig {

    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI campusFlowOpenAPI() {
        return new OpenAPI()

                // ── API Info ──────────────────────────────────────────────────
                .info(new Info()
                        .title("CampusFlow AI — Backend API")
                        .description("""
                                ## CampusFlow AI — Smart Campus Management Platform
                                
                                A complete multi-tenant backend for managing university operations
                                with strict hierarchical data modeling and role-based access control.
                                
                                ---
                                
                                ### 🏛️ Hierarchy
                                ```
                                University → Department → Class → Subject
                                                              ↓
                                                          Teacher / Student / Parent
                                ```
                                
                                ---
                                
                                ### 🔐 How to Authenticate
                                1. **Register** via `POST /api/auth/register` with your `tenantId` (university code)
                                2. **Login** via `POST /api/auth/login` → copy the `token` value
                                3. Click **Authorize 🔒** at the top of this page
                                4. Paste the token *(without "Bearer ")* → click **Authorize**
                                5. All secured endpoints will now work automatically
                                
                                ---
                                
                                ### 👥 Roles & Permissions
                                | Role    | Permissions |
                                |---------|-------------|
                                | ADMIN   | Full access — manage hierarchy, users, all data |
                                | TEACHER | Create sessions, generate QR, view timetable, update bus |
                                | STUDENT | Mark attendance, view timetable, track bus, chat |
                                | PARENT  | View child's attendance, timetable, bus location |
                                
                                ---
                                
                                ### 📦 Modules (9 total)
                                | # | Module | Base Path | Description |
                                |---|--------|-----------|-------------|
                                | 1 | 🏛️ Hierarchy | `/api/hierarchy` | University → Dept → Class → Subject |
                                | 2 | 🔐 Authentication | `/api/auth` | Register, login, profile |
                                | 3 | 👤 User | `/api/user` | Profile update, FCM token |
                                | 4 | 📋 Attendance | `/api/attendance` | QR-based with PRESENT/LATE/ABSENT |
                                | 5 | 📅 Timetable | `/api/timetable` | Class schedules |
                                | 6 | 🔔 Notifications | `/api/notifications` | FCM push notifications |
                                | 7 | 🚌 Transport | `/api/transport` | Real-time bus GPS tracking |
                                | 8 | 🤖 AI Chatbot | `/api/chat` | Rule-based AI assistant |
                                | 9 | 💬 Messaging | `/api/messages` | Direct messaging |
                                
                                ---
                                
                                ### 🏢 Multi-Tenant Architecture
                                - Every user belongs to a **University** (identified by `tenantId`)
                                - `tenantId` is embedded in the JWT token at login
                                - All data is automatically scoped to the user's university
                                - Cross-university data access is **blocked at service layer**
                                
                                ---
                                
                                ### ⚠️ Important Notes
                                - JWT tokens are valid for **24 hours**
                                - `tenantId` = University code (e.g. `IIT-BOM`, `COLLEGE-001`)
                                - PARENT role requires `studentId` set during registration
                                - STUDENT role requires `departmentId` + `classRoomId`
                                - TEACHER role requires `departmentId`
                                - Firebase push requires real `firebase-service-account.json`
                                """)
                        .version("3.0.0")
                        .contact(new Contact()
                                .name("CampusFlow AI Team")
                                .email("support@campusflow.ai")
                                .url("https://campusflow.ai"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))

                // ── Servers ───────────────────────────────────────────────────
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("🖥️ Local Development"),
                        new Server()
                                .url("https://api.campusflow.ai")
                                .description("🌐 Production")))

                // ── Tag ordering ──────────────────────────────────────────────
                .tags(List.of(
                        new Tag()
                                .name("Hierarchy")
                                .description("🏛️ University → Department → Class → Subject — setup your institution structure first"),
                        new Tag()
                                .name("Authentication")
                                .description("🔐 Register (with hierarchy IDs), login, view/update profile"),
                        new Tag()
                                .name("User")
                                .description("👤 Update name/password, register FCM device token for push notifications"),
                        new Tag()
                                .name("Attendance")
                                .description("📋 Multi-tenant session-based QR attendance — PRESENT/LATE/ABSENT with analytics reports"),
                        new Tag()
                                .name("Timetable")
                                .description("📅 Class schedule management — CRUD for admin, JWT-based view for all roles"),
                        new Tag()
                                .name("Notifications")
                                .description("🔔 Firebase FCM push notifications — broadcast to roles or send to individuals"),
                        new Tag()
                                .name("Transport")
                                .description("🚌 Real-time bus GPS tracking — manage buses, update location, parent tracking"),
                        new Tag()
                                .name("AI Chatbot")
                                .description("🤖 Rule-based AI assistant — answers queries about all platform modules"),
                        new Tag()
                                .name("Messaging")
                                .description("💬 Direct messaging — teacher ↔ student/parent with read receipts")))

                // ── Global JWT Bearer Auth ────────────────────────────────────
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .name(BEARER_AUTH)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("""
                                        **Steps to get a token:**
                                        1. `POST /api/auth/login` with email + password
                                        2. Copy the `token` from the response
                                        3. Paste it here (without the 'Bearer ' prefix)
                                        
                                        Token expires after **24 hours**.
                                        The token contains: `email`, `role`, `tenantId` (university code).
                                        """)));
    }
}
