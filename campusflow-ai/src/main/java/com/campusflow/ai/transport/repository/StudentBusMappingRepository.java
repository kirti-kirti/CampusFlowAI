package com.campusflow.ai.transport.repository;

import com.campusflow.ai.transport.model.BusStatus;
import com.campusflow.ai.transport.model.StudentBusMapping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentBusMappingRepository extends JpaRepository<StudentBusMapping, Long> {

    /** All students currently IN a specific bus */
    List<StudentBusMapping> findByBusIdAndStatus(String busId, BusStatus status);

    /** Count of students currently IN a specific bus */
    long countByBusIdAndStatus(String busId, BusStatus status);

    /** Find a student's current mapping for a bus (for check-in/out) */
    Optional<StudentBusMapping> findByStudentIdAndBusId(Long studentId, String busId);

    /** Find any active IN_BUS mapping for a student (they can only be on one bus) */
    Optional<StudentBusMapping> findByStudentIdAndStatus(Long studentId, BusStatus status);
}
