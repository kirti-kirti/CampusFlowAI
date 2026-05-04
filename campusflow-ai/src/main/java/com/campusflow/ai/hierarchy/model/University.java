package com.campusflow.ai.hierarchy.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Top of the hierarchy: University → Department → Class → User
 *
 * The university's `code` field maps to User.tenantId and JWT tenantId claim.
 * This is the multi-tenant root — all data is scoped under a university.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "universities",
       uniqueConstraints = @UniqueConstraint(name = "uk_university_code", columnNames = "code"))
public class University {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /**
     * Short unique code used as tenantId in JWT and User.tenantId.
     * Example: "MIT", "IIT-BOM", "COLLEGE-001"
     */
    @Column(nullable = false, unique = true)
    private String code;

    @Column
    private String address;

    @Column
    private String contactEmail;
}
