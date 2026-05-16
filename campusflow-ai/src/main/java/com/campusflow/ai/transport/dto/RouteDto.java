package com.campusflow.ai.transport.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteDto {

    private Long id;

    @NotBlank(message = "Route name is required")
    private String name;

    /** List of stop names in order */
    private List<String> stops;

    private String tenantId;
}
