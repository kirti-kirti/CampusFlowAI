package com.campusflow.ai.controller;

import com.campusflow.ai.dto.*;
import com.campusflow.ai.model.User;
import com.campusflow.ai.service.AuthService;
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

@Tag(name = "Authentication", description = "Register, login, and view profile")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ─── Register ────────────────────────────────────────────────────────────────

    @Operation(
        summary = "Register a new user",
        description = "Creates a new account. Returns a JWT token immediately after registration. " +
                      "For PARENT role, `studentId` is required."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "User registered successfully",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = AuthResponse.class),
                examples = @ExampleObject(value = """
                    {
                      "token": "eyJhbGciOiJIUzI1NiJ9...",
                      "id": 1,
                      "name": "Alice Smith",
                      "email": "alice@school.com",
                      "role": "STUDENT"
                    }"""))),
        @ApiResponse(responseCode = "400", description = "Validation error or email already in use",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    {
                      "timestamp": "2024-01-15T10:00:00",
                      "status": 400,
                      "error": "Bad Request",
                      "message": "Email is already registered"
                    }""")))
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = {
            @ExampleObject(name = "Student", value = """
                {
                  "name": "Alice Smith",
                  "email": "alice@school.com",
                  "password": "secret123",
                  "role": "STUDENT"
                }"""),
            @ExampleObject(name = "Teacher", value = """
                {
                  "name": "Mr. John",
                  "email": "john@school.com",
                  "password": "secret123",
                  "role": "TEACHER"
                }"""),
            @ExampleObject(name = "Parent", value = """
                {
                  "name": "Bob Smith",
                  "email": "bob@school.com",
                  "password": "secret123",
                  "role": "PARENT",
                  "studentId": "1"
                }"""),
            @ExampleObject(name = "Admin", value = """
                {
                  "name": "Admin User",
                  "email": "admin@school.com",
                  "password": "admin123",
                  "role": "ADMIN"
                }""")
        })
    )
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    // ─── Login ───────────────────────────────────────────────────────────────────

    @Operation(
        summary = "Login and get JWT token",
        description = "Authenticates the user and returns a signed JWT token. " +
                      "Use this token in the `Authorization: Bearer <token>` header for all secured endpoints."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login successful",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = AuthResponse.class),
                examples = @ExampleObject(value = """
                    {
                      "token": "eyJhbGciOiJIUzI1NiJ9...",
                      "id": 1,
                      "name": "Alice Smith",
                      "email": "alice@school.com",
                      "role": "STUDENT"
                    }"""))),
        @ApiResponse(responseCode = "401", description = "Invalid email or password",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    {
                      "timestamp": "2024-01-15T10:00:00",
                      "status": 401,
                      "error": "Unauthorized",
                      "message": "Invalid email or password"
                    }""")))
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = @ExampleObject(value = """
            {
              "email": "alice@school.com",
              "password": "secret123"
            }"""))
    )
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // ─── Profile ─────────────────────────────────────────────────────────────────

    @Operation(
        summary = "Get current user profile",
        description = "Returns the profile of the authenticated user. Identity is read from the JWT token.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile returned",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = User.class),
                examples = @ExampleObject(value = """
                    {
                      "id": 1,
                      "name": "Alice Smith",
                      "email": "alice@school.com",
                      "role": "STUDENT",
                      "studentId": null
                    }"""))),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> profile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getProfile(userDetails.getUsername()));
    }

    // ─── Update Profile ───────────────────────────────────────────────────────────────────────

    @Operation(
        summary = "Update profile",
        description = "Updates the authenticated user's name and/or password. " +
                      "Identity is taken from the JWT token — email and role cannot be changed. " +
                      "Both fields are optional — send only what you want to update.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile updated successfully",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    {
                      "id":      1,
                      "name":    "Alice Johnson",
                      "email":   "alice@school.com",
                      "role":    "STUDENT",
                      "message": "Profile updated successfully"
                    }"""))),
        @ApiResponse(responseCode = "400", description = "No fields provided or validation error",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    {
                      "status":  400,
                      "message": "Provide at least one field to update: name or password"
                    }"""))),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = {
            @ExampleObject(name = "Update both",          value = "{ \"name\": \"Alice Johnson\", \"password\": \"newpass123\" }"),
            @ExampleObject(name = "Update name only",     value = "{ \"name\": \"Alice Johnson\" }"),
            @ExampleObject(name = "Update password only", value = "{ \"password\": \"newpass123\" }")
        })
    )
    @PutMapping("/update-profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UpdateProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                authService.updateProfile(userDetails.getUsername(), request));
    }

    // ─── Password Recovery ────────────────────────────────────────────────────────
    
    // ─── FCM Token Registration ────────────────────────────────────────────────

    @Operation(
        summary = "Register FCM device token",
        description = "Saves the Firebase Cloud Messaging token for the authenticated user to enable push notifications.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/fcm-token")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> registerFcmToken(
            @RequestBody FcmTokenRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        authService.saveFcmToken(userDetails.getUsername(), request.getToken());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Request password reset token", description = "Generates a recovery token and sends it to the user's email.")
    @PostMapping("/forgot-password")
    public ResponseEntity<com.campusflow.ai.dto.ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(new com.campusflow.ai.dto.ApiResponse(authService.forgotPassword(request.getEmail())));
    }

    @Operation(summary = "Reset password using token", description = "Updates the password if the token is valid and not expired.")
    @PostMapping("/reset-password")
    public ResponseEntity<com.campusflow.ai.dto.ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(new com.campusflow.ai.dto.ApiResponse(authService.resetPassword(request)));
    }
}
