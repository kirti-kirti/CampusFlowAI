package com.campusflow.ai.transport.service;

import com.campusflow.ai.model.User;
import com.campusflow.ai.repository.UserRepository;
import com.campusflow.ai.transport.dto.RouteDto;
import com.campusflow.ai.transport.model.Route;
import com.campusflow.ai.transport.repository.RouteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RouteService {

    private final RouteRepository routeRepository;
    private final UserRepository userRepository;

    @Transactional
    public RouteDto createRoute(RouteDto dto, String adminEmail) {
        String tenantId = getTenantId(adminEmail);
        if (routeRepository.existsByNameAndTenantId(dto.getName(), tenantId)) {
            throw new IllegalArgumentException("Route '" + dto.getName() + "' already exists");
        }
        Route route = Route.builder()
                .name(dto.getName())
                .stops(stopsToString(dto.getStops()))
                .tenantId(tenantId)
                .build();
        Route saved = routeRepository.save(route);
        log.info("Route created: id={}, name={}", saved.getId(), saved.getName());
        return toDto(saved);
    }

    @Transactional
    public RouteDto updateRoute(Long id, RouteDto dto, String adminEmail) {
        String tenantId = getTenantId(adminEmail);
        Route route = routeRepository.findById(id)
                .filter(r -> r.getTenantId().equals(tenantId))
                .orElseThrow(() -> new IllegalArgumentException("Route not found: " + id));
        route.setName(dto.getName());
        route.setStops(stopsToString(dto.getStops()));
        return toDto(routeRepository.save(route));
    }

    @Transactional
    public void deleteRoute(Long id, String adminEmail) {
        String tenantId = getTenantId(adminEmail);
        Route route = routeRepository.findById(id)
                .filter(r -> r.getTenantId().equals(tenantId))
                .orElseThrow(() -> new IllegalArgumentException("Route not found: " + id));
        routeRepository.delete(route);
        log.info("Route deleted: id={}", id);
    }

    @Transactional(readOnly = true)
    public List<RouteDto> getRoutes(String adminEmail) {
        String tenantId = getTenantId(adminEmail);
        return routeRepository.findByTenantId(tenantId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RouteDto getRoute(Long id) {
        return toDto(routeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Route not found: " + id)));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String getTenantId(String email) {
        return userRepository.findByEmail(email)
                .map(User::getTenantId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    private String stopsToString(List<String> stops) {
        if (stops == null || stops.isEmpty()) return "";
        return stops.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining(","));
    }

    public RouteDto toDto(Route r) {
        List<String> stops = (r.getStops() == null || r.getStops().isBlank())
                ? Collections.emptyList()
                : Arrays.asList(r.getStops().split(","));
        return RouteDto.builder()
                .id(r.getId())
                .name(r.getName())
                .stops(stops)
                .tenantId(r.getTenantId())
                .build();
    }
}
