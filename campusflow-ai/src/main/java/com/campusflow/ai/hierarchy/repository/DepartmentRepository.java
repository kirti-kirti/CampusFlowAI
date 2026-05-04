package com.campusflow.ai.hierarchy.repository;

import com.campusflow.ai.hierarchy.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    List<Department> findByUniversityId(Long universityId);
    List<Department> findByTenantId(String tenantId);
    Optional<Department> findByIdAndTenantId(Long id, String tenantId);
    Optional<Department> findByIdAndUniversityId(Long id, Long universityId);
    boolean existsByIdAndUniversityId(Long id, Long universityId);
}
