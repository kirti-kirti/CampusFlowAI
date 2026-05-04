package com.campusflow.ai.timetable.service;

import com.campusflow.ai.model.User;
import com.campusflow.ai.repository.UserRepository;
import com.campusflow.ai.timetable.dto.TimetableRequest;
import com.campusflow.ai.timetable.dto.TimetableResponse;
import com.campusflow.ai.timetable.model.Timetable;
import com.campusflow.ai.timetable.repository.TimetableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Business logic for the Timetable module.
 *
 * Key design: All role-based queries resolve user identity from JWT email.
 * No IDs are passed manually from the frontend.
 *
 * - ADMIN   → create / update / delete slots
 * - TEACHER → getByTeacherEmail(email) → resolves teacherId from DB
 * - STUDENT → getByClass(classId)
 * - PARENT  → getByParentEmail(email) → resolves linked studentId → classId
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    // ─── ADMIN: Create ───────────────────────────────────────────────────────────

    @Transactional
    public TimetableResponse create(TimetableRequest request) {
        validateTimeOrder(request.getStartTime(), request.getEndTime());
        checkConflict(null, request);
        Timetable saved = timetableRepository.save(toEntity(request));
        log.info("Timetable created: id={}, class={}, subject={}, day={}",
                saved.getId(), saved.getClassId(), saved.getSubject(), saved.getDayOfWeek());
        return toResponse(saved);
    }

    // ─── ADMIN: Update ───────────────────────────────────────────────────────────

    @Transactional
    public TimetableResponse update(Long id, TimetableRequest request) {
        Timetable existing = findById(id);
        validateTimeOrder(request.getStartTime(), request.getEndTime());
        checkConflict(id, request);

        existing.setClassId(request.getClassId());
        existing.setSubject(request.getSubject());
        existing.setTeacherId(request.getTeacherId());
        existing.setTeacherName(request.getTeacherName());
        existing.setDayOfWeek(request.getDayOfWeek());
        existing.setStartTime(request.getStartTime());
        existing.setEndTime(request.getEndTime());

        Timetable saved = timetableRepository.save(existing);
        log.info("Timetable updated: id={}", id);
        return toResponse(saved);
    }

    // ─── ADMIN: Delete ───────────────────────────────────────────────────────────

    @Transactional
    public void delete(Long id) {
        findById(id);
        timetableRepository.deleteById(id);
        log.info("Timetable deleted: id={}", id);
    }

    // ─── TEACHER: View own timetable (JWT-based) ─────────────────────────────────

    /**
     * Resolves the teacher's user ID from their JWT email,
     * then returns all timetable slots where teacherId matches.
     *
     * Flow: JWT email → User.id → timetable rows where teacherId = User.id
     *
     * @param teacherEmail  email extracted from JWT by JwtFilter
     */
    @Transactional(readOnly = true)
    public List<TimetableResponse> getByTeacherEmail(String teacherEmail) {
        User teacher = findUserByEmail(teacherEmail);
        String teacherId = String.valueOf(teacher.getId());

        List<Timetable> slots = timetableRepository.findByTeacherId(teacherId);
        return slots.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ─── STUDENT: View class timetable ───────────────────────────────────────────

    /**
     * Returns the full weekly timetable for a given classId.
     * classId is passed as a path variable by the student.
     */
    @Transactional(readOnly = true)
    public List<TimetableResponse> getByClass(String classId) {
        List<Timetable> slots = timetableRepository.findByClassId(classId);
        return slots.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ─── PARENT: View child's timetable (JWT-based) ───────────────────────────────

    /**
     * Resolves the parent from JWT email, reads their linked studentId,
     * then fetches the student's classId and returns the timetable.
     *
     * Flow: JWT email → Parent.studentId → Student.studentId (classId) → timetable rows
     *
     * Prerequisites:
     *  - Parent must have studentId set (done at registration)
     *  - Student's studentId field must contain their classId (e.g. "CLASS-10A")
     *
     * @param parentEmail  email extracted from JWT by JwtFilter
     */
    @Transactional(readOnly = true)
    public List<TimetableResponse> getByParentEmail(String parentEmail) {
        // 1. Resolve parent from JWT
        User parent = findUserByEmail(parentEmail);

        // 2. Parent must have a linked student
        if (parent.getStudentId() == null || parent.getStudentId().isBlank()) {
            throw new IllegalArgumentException(
                    "No student linked to this parent account. Contact admin.");
        }

        // 3. Resolve the student by ID
        Long studentId;
        try {
            studentId = Long.parseLong(parent.getStudentId());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                    "Invalid studentId linked to parent account: " + parent.getStudentId());
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Linked student not found with ID: " + studentId));

        // 4. Student's classId is stored in their studentId field
        //    e.g. student.studentId = "CLASS-10A"
        String classId = student.getStudentId();
        if (classId == null || classId.isBlank()) {
            throw new IllegalArgumentException(
                    "Student has no class assigned. Contact admin.");
        }

        log.info("Parent {} fetching timetable for student {} (class: {})",
                parentEmail, studentId, classId);

        return getByClass(classId);
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────────

    private Timetable findById(Long id) {
        return timetableRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Timetable slot not found with ID: " + id));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User not found: " + email));
    }

    private void validateTimeOrder(String startTime, String endTime) {
        LocalTime start = LocalTime.parse(startTime, TIME_FMT);
        LocalTime end = LocalTime.parse(endTime, TIME_FMT);
        if (!start.isBefore(end)) {
            throw new IllegalArgumentException(
                    "startTime (" + startTime + ") must be before endTime (" + endTime + ")");
        }
    }

    private void checkConflict(Long excludeId, TimetableRequest request) {
        LocalTime newStart = LocalTime.parse(request.getStartTime(), TIME_FMT);
        LocalTime newEnd = LocalTime.parse(request.getEndTime(), TIME_FMT);

        List<Timetable> existing = timetableRepository
                .findByClassIdAndDayOfWeek(request.getClassId(), request.getDayOfWeek());

        for (Timetable slot : existing) {
            if (excludeId != null && slot.getId().equals(excludeId)) continue;

            LocalTime existStart = LocalTime.parse(slot.getStartTime(), TIME_FMT);
            LocalTime existEnd = LocalTime.parse(slot.getEndTime(), TIME_FMT);

            if (newStart.isBefore(existEnd) && existStart.isBefore(newEnd)) {
                throw new IllegalStateException(String.format(
                        "Scheduling conflict: %s already has '%s' from %s to %s on %s",
                        request.getClassId(), slot.getSubject(),
                        slot.getStartTime(), slot.getEndTime(), slot.getDayOfWeek()));
            }
        }
    }

    private Timetable toEntity(TimetableRequest req) {
        return Timetable.builder()
                .classId(req.getClassId())
                .subject(req.getSubject())
                .teacherId(req.getTeacherId())
                .teacherName(req.getTeacherName())
                .dayOfWeek(req.getDayOfWeek())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .build();
    }

    private TimetableResponse toResponse(Timetable t) {
        return TimetableResponse.builder()
                .id(t.getId())
                .classId(t.getClassId())
                .subject(t.getSubject())
                .teacherId(t.getTeacherId())
                .teacherName(t.getTeacherName())
                .dayOfWeek(t.getDayOfWeek())
                .startTime(t.getStartTime())
                .endTime(t.getEndTime())
                .build();
    }
}
