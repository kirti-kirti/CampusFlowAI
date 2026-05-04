package com.campusflow.ai.transport.dto;

import com.campusflow.ai.transport.model.BusStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentInBusResponse {

    private Long studentId;
    private String studentName;
    private String email;
    private BusStatus status;
    private LocalDateTime checkedInAt;
    private LocalDateTime checkedOutAt;
}
