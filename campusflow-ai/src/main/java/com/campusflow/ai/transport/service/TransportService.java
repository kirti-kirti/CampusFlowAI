package com.campusflow.ai.transport.service;

import com.campusflow.ai.model.Role;
import com.campusflow.ai.model.User;
import com.campusflow.ai.notification.dto.NotificationRequest;
import com.campusflow.ai.notification.model.NotificationTarget;
import com.campusflow.ai.notification.service.NotificationService;
import com.campusflow.ai.repository.UserRepository;
import com.campusflow.ai.transport.dto.*;
import com.campusflow.ai.transport.model.Bus;
import com.campusflow.ai.transport.model.BusLocation;
import com.campusflow.ai.transport.model.BusStatus;
import com.campusflow.ai.transport.model.StudentBusMapping;
import com.campusflow.ai.transport.repository.BusLocationRepository;
import com.campusflow.ai.transport.repository.BusRepository;
import com.campusflow.ai.transport.repository.RouteRepository;
import com.campusflow.ai.transport.repository.StudentBusMappingRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
public class TransportService {

    private final BusRepository busRepository;
    private final BusLocationRepository busLocationRepository;
    private final UserRepository userRepository;
    private final StudentBusMappingRepository mappingRepository;
    private final RouteRepository routeRepository;
    private final NotificationService notificationService;

    @Autowired
    public TransportService(BusRepository busRepository,
                            BusLocationRepository busLocationRepository,
                            UserRepository userRepository,
                            StudentBusMappingRepository mappingRepository,
                            RouteRepository routeRepository,
                            @Lazy NotificationService notificationService) {
        this.busRepository = busRepository;
        this.busLocationRepository = busLocationRepository;
        this.userRepository = userRepository;
        this.mappingRepository = mappingRepository;
        this.routeRepository = routeRepository;
        this.notificationService = notificationService;
    }

    // ─── ADMIN: Add Bus ──────────────────────────────────────────────────────────

    @Transactional
    public BusResponse addBus(BusRequest request) {
        if (busRepository.existsByBusId(request.getBusId())) {
            throw new IllegalArgumentException("Bus with ID '" + request.getBusId() + "' already exists");
        }
        Bus saved = busRepository.save(toEntity(request));
        log.info("Bus added: busId={}, route={}", saved.getBusId(), saved.getRouteName());
        return toResponse(saved);
    }

    // ─── ADMIN: Update Bus ───────────────────────────────────────────────────────

    @Transactional
    public BusResponse updateBus(String busId, BusRequest request) {
        Bus bus = findBusByBusId(busId);
        bus.setBusNumber(request.getBusNumber());
        bus.setDriverName(request.getDriverName());
        bus.setDriverId(request.getDriverId());
        bus.setAssignedClass(request.getAssignedClass());
        bus.setRouteId(request.getRouteId());
        if (request.getRouteId() != null) {
            String name = routeRepository.findById(request.getRouteId())
                    .map(r -> r.getName()).orElse(request.getRouteName());
            bus.setRouteName(name);
        } else {
            bus.setRouteName(request.getRouteName());
        }
        Bus saved = busRepository.save(bus);
        log.info("Bus updated: busId={}", busId);
        return toResponse(saved);
    }

    // ─── ADMIN: Delete Bus ───────────────────────────────────────────────────────

    @Transactional
    public void deleteBus(String busId) {
        Bus bus = findBusByBusId(busId);
        busRepository.delete(bus);
        log.info("Bus deleted: busId={}", busId);
    }

    // ─── ADMIN: Get All Buses ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<BusResponse> getAllBuses() {
        return busRepository.findAll().stream()
                .map(bus -> {
                    long count = mappingRepository.countByBusIdAndStatus(bus.getBusId(), BusStatus.IN_BUS);
                    return toResponse(bus, count);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BusResponse getBusDetails(String busId) {
        Bus bus = findBusByBusId(busId);
        long count = mappingRepository.countByBusIdAndStatus(busId, BusStatus.IN_BUS);
        return toResponse(bus, count);
    }

    // ─── TEACHER/DRIVER: Update Location ────────────────────────────────────────

    @Transactional
    public BusLocationResponse updateLocation(LocationUpdateRequest request, String driverEmail) {
        User driver = findUserByEmail(driverEmail);

        // Find bus assigned to this driver — ignore the busId in request for security
        Bus bus = busRepository.findByDriverId(String.valueOf(driver.getId()))
                .orElseThrow(() -> new IllegalArgumentException("You are not assigned to any bus"));

        // Override busId from request with the actual assigned bus (prevents spoofing)
        BusLocation location = BusLocation.builder()
                .busId(bus.getBusId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .timestamp(LocalDateTime.now())
                .build();

        busLocationRepository.save(location);
        log.info("Location updated for bus {} by driver {}: lat={}, lng={}",
                bus.getBusId(), driverEmail, request.getLatitude(), request.getLongitude());

        sendEtaNotification(bus, location);

        return buildLocationResponse(bus, location);
    }

    // ─── STUDENT/PARENT: View Bus Location ───────────────────────────────────────

    @Transactional(readOnly = true)
    public BusLocationResponse getBusLocation(String busId) {
        Bus bus = findBusByBusId(busId);
        BusLocation location = busLocationRepository.findLatestByBusId(busId)
                .orElseThrow(() -> new IllegalArgumentException("No location data available for bus: " + busId));
        return buildLocationResponse(bus, location);
    }

    @Transactional(readOnly = true)
    public BusLocationResponse getBusLocationForParent(Long studentId, String parentEmail) {
        User parent = findUserByEmail(parentEmail);

        if (parent.getStudentId() == null || !parent.getStudentId().equals(String.valueOf(studentId))) {
            throw new IllegalArgumentException("You are not authorized to track this student's bus");
        }

        return getBusForStudent(studentId);
    }

    // ─── Role-aware: My Bus ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public BusLocationResponse getMyBus(String email) {
        User user = findUserByEmail(email);

        if (user.getRole() == Role.STUDENT) {
            return getBusForStudent(user.getId());
        }

        if (user.getRole() == Role.PARENT) {
            String studentIds = user.getStudentId();
            if (studentIds == null || studentIds.isBlank())
                throw new IllegalArgumentException("No child linked to your account");
            Long firstChildId = Long.parseLong(studentIds.split(",")[0].trim());
            return getBusForStudent(firstChildId);
        }

        if (user.getRole() == Role.TEACHER) {
            Bus bus = busRepository.findByDriverId(String.valueOf(user.getId()))
                    .orElseThrow(() -> new IllegalArgumentException("You are not assigned to any bus"));
            // Return bus info without requiring a location to already exist
            return getBusLocationOrEmpty(bus);
        }

        throw new IllegalArgumentException("Use /all endpoint for admin bus listing");
    }

    /**
     * Resolves the bus for a student by:
     *  1. Their active StudentBusMapping (checked in by admin) — primary
     *  2. Any mapping (even OUT_BUS) — so they can still see their bus
     *  3. assignedClass match as last resort
     */
    private BusLocationResponse getBusForStudent(Long studentId) {
        // 1. Active check-in
        Optional<StudentBusMapping> active = mappingRepository.findByStudentIdAndStatus(studentId, BusStatus.IN_BUS);
        if (active.isPresent()) {
            return getBusLocation(active.get().getBusId());
        }

        // 2. Any mapping (OUT_BUS) — student was assigned to a bus
        List<StudentBusMapping> any = mappingRepository.findByStudentId(studentId);
        if (!any.isEmpty()) {
            // Pick the most recently updated one
            StudentBusMapping latest = any.stream()
                    .max(Comparator.comparingLong(StudentBusMapping::getId))
                    .get();
            return getBusLocation(latest.getBusId());
        }

        throw new IllegalArgumentException("You have not been assigned to any bus yet. Please contact your admin.");
    }

    // ─── Distance Calculation (Haversine) ────────────────────────────────────────

    @Transactional(readOnly = true)
    public DistanceResponse calculateDistance(String busId, Double userLatitude, Double userLongitude) {
        BusLocation location = busLocationRepository.findLatestByBusId(busId)
                .orElseThrow(() -> new IllegalArgumentException("No location data available for bus: " + busId));

        double distanceKm = haversineDistance(userLatitude, userLongitude, location.getLatitude(), location.getLongitude());
        String mapsUrl = buildMapsUrl(location.getLatitude(), location.getLongitude());
        String directionsUrl = buildDirectionsUrl(userLatitude, userLongitude, location.getLatitude(), location.getLongitude());

        log.info("Distance from user ({},{}) to bus {}: {} km", userLatitude, userLongitude, busId, String.format("%.2f", distanceKm));

        return DistanceResponse.builder()
                .busId(busId)
                .busLatitude(location.getLatitude())
                .busLongitude(location.getLongitude())
                .userLatitude(userLatitude)
                .userLongitude(userLongitude)
                .distanceKm(Math.round(distanceKm * 100.0) / 100.0)
                .googleMapsUrl(mapsUrl)
                .googleDirectionsUrl(directionsUrl)
                .build();
    }

    // ─── Check-In / Check-Out ────────────────────────────────────────────────────

    @Transactional
    public StudentInBusResponse checkIn(BusCheckInRequest request) {
        findBusByBusId(request.getBusId());
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + request.getStudentId()));

        mappingRepository.findByStudentIdAndStatus(request.getStudentId(), BusStatus.IN_BUS)
                .ifPresent(existing -> {
                    existing.setStatus(BusStatus.OUT_BUS);
                    existing.setCheckedOutAt(LocalDateTime.now());
                    mappingRepository.save(existing);
                });

        StudentBusMapping mapping = mappingRepository
                .findByStudentIdAndBusId(request.getStudentId(), request.getBusId())
                .orElse(StudentBusMapping.builder()
                        .studentId(request.getStudentId())
                        .busId(request.getBusId())
                        .tenantId(student.getTenantId())
                        .build());

        mapping.setStatus(BusStatus.IN_BUS);
        mapping.setCheckedInAt(LocalDateTime.now());
        mapping.setCheckedOutAt(null);
        StudentBusMapping saved = mappingRepository.save(mapping);

        log.info("Student {} checked IN to bus {}", request.getStudentId(), request.getBusId());
        return toStudentInBusResponse(saved, student);
    }

    @Transactional
    public StudentInBusResponse checkOut(BusCheckInRequest request) {
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + request.getStudentId()));

        StudentBusMapping mapping = mappingRepository
                .findByStudentIdAndBusId(request.getStudentId(), request.getBusId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No active mapping found for student " + request.getStudentId() + " on bus " + request.getBusId()));

        if (mapping.getStatus() == BusStatus.OUT_BUS) {
            throw new IllegalStateException("Student is already checked out from this bus");
        }

        mapping.setStatus(BusStatus.OUT_BUS);
        mapping.setCheckedOutAt(LocalDateTime.now());
        StudentBusMapping saved = mappingRepository.save(mapping);

        log.info("Student {} checked OUT from bus {}", request.getStudentId(), request.getBusId());
        return toStudentInBusResponse(saved, student);
    }

    @Transactional(readOnly = true)
    public List<StudentInBusResponse> getStudentsInBus(String busId) {
        findBusByBusId(busId);
        return mappingRepository.findByBusIdAndStatus(busId, BusStatus.IN_BUS)
                .stream()
                .map(m -> {
                    User student = userRepository.findById(m.getStudentId()).orElse(null);
                    return toStudentInBusResponse(m, student);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getStudentCountInBus(String busId) {
        findBusByBusId(busId);
        return mappingRepository.countByBusIdAndStatus(busId, BusStatus.IN_BUS);
    }

    // ─── ETA Notification ────────────────────────────────────────────────────────

    private void sendEtaNotification(Bus bus, BusLocation location) {
        try {
            List<StudentBusMapping> onBus = mappingRepository.findByBusIdAndStatus(bus.getBusId(), BusStatus.IN_BUS);
            for (StudentBusMapping m : onBus) {
                userRepository.findById(m.getStudentId()).ifPresent(student -> {
                    // Notify student
                    NotificationRequest sn = new NotificationRequest();
                    sn.setTitle("🚌 Bus Update — " + bus.getBusNumber());
                    sn.setMessage(String.format("Your bus is on route: %s. Position: %.4f, %.4f",
                            bus.getRouteName(), location.getLatitude(), location.getLongitude()));
                    sn.setTargetRole(NotificationTarget.STUDENT);
                    sn.setUserId(student.getId());
                    notificationService.send(sn);

                    // Notify linked parents
                    userRepository.findAll().stream()
                            .filter(u -> u.getRole() == Role.PARENT
                                    && u.getStudentId() != null
                                    && Arrays.asList(u.getStudentId().split(",")).contains(String.valueOf(student.getId())))
                            .forEach(parent -> {
                                NotificationRequest pn = new NotificationRequest();
                                pn.setTitle("🚌 " + student.getName() + "'s Bus Update");
                                pn.setMessage(String.format("Bus %s is on route: %s", bus.getBusNumber(), bus.getRouteName()));
                                pn.setTargetRole(NotificationTarget.PARENT);
                                pn.setUserId(parent.getId());
                                notificationService.send(pn);
                            });
                });
            }
        } catch (Exception e) {
            log.warn("ETA notification failed for bus {}: {}", bus.getBusId(), e.getMessage());
        }
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────────

    private BusLocationResponse getBusLocationOrEmpty(Bus bus) {
        long studentCount = mappingRepository.countByBusIdAndStatus(bus.getBusId(), BusStatus.IN_BUS);
        // Try to get latest location, return null coords if none exists yet
        BusLocation location = busLocationRepository.findLatestByBusId(bus.getBusId()).orElse(null);
        return BusLocationResponse.builder()
                .busId(bus.getBusId())
                .busNumber(bus.getBusNumber())
                .driverName(bus.getDriverName())
                .routeName(bus.getRouteName())
                .latitude(location != null ? location.getLatitude() : null)
                .longitude(location != null ? location.getLongitude() : null)
                .lastUpdatedTime(location != null ? location.getTimestamp() : null)
                .googleMapsUrl(location != null ? buildMapsUrl(location.getLatitude(), location.getLongitude()) : null)
                .studentCount(studentCount)
                .capacity(bus.getCapacity())
                .build();
    }

    private Bus findBusByBusId(String busId) {
        return busRepository.findByBusId(busId)
                .orElseThrow(() -> new IllegalArgumentException("Bus not found with ID: " + busId));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    private BusLocationResponse buildLocationResponse(Bus bus, BusLocation location) {
        long studentCount = mappingRepository.countByBusIdAndStatus(bus.getBusId(), BusStatus.IN_BUS);
        return BusLocationResponse.builder()
                .busId(bus.getBusId())
                .busNumber(bus.getBusNumber())
                .driverName(bus.getDriverName())
                .routeName(bus.getRouteName())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .lastUpdatedTime(location.getTimestamp())
                .googleMapsUrl(buildMapsUrl(location.getLatitude(), location.getLongitude()))
                .studentCount(studentCount)
                .capacity(bus.getCapacity())
                .build();
    }

    private Bus toEntity(BusRequest req) {
        String resolvedRouteName = req.getRouteName();
        if (req.getRouteId() != null) {
            resolvedRouteName = routeRepository.findById(req.getRouteId())
                    .map(r -> r.getName()).orElse(req.getRouteName());
        }
        return Bus.builder()
                .busId(req.getBusId())
                .busNumber(req.getBusNumber())
                .driverName(req.getDriverName())
                .driverId(req.getDriverId())
                .routeName(resolvedRouteName)
                .routeId(req.getRouteId())
                .assignedClass(req.getAssignedClass())
                .build();
    }

    private BusResponse toResponse(Bus bus, long studentCount) {
        List<String> stops = java.util.Collections.emptyList();
        if (bus.getRouteId() != null) {
            stops = routeRepository.findById(bus.getRouteId())
                    .map(r -> r.getStops() == null || r.getStops().isBlank()
                            ? java.util.Collections.<String>emptyList()
                            : java.util.Arrays.asList(r.getStops().split(",")))
                    .orElse(java.util.Collections.emptyList());
        }
        return BusResponse.builder()
                .id(bus.getId())
                .busId(bus.getBusId())
                .busNumber(bus.getBusNumber())
                .driverName(bus.getDriverName())
                .driverId(bus.getDriverId())
                .routeName(bus.getRouteName())
                .routeId(bus.getRouteId())
                .stops(stops)
                .assignedClass(bus.getAssignedClass())
                .capacity(bus.getCapacity())
                .studentCount(studentCount)
                .build();
    }

    private BusResponse toResponse(Bus bus) {
        return toResponse(bus, 0L);
    }

    private StudentInBusResponse toStudentInBusResponse(StudentBusMapping m, User student) {
        return StudentInBusResponse.builder()
                .studentId(m.getStudentId())
                .studentName(student != null ? student.getName() : "Unknown")
                .email(student != null ? student.getEmail() : null)
                .status(m.getStatus())
                .checkedInAt(m.getCheckedInAt())
                .checkedOutAt(m.getCheckedOutAt())
                .build();
    }

    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private String buildMapsUrl(double lat, double lon) {
        return String.format("https://maps.google.com/?q=%s,%s", lat, lon);
    }

    private String buildDirectionsUrl(double fromLat, double fromLon, double toLat, double toLon) {
        return String.format("https://www.google.com/maps/dir/%s,%s/%s,%s", fromLat, fromLon, toLat, toLon);
    }
}
