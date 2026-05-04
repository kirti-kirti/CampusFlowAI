package com.campusflow.ai.transport.repository;

import com.campusflow.ai.transport.model.Bus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Data access for Bus entity.
 */
public interface BusRepository extends JpaRepository<Bus, Long> {

    /** Look up a bus by its human-readable busId (e.g. "BUS-01") */
    Optional<Bus> findByBusId(String busId);

    /** Check for duplicate busId before creating */
    boolean existsByBusId(String busId);

    /** Used by TEACHER/DRIVER to find their assigned bus */
    Optional<Bus> findByDriverId(String driverId);

    /** Used by STUDENT/PARENT to find the bus for their class */
    Optional<Bus> findByAssignedClass(String assignedClass);
}
