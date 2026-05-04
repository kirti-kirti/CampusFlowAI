package com.campusflow.ai.timetable.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Request body for creating or updating a timetable slot.
 * Used by ADMIN on POST /api/timetable/create and PUT /api/timetable/update/{id}
 *
 * Sample JSON:
 * {
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
public class TimetableRequest {

    @NotBlank(message = "classId is required")
    private String classId;

    @NotBlank(message = "subject is required")
    private String subject;

    @NotBlank(message = "teacherId is required")
    private String teacherId;

    @NotBlank(message = "teacherName is required")
    private String teacherName;

    /**
     * Must be a valid uppercase day name.
     * Accepted: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
     */
    @NotBlank(message = "dayOfWeek is required")
    @Pattern(
        regexp = "MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY",
        message = "dayOfWeek must be one of: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY"
    )
    private String dayOfWeek;

    /** 24-hour format HH:mm */
    @NotBlank(message = "startTime is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "startTime must be in HH:mm format")
    private String startTime;

    /** 24-hour format HH:mm */
    @NotBlank(message = "endTime is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "endTime must be in HH:mm format")
    private String endTime;
}
