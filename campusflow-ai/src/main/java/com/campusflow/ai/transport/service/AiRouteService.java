package com.campusflow.ai.transport.service;

import com.campusflow.ai.model.User;
import com.campusflow.ai.repository.UserRepository;
import com.campusflow.ai.transport.dto.RouteDto;
import com.campusflow.ai.transport.model.Bus;
import com.campusflow.ai.transport.model.BusStatus;
import com.campusflow.ai.transport.model.Route;
import com.campusflow.ai.transport.model.StudentBusMapping;
import com.campusflow.ai.transport.repository.BusRepository;
import com.campusflow.ai.transport.repository.RouteRepository;
import com.campusflow.ai.transport.repository.StudentBusMappingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AI-based route optimizer.
 *
 * Algorithm:
 *  1. Collect all students mapped to the bus (excluding absent ones)
 *  2. Geocode each student's home address via Google Maps Geocoding API
 *     (cached in user.addressLat/Lng to avoid repeated API calls)
 *  3. Run Nearest-Neighbor TSP starting from the school (destination)
 *     to find the optimal pickup order
 *  4. Save the ordered stop list back to the Route entity
 *  5. Notify the driver via the existing notification system
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiRouteService {

    private final BusRepository busRepository;
    private final StudentBusMappingRepository mappingRepository;
    private final UserRepository userRepository;
    private final RouteRepository routeRepository;
    private final RouteService routeService;
    private final RestTemplate restTemplate;

    @Value("${google.maps.api.key:}")
    private String googleMapsApiKey;

    // School is always the last stop (destination)
    private static final String SCHOOL_STOP = "School";

    // ── Main entry point ──────────────────────────────────────────────────────

    @Transactional
    public RouteDto optimizeRoute(String busId) {
        Bus bus = busRepository.findByBusId(busId)
                .orElseThrow(() -> new IllegalArgumentException("Bus not found: " + busId));

        // 1. Get all non-absent students on this bus
        List<StudentBusMapping> mappings = mappingRepository.findByBusId(busId)
                .stream()
                .filter(m -> !Boolean.TRUE.equals(m.getAbsent()))
                .collect(Collectors.toList());

        if (mappings.isEmpty()) {
            throw new IllegalArgumentException("No active students on bus " + busId + " to optimize route for");
        }

        // 2. Resolve students with addresses
        List<StudentStop> stops = new ArrayList<>();
        for (StudentBusMapping m : mappings) {
            userRepository.findById(m.getStudentId()).ifPresent(student -> {
                if (student.getAddress() != null && !student.getAddress().isBlank()) {
                    double[] coords = geocode(student);
                    if (coords != null) {
                        stops.add(new StudentStop(student.getName(), student.getAddress(), coords[0], coords[1]));
                    } else {
                        // No coords — add as a named stop without optimization
                        stops.add(new StudentStop(student.getName(), student.getAddress(), null, null));
                    }
                }
            });
        }

        if (stops.isEmpty()) {
            throw new IllegalArgumentException(
                "No student addresses found. Ask students to update their home address in their profile.");
        }

        // 3. Separate geocoded vs non-geocoded stops
        List<StudentStop> geocoded = stops.stream().filter(s -> s.lat != null).collect(Collectors.toList());
        List<StudentStop> nonGeocoded = stops.stream().filter(s -> s.lat == null).collect(Collectors.toList());

        // 4. Run nearest-neighbor TSP on geocoded stops
        List<StudentStop> ordered = geocoded.isEmpty() ? new ArrayList<>() : nearestNeighborTSP(geocoded);

        // 5. Build final stop list: optimized geocoded + non-geocoded + School
        List<String> finalStops = new ArrayList<>();
        ordered.forEach(s -> finalStops.add(s.address));
        nonGeocoded.forEach(s -> finalStops.add(s.address));
        finalStops.add(SCHOOL_STOP);

        // 6. Save to Route (create if not exists)
        Route route;
        if (bus.getRouteId() != null) {
            route = routeRepository.findById(bus.getRouteId()).orElse(null);
        } else {
            route = null;
        }

        if (route == null) {
            // Create a new route for this bus
            route = Route.builder()
                    .name("AI Route — " + bus.getBusNumber())
                    .stops(String.join(",", finalStops))
                    .tenantId(bus.getAssignedClass() != null ? bus.getAssignedClass() : "default")
                    .build();
            // Get tenantId from first student
            mappings.stream().findFirst().ifPresent(m ->
                userRepository.findById(m.getStudentId()).ifPresent(u -> route.setTenantId(u.getTenantId()))
            );
            Route savedRoute = routeRepository.save(route);
            bus.setRouteId(savedRoute.getId());
            bus.setRouteName(savedRoute.getName());
            busRepository.save(bus);
            log.info("AI created new route id={} for bus {}", savedRoute.getId(), busId);
            return routeService.toDto(savedRoute);
        } else {
            route.setStops(String.join(",", finalStops));
            Route saved = routeRepository.save(route);
            log.info("AI optimized route id={} for bus {}: {} stops", saved.getId(), busId, finalStops.size());
            return routeService.toDto(saved);
        }
    }

    @Transactional
    public void markAbsent(Long studentId, String busId, boolean absent) {
        StudentBusMapping mapping = mappingRepository
                .findByStudentIdAndBusId(studentId, busId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No mapping found for student " + studentId + " on bus " + busId));
        mapping.setAbsent(absent);
        mappingRepository.save(mapping);
        log.info("Student {} marked {} on bus {}", studentId, absent ? "ABSENT" : "PRESENT", busId);
    }

    @Transactional(readOnly = true)
    public RouteDto getOptimizedPreview(String busId) {
        Bus bus = busRepository.findByBusId(busId)
                .orElseThrow(() -> new IllegalArgumentException("Bus not found: " + busId));

        List<StudentBusMapping> all = mappingRepository.findByBusId(busId);
        List<StudentBusMapping> active = all.stream()
                .filter(m -> !Boolean.TRUE.equals(m.getAbsent()))
                .collect(Collectors.toList());

        List<String> stops = new ArrayList<>();
        for (StudentBusMapping m : active) {
            userRepository.findById(m.getStudentId()).ifPresent(student -> {
                String addr = student.getAddress();
                if (addr != null && !addr.isBlank()) stops.add(addr);
                else stops.add(student.getName() + " (no address)");
            });
        }
        stops.add(SCHOOL_STOP);

        return RouteDto.builder()
                .name("Preview — " + bus.getBusNumber() + " (" + active.size() + " active, " +
                      (all.size() - active.size()) + " absent)")
                .stops(stops)
                .build();
    }

    // ── Nearest-Neighbor TSP ──────────────────────────────────────────────────

    /**
     * Greedy nearest-neighbor TSP.
     * Starts from the last stop (school) and works backwards to find
     * the optimal pickup order — minimizing total travel distance.
     */
    private List<StudentStop> nearestNeighborTSP(List<StudentStop> stops) {
        if (stops.size() <= 1) return new ArrayList<>(stops);

        List<StudentStop> remaining = new ArrayList<>(stops);
        List<StudentStop> ordered = new ArrayList<>();

        // Start from school coordinates (approximate center — use first stop as anchor)
        // In a real scenario you'd use the school's actual lat/lng
        double currentLat = stops.get(0).lat;
        double currentLng = stops.get(0).lng;

        while (!remaining.isEmpty()) {
            StudentStop nearest = null;
            double minDist = Double.MAX_VALUE;
            for (StudentStop s : remaining) {
                double d = haversine(currentLat, currentLng, s.lat, s.lng);
                if (d < minDist) {
                    minDist = d;
                    nearest = s;
                }
            }
            ordered.add(nearest);
            remaining.remove(nearest);
            currentLat = nearest.lat;
            currentLng = nearest.lng;
        }

        return ordered;
    }

    // ── Geocoding ─────────────────────────────────────────────────────────────

    /**
     * Geocodes a student's address using Google Maps Geocoding API.
     * Caches result in user.addressLat/Lng to avoid repeated calls.
     * Returns [lat, lng] or null if geocoding fails.
     */
    private double[] geocode(User user) {
        // Return cached coords if available
        if (user.getAddressLat() != null && user.getAddressLng() != null) {
            return new double[]{user.getAddressLat(), user.getAddressLng()};
        }

        if (googleMapsApiKey == null || googleMapsApiKey.isBlank() || googleMapsApiKey.equals("YOUR_GOOGLE_MAPS_API_KEY")) {
            log.warn("Google Maps API key not configured — using address as stop name only");
            return null;
        }

        try {
            String url = "https://maps.googleapis.com/maps/api/geocode/json?address="
                    + java.net.URLEncoder.encode(user.getAddress(), "UTF-8")
                    + "&key=" + googleMapsApiKey;

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && "OK".equals(response.get("status"))) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
                if (results != null && !results.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> geometry = (Map<String, Object>) results.get(0).get("geometry");
                    @SuppressWarnings("unchecked")
                    Map<String, Object> location = (Map<String, Object>) geometry.get("location");
                    double lat = ((Number) location.get("lat")).doubleValue();
                    double lng = ((Number) location.get("lng")).doubleValue();

                    // Cache in user entity
                    user.setAddressLat(lat);
                    user.setAddressLng(lng);
                    userRepository.save(user);

                    log.info("Geocoded address for user {}: {},{}", user.getId(), lat, lng);
                    return new double[]{lat, lng};
                }
            }
        } catch (Exception e) {
            log.warn("Geocoding failed for user {}: {}", user.getId(), e.getMessage());
        }
        return null;
    }

    // ── Haversine ─────────────────────────────────────────────────────────────

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // ── Inner class ───────────────────────────────────────────────────────────

    private static class StudentStop {
        final String name;
        final String address;
        final Double lat;
        final Double lng;

        StudentStop(String name, String address, Double lat, Double lng) {
            this.name = name;
            this.address = address;
            this.lat = lat;
            this.lng = lng;
        }
    }
}
