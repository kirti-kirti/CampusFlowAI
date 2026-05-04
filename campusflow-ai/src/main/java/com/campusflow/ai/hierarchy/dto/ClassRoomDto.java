package com.campusflow.ai.hierarchy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class ClassRoomDto {

    @Data
    public static class Request {
        @NotBlank(message = "name is required")
        private String name;

        @NotNull(message = "departmentId is required")
        private Long departmentId;

        private String semester;
        // universityId and tenantId come from JWT
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private Long departmentId;
        private Long universityId;
        private String tenantId;
        private String semester;
    }
}
