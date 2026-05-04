package com.campusflow.ai.hierarchy.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class UniversityDto {

    @Data
    public static class Request {
        @NotBlank(message = "name is required")
        private String name;

        @NotBlank(message = "code is required (used as tenantId)")
        private String code;

        private String address;
        private String contactEmail;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String code;
        private String address;
        private String contactEmail;
    }
}
