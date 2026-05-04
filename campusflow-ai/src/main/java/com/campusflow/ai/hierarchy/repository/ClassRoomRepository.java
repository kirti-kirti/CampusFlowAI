package com.campusflow.ai.hierarchy.repository;

import com.campusflow.ai.hierarchy.model.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClassRoomRepository extends JpaRepository<ClassRoom, Long> {

    List<ClassRoom> findByDepartmentIdAndTenantId(Long departmentId, String tenantId);
    List<ClassRoom> findByUniversityId(Long universityId);
    Optional<ClassRoom> findByIdAndTenantId(Long id, String tenantId);
    Optional<ClassRoom> findByIdAndDepartmentIdAndTenantId(Long id, Long departmentId, String tenantId);
    boolean existsByIdAndDepartmentIdAndTenantId(Long id, Long departmentId, String tenantId);
    boolean existsByIdAndTenantId(Long id, String tenantId);
}
