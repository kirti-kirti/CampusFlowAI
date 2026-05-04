package com.campusflow.ai.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceReportResponse {

    private String collegeId;
    private Long studentId;
    private Long classRoomId;
    private long totalSessions;
    private long present;
    private long late;
    private long absent;
    private long attendedSessions;
    private double percentage;
    private List<SubjectBreakdown> subjectBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectBreakdown {
        private String subject;
        private long total;
        private long attended;
        private double percentage;
    }
}
