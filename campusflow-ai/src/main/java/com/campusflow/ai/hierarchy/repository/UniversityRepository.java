package com.campusflow.ai.hierarchy.repository;

import com.campusflow.ai.hierarchy.model.University;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UniversityRepository extends JpaRepository<University, Long> {
    Optional<University> findByCode(String code);
    boolean existsByCode(String code);
}
