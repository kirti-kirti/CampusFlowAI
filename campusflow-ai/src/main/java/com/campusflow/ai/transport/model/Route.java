package com.campusflow.ai.transport.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "routes",
       indexes = @Index(name = "idx_route_tenant", columnList = "tenantId"))
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /** Comma-separated stop names e.g. "Sector-5,Main Gate,Sector-12" */
    @Column(length = 2000)
    private String stops;

    @Column(nullable = false)
    private String tenantId;
}
