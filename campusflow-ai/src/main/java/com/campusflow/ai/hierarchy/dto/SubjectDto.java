package com.campusflow.ai.hierarchy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class SubjectDto {

    @Data
    public static class Request {
        @NotBlank(message = "name is required")
        private String name;

        @NotNull(message = "classRoomId is required")
        private Long classRoomId;

        @NotNull(message = "teacherId is required")
        private Long teacherId;
        // departmentId, universityId, tenantId resolved from JWT + classRoom
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private Long classRoomId;
        private String classRoomName;
        private Long teacherId;
        private Long departmentId;
        private Long universityId;
        private String tenantId;
    }
}
