package com.campusflow.ai.timetable.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Read model returned for all timetable view APIs.
 * Used by ADMIN, TEACHER, STUDENT, and PARENT.
 *
 * Sample JSON:
 * {
 *   "id":          1,
 *   "classId":     "CLASS-10A",
 *   "subject":     "Mathematics",
 *   "teacherId":   "3",
 *   "teacherName": "Mr. John",
 *   "dayOfWeek":   "MONDAY",
 *   "startTime":   "09:00",
 *   "endTime":     "10:00"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableResponse {

    private Long id;
    private String classId;
    private String subject;
    private String teacherId;
    private String teacherName;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
}
