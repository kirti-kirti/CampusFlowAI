package com.campusflow.ai.transport.repository;

import com.campusflow.ai.transport.model.Route;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RouteRepository extends JpaRepository<Route, Long> {
    List<Route> findByTenantId(String tenantId);
    boolean existsByNameAndTenantId(String name, String tenantId);
}
