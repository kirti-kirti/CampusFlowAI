package com.campusflow.ai.attendance.dto;

import com.campusflow.ai.attendance.model.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {

    private Long id;
    private String collegeId;
    private Long studentId;
    private Long sessionId;
    private Long classRoomId;
    private Long departmentId;
    private String subject;
    private AttendanceStatus status;
    private LocalDateTime timestamp;
}
