package com.campusflow.ai.transport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BusCheckInRequest {

    @NotNull(message = "studentId is required")
    private Long studentId;

    @NotBlank(message = "busId is required")
    private String busId;
}
