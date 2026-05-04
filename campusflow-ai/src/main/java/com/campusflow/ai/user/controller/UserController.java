package com.campusflow.ai.user.controller;

import com.campusflow.ai.dto.FcmTokenRequest;
import com.campusflow.ai.dto.UpdateProfileRequest;
import com.campusflow.ai.dto.UpdateProfileResponse;
import com.campusflow.ai.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
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

import java.util.Map;

/**
 * User self-service APIs — accessible by all authenticated roles.
 *
 * Endpoints:
 *  POST /api/user/save-token      → Register / update FCM device token
 *  PUT  /api/user/update-profile  → Update name and/or password
 */
@Tag(name = "User", description = "User profile and FCM token management")
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    // ─── Save FCM Token ──────────────────────────────────────────────────────────

    @Operation(
        summary = "Save FCM device token",
        description = "**Role required: Any authenticated user**\n\n" +
                      "Registers or updates the Firebase Cloud Messaging (FCM) token " +
                      "for the authenticated user's device.\n\n" +
                      "**When to call this API:**\n" +
                      "- After first login on a mobile device\n" +
                      "- After app reinstall (token changes)\n" +
                      "- When Firebase calls `onTokenRefresh()`\n\n" +
                      "The user is identified from the JWT token — no need to pass userId in the body."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "FCM token saved successfully",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    {
                      "message": "FCM token saved successfully",
                      "userId":  "1",
                      "email":   "alice@school.com"
                    }"""))),
        @ApiResponse(responseCode = "400", description = "fcmToken is empty or missing"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = @ExampleObject(value = """
            { "fcmToken": "dGhpcyBpcyBhIHNhbXBsZSBGQ00gdG9rZW4..." }"""))
    )
    @PostMapping("/save-token")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> saveFcmToken(
            @Valid @RequestBody FcmTokenRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                userService.saveFcmToken(userDetails.getUsername(), request));
    }

    // ─── Update Profile ──────────────────────────────────────────────────────────

    @Operation(
        summary = "Update user profile",
        description = "**Role required: Any authenticated user**\n\n" +
                      "Updates the authenticated user's name and/or password. " +
                      "Both fields are optional — send only what you want to change. " +
                      "Email and role cannot be changed."
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
        @ApiResponse(responseCode = "400", description = "No fields provided or validation error"),
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
                userService.updateProfile(userDetails.getUsername(), request));
    }
}
