package com.campusflow.ai.hierarchy.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class DepartmentDto {

    @Data
    public static class Request {
        @NotBlank(message = "name is required")
        private String name;

        private String description;
        // universityId and tenantId come from JWT — not from request body
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private Long universityId;
        private String tenantId;
        private String description;
    }
}
