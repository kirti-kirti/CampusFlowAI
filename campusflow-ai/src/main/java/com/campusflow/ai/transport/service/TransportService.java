package com.campusflow.ai.transport.service;

import com.campusflow.ai.model.User;
import com.campusflow.ai.repository.UserRepository;
import com.campusflow.ai.transport.dto.*;
import com.campusflow.ai.transport.model.Bus;
import com.campusflow.ai.transport.model.BusLocation;
import com.campusflow.ai.transport.model.BusStatus;
import com.campusflow.ai.transport.model.StudentBusMapping;
import com.campusflow.ai.transport.repository.BusLocationRepository;
import com.campusflow.ai.transport.repository.BusRepository;
import com.campusflow.ai.transport.repository.StudentBusMappingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core business logic for the Transport Tracking module.
 *
 * Responsibilities:
 *  - ADMIN: add, update, delete buses
 *  - TEACHER/DRIVER: update bus GPS location
 *  - STUDENT: view their assigned bus location
 *  - PARENT: track their child's bus
 *  - ALL: calculate distance to bus (Haversine formula)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TransportService {

    private final BusRepository busRepository;
    private final BusLocationRepository busLocationRepository;
    private final UserRepository userRepository;
    private final StudentBusMappingRepository mappingRepository;

    // ─── ADMIN: Add Bus ──────────────────────────────────────────────────────────

    /**
     * Registers a new bus in the system.
     * Rejects duplicate busId values.
     */
    @Transactional
    public BusResponse addBus(BusRequest request) {
        if (busRepository.existsByBusId(request.getBusId())) {
            throw new IllegalArgumentException(
                    "Bus with ID '" + request.getBusId() + "' already exists");
        }
        Bus saved = busRepository.save(toEntity(request));
        log.info("Bus added: busId={}, route={}", saved.getBusId(), saved.getRouteName());
        return toResponse(saved);
    }

    // ─── ADMIN: Update Bus ───────────────────────────────────────────────────────

    /**
     * Updates an existing bus record by its busId.
     */
    @Transactional
    public BusResponse updateBus(String busId, BusRequest request) {
        Bus bus = findBusByBusId(busId);
        bus.setBusNumber(request.getBusNumber());
        bus.setDriverName(request.getDriverName());
        bus.setDriverId(request.getDriverId());
        bus.setRouteName(request.getRouteName());
        bus.setAssignedClass(request.getAssignedClass());
        Bus saved = busRepository.save(bus);
        log.info("Bus updated: busId={}", busId);
        return toResponse(saved);
    }

    // ─── ADMIN: Delete Bus ───────────────────────────────────────────────────────

    /**
     * Deletes a bus record by its busId.
     */
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

    /**
     * Records a new GPS location ping for a bus.
     * Validates that the requesting driver is assigned to this bus.
     *
     * @param request     busId + latitude + longitude
     * @param driverEmail email from JWT
     */
    @Transactional
    public BusLocationResponse updateLocation(LocationUpdateRequest request, String driverEmail) {
        Bus bus = findBusByBusId(request.getBusId());

        // Resolve driver from JWT email
        User driver = findUserByEmail(driverEmail);

        // Security: driver can only update their own assigned bus
        if (!bus.getDriverId().equals(String.valueOf(driver.getId()))) {
            throw new IllegalArgumentException(
                    "You are not assigned to bus: " + request.getBusId());
        }

        BusLocation location = BusLocation.builder()
                .busId(request.getBusId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .timestamp(LocalDateTime.now())
                .build();

        busLocationRepository.save(location);
        log.info("Location updated for bus {}: lat={}, lng={}",
                request.getBusId(), request.getLatitude(), request.getLongitude());

        return buildLocationResponse(bus, location);
    }

    // ─── STUDENT/PARENT: View Bus Location ───────────────────────────────────────

    /**
     * Returns the latest location of a specific bus.
     * Used directly by STUDENT and ADMIN.
     */
    @Transactional(readOnly = true)
    public BusLocationResponse getBusLocation(String busId) {
        Bus bus = findBusByBusId(busId);
        BusLocation location = busLocationRepository.findLatestByBusId(busId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No location data available for bus: " + busId));
        return buildLocationResponse(bus, location);
    }

    /**
     * Returns the latest location of the bus assigned to a parent's child.
     *
     * Security checks:
     *  1. Parent must be linked to the student (parent.studentId == studentId)
     *  2. Student's class must be assigned to a bus
     *
     * @param studentId   the child's user ID
     * @param parentEmail email from JWT
     */
    @Transactional(readOnly = true)
    public BusLocationResponse getBusLocationForParent(Long studentId, String parentEmail) {
        // 1. Resolve parent from JWT
        User parent = findUserByEmail(parentEmail);

        // 2. Verify parent-child link
        if (parent.getStudentId() == null ||
                !parent.getStudentId().equals(String.valueOf(studentId))) {
            throw new IllegalArgumentException(
                    "You are not authorized to track this student's bus");
        }

        // 3. Resolve student to get their class
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Student not found with ID: " + studentId));

        // 4. Find the bus assigned to the student's class
        String classId = student.getStudentId(); // studentId field stores classId for students
        Bus bus = busRepository.findByAssignedClass(classId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No bus assigned to class: " + classId));

        return getBusLocation(bus.getBusId());
    }

    // ─── Distance Calculation (Haversine) ────────────────────────────────────────

    /**
     * Calculates the straight-line distance between the user's location and the bus.
     * Uses the Haversine formula — no external API needed.
     *
     * Also generates:
     *  - Google Maps URL to view bus location
     *  - Google Maps Directions URL from user to bus
     *
     * @param busId         target bus
     * @param userLatitude  user's current latitude
     * @param userLongitude user's current longitude
     */
    @Transactional(readOnly = true)
    public DistanceResponse calculateDistance(String busId,
                                              Double userLatitude,
                                              Double userLongitude) {
        BusLocation location = busLocationRepository.findLatestByBusId(busId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No location data available for bus: " + busId));

        double distanceKm = haversineDistance(
                userLatitude, userLongitude,
                location.getLatitude(), location.getLongitude());

        String mapsUrl = buildMapsUrl(location.getLatitude(), location.getLongitude());
        String directionsUrl = buildDirectionsUrl(
                userLatitude, userLongitude,
                location.getLatitude(), location.getLongitude());

        log.info("Distance from user ({},{}) to bus {}: {} km",
                userLatitude, userLongitude, busId, String.format("%.2f", distanceKm));

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

    /**
     * Marks a student as IN_BUS.
     * If a mapping already exists for this student+bus, updates it.
     * Prevents double check-in on the same bus.
     * Clears any active mapping on a different bus first.
     */
    @Transactional
    public StudentInBusResponse checkIn(BusCheckInRequest request) {
        findBusByBusId(request.getBusId()); // validate bus exists
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Student not found: " + request.getStudentId()));

        // If already IN_BUS on another bus, check them out first
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

    /**
     * Marks a student as OUT_BUS.
     * Throws if the student is not currently IN_BUS on this bus.
     */
    @Transactional
    public StudentInBusResponse checkOut(BusCheckInRequest request) {
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Student not found: " + request.getStudentId()));

        StudentBusMapping mapping = mappingRepository
                .findByStudentIdAndBusId(request.getStudentId(), request.getBusId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No active mapping found for student " + request.getStudentId() +
                        " on bus " + request.getBusId()));

        if (mapping.getStatus() == BusStatus.OUT_BUS) {
            throw new IllegalStateException("Student is already checked out from this bus");
        }

        mapping.setStatus(BusStatus.OUT_BUS);
        mapping.setCheckedOutAt(LocalDateTime.now());
        StudentBusMapping saved = mappingRepository.save(mapping);

        log.info("Student {} checked OUT from bus {}", request.getStudentId(), request.getBusId());
        return toStudentInBusResponse(saved, student);
    }

    /** Returns all students currently IN_BUS for a given bus */
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

    /** Returns count of students currently IN_BUS for a given bus */
    @Transactional(readOnly = true)
    public long getStudentCountInBus(String busId) {
        findBusByBusId(busId);
        return mappingRepository.countByBusIdAndStatus(busId, BusStatus.IN_BUS);
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────────

    private Bus findBusByBusId(String busId) {
        return busRepository.findByBusId(busId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Bus not found with ID: " + busId));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User not found: " + email));
    }

    private BusLocationResponse buildLocationResponse(Bus bus, BusLocation location) {
        return BusLocationResponse.builder()
                .busId(bus.getBusId())
                .busNumber(bus.getBusNumber())
                .driverName(bus.getDriverName())
                .routeName(bus.getRouteName())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .lastUpdatedTime(location.getTimestamp())
                .googleMapsUrl(buildMapsUrl(location.getLatitude(), location.getLongitude()))
                .build();
    }

    private Bus toEntity(BusRequest req) {
        return Bus.builder()
                .busId(req.getBusId())
                .busNumber(req.getBusNumber())
                .driverName(req.getDriverName())
                .driverId(req.getDriverId())
                .routeName(req.getRouteName())
                .assignedClass(req.getAssignedClass())
                .build();
    }

    private BusResponse toResponse(Bus bus, long studentCount) {
        return BusResponse.builder()
                .id(bus.getId())
                .busId(bus.getBusId())
                .busNumber(bus.getBusNumber())
                .driverName(bus.getDriverName())
                .driverId(bus.getDriverId())
                .routeName(bus.getRouteName())
                .assignedClass(bus.getAssignedClass())
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

    /**
     * Haversine formula — calculates great-circle distance between two GPS points.
     * Returns distance in kilometres.
     *
     * Formula: a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlon/2)
     *          c = 2·atan2(√a, √(1−a))
     *          d = R·c   where R = 6371 km (Earth's radius)
     */
    private double haversineDistance(double lat1, double lon1,
                                     double lat2, double lon2) {
        final double R = 6371.0; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /** Generates a Google Maps URL to view a specific coordinate */
    private String buildMapsUrl(double lat, double lon) {
        return String.format("https://maps.google.com/?q=%s,%s", lat, lon);
    }

    /** Generates a Google Maps Directions URL from origin to destination */
    private String buildDirectionsUrl(double fromLat, double fromLon,
                                      double toLat, double toLon) {
        return String.format(
                "https://www.google.com/maps/dir/%s,%s/%s,%s",
                fromLat, fromLon, toLat, toLon);
    }
}
