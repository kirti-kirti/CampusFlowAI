package com.campusflow.ai.repository;

import com.campusflow.ai.model.Role;
import com.campusflow.ai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // ─── Role queries ─────────────────────────────────────────────────────────────
    List<User> findByRole(Role role);
    List<User> findByRoleAndTenantId(Role role, String tenantId);

    // ─── Hierarchy queries ────────────────────────────────────────────────────────
    List<User> findByTenantId(String tenantId);
    long countByTenantIdAndRole(String tenantId, Role role);

    List<User> findByDepartmentIdAndTenantId(Long departmentId, String tenantId);
    List<User> findByClassRoomIdAndTenantId(Long classRoomId, String tenantId);
    List<User> findByRoleAndDepartmentIdAndTenantId(Role role, Long departmentId, String tenantId);
    List<User> findByRoleAndClassRoomIdAndTenantId(Role role, Long classRoomId, String tenantId);

    // ─── Validation helpers ───────────────────────────────────────────────────────
    boolean existsByIdAndTenantId(Long id, String tenantId);
    boolean existsByIdAndClassRoomIdAndTenantId(Long id, Long classRoomId, String tenantId);
    Optional<User> findByIdAndTenantId(Long id, String tenantId);
}
