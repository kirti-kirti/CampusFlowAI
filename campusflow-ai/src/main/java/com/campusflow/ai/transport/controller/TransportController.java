package com.campusflow.ai.transport.controller;

import com.campusflow.ai.transport.dto.*;
import com.campusflow.ai.transport.service.TransportService;
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
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for the Transport Tracking module.
 *
 * Role matrix:
 * ┌──────────────────────────────────────────┬──────────────────────────────┐
 * │ Endpoint                                 │ Allowed Roles                │
 * ├──────────────────────────────────────────┼──────────────────────────────┤
 * │ POST   /api/transport/add                │ ADMIN                        │
 * │ PUT    /api/transport/update/{busId}     │ ADMIN                        │
 * │ DELETE /api/transport/delete/{busId}     │ ADMIN                        │
 * │ GET    /api/transport/all                │ ADMIN                        │
 * │ POST   /api/transport/location           │ TEACHER (driver)             │
 * │ GET    /api/transport/location/{busId}   │ STUDENT, ADMIN               │
 * │ GET    /api/transport/parent/{studentId} │ PARENT, ADMIN                │
 * * │ GET    /api/transport/distance           │ All authenticated            │
 * │ GET    /api/transport/details/{busId}    │ All authenticated            │
 * │ GET    /api/transport/students/{busId}   │ ADMIN, TEACHER, STUDENT, PARENT│
 * │ POST   /api/transport/check-in           │ ADMIN, TEACHER               │
 * │ POST   /api/transport/check-out          │ ADMIN, TEACHER               │
 * └──────────────────────────────────────────┴──────────────────────────────┘
 */
@Tag(name = "Transport", description = "Bus management and real-time GPS tracking")
@Validated
@RestController
@RequestMapping("/api/transport")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TransportController {

    private final TransportService transportService;

    // ─── ADMIN: Add Bus ──────────────────────────────────────────────────────────

    @Operation(
        summary = "Add a new bus",
        description = "**Role required: ADMIN**\n\nRegisters a new bus with driver and route details."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Bus added successfully",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = BusResponse.class),
                examples = @ExampleObject(value = """
                    {
                      "id": 1,
                      "busId": "BUS-01",
                      "busNumber": "MH-12-AB-1234",
                      "driverName": "Ramesh Kumar",
                      "driverId": "5",
                      "routeName": "Sector-5 → School → Sector-12",
                      "assignedClass": "CLASS-10A"
                    }"""))),
        @ApiResponse(responseCode = "400", description = "Validation error or duplicate busId"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = @ExampleObject(value = """
            {
              "busId":         "BUS-01",
              "busNumber":     "MH-12-AB-1234",
              "driverName":    "Ramesh Kumar",
              "driverId":      "5",
              "routeName":     "Sector-5 → School → Sector-12",
              "assignedClass": "CLASS-10A"
            }"""))
    )
    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BusResponse> addBus(@Valid @RequestBody BusRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transportService.addBus(request));
    }

    // ─── ADMIN: Update Bus ───────────────────────────────────────────────────────

    @Operation(
        summary = "Update bus details",
        description = "**Role required: ADMIN**\n\nUpdates an existing bus record by busId."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Bus updated successfully"),
        @ApiResponse(responseCode = "404", description = "Bus not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = @ExampleObject(value = """
            {
              "busId":         "BUS-01",
              "busNumber":     "MH-12-AB-9999",
              "driverName":    "Suresh Patel",
              "driverId":      "6",
              "routeName":     "Sector-5 → School → Sector-15",
              "assignedClass": "CLASS-10A"
            }"""))
    )
    @PutMapping("/update/{busId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BusResponse> updateBus(
            @Parameter(description = "Bus ID to update", example = "BUS-01")
            @PathVariable String busId,
            @Valid @RequestBody BusRequest request) {
        return ResponseEntity.ok(transportService.updateBus(busId, request));
    }

    // ─── ADMIN: Delete Bus ───────────────────────────────────────────────────────

    @Operation(
        summary = "Delete a bus",
        description = "**Role required: ADMIN**\n\nPermanently removes a bus record."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Bus deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Bus not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @DeleteMapping("/delete/{busId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteBus(
            @Parameter(description = "Bus ID to delete", example = "BUS-01")
            @PathVariable String busId) {
        transportService.deleteBus(busId);
        return ResponseEntity.ok(Map.of("message", "Bus deleted successfully"));
    }

    // ─── ADMIN: Get All Buses ────────────────────────────────────────────────────

    @Operation(
        summary = "Get all buses",
        description = "**Role required: ADMIN**\n\nReturns all registered buses."
    )
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BusResponse>> getAllBuses() {
        return ResponseEntity.ok(transportService.getAllBuses());
    }

    // ─── TEACHER/DRIVER: Update Location ────────────────────────────────────────

    @Operation(
        summary = "Update bus GPS location",
        description = "**Role required: TEACHER (driver)**\n\n" +
                      "Driver submits current GPS coordinates. " +
                      "The driver must be assigned to the bus they are updating. " +
                      "Identity is verified from the JWT token."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Location updated",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    {
                      "busId":           "BUS-01",
                      "busNumber":       "MH-12-AB-1234",
                      "driverName":      "Ramesh Kumar",
                      "routeName":       "Sector-5 → School → Sector-12",
                      "latitude":        28.6139,
                      "longitude":       77.2090,
                      "lastUpdatedTime": "2024-01-15T08:30:00",
                      "googleMapsUrl":   "https://maps.google.com/?q=28.6139,77.2090"
                    }"""))),
        @ApiResponse(responseCode = "400", description = "Invalid coordinates or not assigned to bus"),
        @ApiResponse(responseCode = "403", description = "Access denied — TEACHER role required")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = @ExampleObject(value = """
            {
              "busId":     "BUS-01",
              "latitude":  28.6139,
              "longitude": 77.2090
            }"""))
    )
    @PostMapping("/location")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BusLocationResponse> updateLocation(
            @Valid @RequestBody LocationUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                transportService.updateLocation(request, userDetails.getUsername()));
    }

    // ─── STUDENT: View Bus Location ──────────────────────────────────────────────

    @Operation(
        summary = "View bus location",
        description = "**Role required: STUDENT or ADMIN**\n\n" +
                      "Returns the latest GPS location of a specific bus. " +
                      "Students should pass their assigned busId."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Latest bus location returned",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    {
                      "busId":           "BUS-01",
                      "busNumber":       "MH-12-AB-1234",
                      "driverName":      "Ramesh Kumar",
                      "routeName":       "Sector-5 → School → Sector-12",
                      "latitude":        28.6139,
                      "longitude":       77.2090,
                      "lastUpdatedTime": "2024-01-15T08:30:00",
                      "googleMapsUrl":   "https://maps.google.com/?q=28.6139,77.2090"
                    }"""))),
        @ApiResponse(responseCode = "400", description = "Bus not found or no location data yet"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/location/{busId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<BusLocationResponse> getBusLocation(
            @Parameter(description = "Bus ID", example = "BUS-01")
            @PathVariable String busId) {
        return ResponseEntity.ok(transportService.getBusLocation(busId));
    }

    // ─── PARENT: Track Child's Bus ───────────────────────────────────────────────

    @Operation(
        summary = "Track child's bus (Parent)",
        description = "**Role required: PARENT or ADMIN**\n\n" +
                      "Returns the latest location of the bus assigned to the parent's child. " +
                      "The service validates that the parent is linked to the student. " +
                      "Parents cannot track other students' buses."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Child's bus location returned"),
        @ApiResponse(responseCode = "400", description = "Parent not linked to student or no bus assigned",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    { "status": 400, "message": "You are not authorized to track this student's bus" }"""))),
        @ApiResponse(responseCode = "403", description = "Access denied — PARENT role required")
    })
    @GetMapping("/parent/{studentId}")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<BusLocationResponse> getChildBusLocation(
            @Parameter(description = "Child's (student) user ID", example = "7")
            @PathVariable Long studentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                transportService.getBusLocationForParent(studentId, userDetails.getUsername()));
    }

    // ─── Distance Calculation ────────────────────────────────────────────────────

    @Operation(
        summary = "Calculate distance to bus",
        description = "**Role required: Any authenticated user**\n\n" +
                      "Calculates the straight-line distance (km) between the user's current " +
                      "location and the bus using the **Haversine formula**.\n\n" +
                      "Also returns:\n" +
                      "- Google Maps URL to view bus on map\n" +
                      "- Google Maps Directions URL from user to bus\n\n" +
                      "No external API key required — calculation is done server-side."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Distance calculated",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = """
                    {
                      "busId":               "BUS-01",
                      "busLatitude":         28.6139,
                      "busLongitude":        77.2090,
                      "userLatitude":        28.6200,
                      "userLongitude":       77.2150,
                      "distanceKm":          0.87,
                      "googleMapsUrl":       "https://maps.google.com/?q=28.6139,77.2090",
                      "googleDirectionsUrl": "https://www.google.com/maps/dir/28.6200,77.2150/28.6139,77.2090"
                    }"""))),
        @ApiResponse(responseCode = "400", description = "Bus not found or no location data")
    })
    @GetMapping("/distance")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DistanceResponse> calculateDistance(
            @Parameter(description = "Bus ID", example = "BUS-01")
            @RequestParam String busId,

            @Parameter(description = "Your current latitude", example = "28.6200")
            @RequestParam
            @NotNull(message = "userLat is required")
            @DecimalMin(value = "-90.0", message = "userLat must be >= -90.0")
            @DecimalMax(value = "90.0",  message = "userLat must be <= 90.0")
            Double userLat,

            @Parameter(description = "Your current longitude", example = "77.2150")
            @RequestParam
            @NotNull(message = "userLon is required")
            @DecimalMin(value = "-180.0", message = "userLon must be >= -180.0")
            @DecimalMax(value = "180.0",  message = "userLon must be <= 180.0")
            Double userLon) {

        return ResponseEntity.ok(
                transportService.calculateDistance(busId, userLat, userLon));
    }

    @Operation(summary = "Get count of students currently in the bus")
    @GetMapping("/count/{busId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getStudentCount(@PathVariable String busId) {
        return ResponseEntity.ok(Map.of("count", transportService.getStudentCountInBus(busId)));
    }

    // ─── Bus Details ─────────────────────────────────────────────────────────────

    @Operation(summary = "Get detailed bus information")
    @GetMapping("/details/{busId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BusResponse> getBusDetails(@PathVariable String busId) {
        return ResponseEntity.ok(transportService.getBusDetails(busId));
    }

    // ─── Student Manifest ────────────────────────────────────────────────────────

    @Operation(summary = "Get list of students currently in the bus")
    @GetMapping("/students/{busId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudentInBusResponse>> getStudentsInBus(@PathVariable String busId) {
        return ResponseEntity.ok(transportService.getStudentsInBus(busId));
    }

    // ─── Check-In / Check-Out ────────────────────────────────────────────────────

    @Operation(summary = "Check a student into a bus")
    @PostMapping("/check-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<StudentInBusResponse> checkIn(@Valid @RequestBody BusCheckInRequest request) {
        return ResponseEntity.ok(transportService.checkIn(request));
    }

    @Operation(summary = "Check a student out of a bus")
    @PostMapping("/check-out")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<StudentInBusResponse> checkOut(@Valid @RequestBody BusCheckInRequest request) {
        return ResponseEntity.ok(transportService.checkOut(request));
    }
}
