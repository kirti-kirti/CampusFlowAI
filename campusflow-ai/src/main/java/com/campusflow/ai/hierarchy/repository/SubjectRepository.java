package com.campusflow.ai.hierarchy.repository;

import com.campusflow.ai.hierarchy.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    List<Subject> findByClassRoomIdAndTenantId(Long classRoomId, String tenantId);
    List<Subject> findByTeacherIdAndTenantId(Long teacherId, String tenantId);
    List<Subject> findByDepartmentIdAndTenantId(Long departmentId, String tenantId);
    Optional<Subject> findByIdAndTenantId(Long id, String tenantId);
}
