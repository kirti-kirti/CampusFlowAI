package com.campusflow.ai.transport.controller;

import com.campusflow.ai.transport.dto.RouteDto;
import com.campusflow.ai.transport.service.AiRouteService;
import com.campusflow.ai.transport.service.RouteService;
import io.swagger.v3.oas.annotations.Operation;
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
import java.util.Map;

@Tag(name = "Routes", description = "Bus route management")
@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class RouteController {

    private final RouteService routeService;
    private final AiRouteService aiRouteService;

    @Operation(summary = "Get all routes for the tenant")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RouteDto>> getRoutes(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(routeService.getRoutes(userDetails.getUsername()));
    }

    @Operation(summary = "Get a single route by ID")
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RouteDto> getRoute(@PathVariable Long id) {
        return ResponseEntity.ok(routeService.getRoute(id));
    }

    @Operation(summary = "Create a new route")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RouteDto> createRoute(
            @Valid @RequestBody RouteDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(routeService.createRoute(dto, userDetails.getUsername()));
    }

    @Operation(summary = "Update a route")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RouteDto> updateRoute(
            @PathVariable Long id,
            @Valid @RequestBody RouteDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(routeService.updateRoute(id, dto, userDetails.getUsername()));
    }

    @Operation(summary = "Delete a route")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteRoute(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        routeService.deleteRoute(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Route deleted"));
    }

    // ── AI Route Optimization ─────────────────────────────────────────────────

    @Operation(
        summary = "AI-optimize route for a bus",
        description = "Geocodes student home addresses, runs nearest-neighbor TSP excluding absent students, and saves the optimized stop order to the route."
    )
    @PostMapping("/ai-optimize/{busId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RouteDto> optimizeRoute(
            @PathVariable String busId) {
        return ResponseEntity.ok(aiRouteService.optimizeRoute(busId));
    }

    @Operation(summary = "Preview optimized route without saving")
    @GetMapping("/ai-preview/{busId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<RouteDto> previewRoute(@PathVariable String busId) {
        return ResponseEntity.ok(aiRouteService.getOptimizedPreview(busId));
    }

    @Operation(summary = "Mark a student absent/present for today's route")
    @PostMapping("/absent")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Map<String, String>> markAbsent(
            @RequestParam Long studentId,
            @RequestParam String busId,
            @RequestParam boolean absent) {
        aiRouteService.markAbsent(studentId, busId, absent);
        return ResponseEntity.ok(Map.of("message", absent ? "Marked absent" : "Marked present"));
    }
}
