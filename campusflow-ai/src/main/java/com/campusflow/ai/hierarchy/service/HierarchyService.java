package com.campusflow.ai.hierarchy.service;

import com.campusflow.ai.hierarchy.dto.*;
import com.campusflow.ai.hierarchy.model.*;
import com.campusflow.ai.hierarchy.repository.*;
import com.campusflow.ai.model.Role;
import com.campusflow.ai.model.User;
import com.campusflow.ai.repository.UserRepository;
import com.campusflow.ai.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Manages the University → Department → Class → Subject hierarchy.
 *
 * Validation rules enforced:
 *  - Department must belong to the JWT university
 *  - ClassRoom must belong to the JWT department
 *  - Subject teacher must belong to the same department as the class
 *  - All operations are scoped by tenantId from TenantContext
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HierarchyService {

    private final UniversityRepository universityRepository;
    private final DepartmentRepository departmentRepository;
    private final ClassRoomRepository  classRoomRepository;
    private final SubjectRepository    subjectRepository;
    private final UserRepository       userRepository;

    // ─── University (SUPER_ADMIN only — or seed data) ────────────────────────────

    @Transactional
    public UniversityDto.Response createUniversity(UniversityDto.Request request) {
        University university = universityRepository.findByCode(request.getCode())
                .orElse(new University());
        
        university.setName(request.getName());
        university.setCode(request.getCode());
        university.setAddress(request.getAddress());
        university.setContactEmail(request.getContactEmail());
        
        University saved = universityRepository.save(university);
        log.info("University identity established: id={}, code={}", saved.getId(), saved.getCode());
        return toUniversityResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<UniversityDto.Response> getAllUniversities() {
        return universityRepository.findAll().stream()
                .map(this::toUniversityResponse).collect(Collectors.toList());
    }

    // ─── Department (ADMIN) ───────────────────────────────────────────────────────

    /**
     * Creates a department under the admin's university.
     * universityId and tenantId are resolved from JWT — not from request body.
     */
    @Transactional
    public DepartmentDto.Response createDepartment(DepartmentDto.Request request) {
        String tenantId = requireTenant();
        University university = universityRepository.findByCode(tenantId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "University not found for tenant: " + tenantId));

        Department saved = departmentRepository.save(Department.builder()
                .name(request.getName())
                .universityId(university.getId())
                .tenantId(tenantId)
                .description(request.getDescription())
                .build());

        log.info("[{}] Department created: id={}, name={}", tenantId, saved.getId(), saved.getName());
        return toDeptResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto.Response> getMyDepartments() {
        String tenantId = requireTenant();
        return departmentRepository.findByTenantId(tenantId).stream()
                .map(this::toDeptResponse).collect(Collectors.toList());
    }

    // ─── ClassRoom (ADMIN) ────────────────────────────────────────────────────────

    /**
     * Creates a class under a department.
     *
     * Validation:
     *  - departmentId must belong to the JWT university
     */
    @Transactional
    public ClassRoomDto.Response createClassRoom(ClassRoomDto.Request request) {
        String tenantId = requireTenant();
        University university = universityRepository.findByCode(tenantId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "University not found for tenant: " + tenantId));

        // Validate department belongs to this university
        Department dept = departmentRepository
                .findByIdAndUniversityId(request.getDepartmentId(), university.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Department " + request.getDepartmentId() +
                        " does not belong to your university"));

        ClassRoom saved = classRoomRepository.save(ClassRoom.builder()
                .name(request.getName())
                .departmentId(dept.getId())
                .universityId(university.getId())
                .tenantId(tenantId)
                .semester(request.getSemester())
                .build());

        log.info("[{}] ClassRoom created: id={}, name={}, dept={}",
                tenantId, saved.getId(), saved.getName(), dept.getId());
        return toClassResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ClassRoomDto.Response> getClassesByDepartment(Long departmentId) {
        String tenantId = requireTenant();
        return classRoomRepository.findByDepartmentIdAndTenantId(departmentId, tenantId)
                .stream().map(this::toClassResponse).collect(Collectors.toList());
    }

    // ─── Subject (ADMIN / TEACHER) ────────────────────────────────────────────────

    /**
     * Assigns a subject to a class with a teacher.
     *
     * Validation chain:
     *  1. ClassRoom must belong to JWT university
     *  2. Teacher must exist and belong to same university
     *  3. Teacher must belong to the same department as the class
     */
    @Transactional
    public SubjectDto.Response createSubject(SubjectDto.Request request) {
        String tenantId = requireTenant();

        // 1. Validate class belongs to this tenant
        ClassRoom classRoom = classRoomRepository.findByIdAndTenantId(
                request.getClassRoomId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "ClassRoom " + request.getClassRoomId() +
                        " not found in your university"));

        // 2. Validate teacher exists in same tenant
        User teacher = userRepository.findByIdAndTenantId(request.getTeacherId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Teacher " + request.getTeacherId() +
                        " not found in your university"));

        if (teacher.getRole() != Role.TEACHER) {
            throw new IllegalArgumentException(
                    "User " + request.getTeacherId() + " is not a TEACHER");
        }

        // 3. Teacher must belong to the same department as the class
        if (teacher.getDepartmentId() == null ||
                !teacher.getDepartmentId().equals(classRoom.getDepartmentId())) {
            throw new IllegalArgumentException(
                    "Teacher does not belong to the same department as the class. " +
                    "Teacher dept: " + teacher.getDepartmentId() +
                    ", Class dept: " + classRoom.getDepartmentId());
        }

        Subject saved = subjectRepository.save(Subject.builder()
                .name(request.getName())
                .classRoomId(classRoom.getId())
                .teacherId(teacher.getId())
                .departmentId(classRoom.getDepartmentId())
                .universityId(classRoom.getUniversityId())
                .tenantId(tenantId)
                .build());

        log.info("[{}] Subject '{}' created for class {} by teacher {}",
                tenantId, saved.getName(), classRoom.getId(), teacher.getId());
        return toSubjectResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SubjectDto.Response> getSubjectsByClass(Long classRoomId) {
        String tenantId = requireTenant();
        return subjectRepository.findByClassRoomIdAndTenantId(classRoomId, tenantId)
                .stream().map(this::toSubjectResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubjectDto.Response> getMySubjects(String teacherEmail) {
        String tenantId = requireTenant();
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
        return subjectRepository.findByTeacherIdAndTenantId(teacher.getId(), tenantId)
                .stream().map(this::toSubjectResponse).collect(Collectors.toList());
    }

    // ─── Validation Helpers (used by other services) ─────────────────────────────

    /**
     * Validates that a student belongs to the given class within the tenant.
     * Called by AttendanceService before marking attendance.
     */
    public void validateStudentBelongsToClass(Long studentId, Long classRoomId, String tenantId) {
        boolean valid = userRepository.existsByIdAndClassRoomIdAndTenantId(
                studentId, classRoomId, tenantId);
        if (!valid) {
            throw new IllegalArgumentException(
                    "Student " + studentId + " does not belong to class " + classRoomId);
        }
    }

    /**
     * Validates that a class belongs to a department within the tenant.
     * Called by AttendanceService when creating a session.
     */
    public void validateClassBelongsToDepartment(Long classRoomId, Long departmentId, String tenantId) {
        boolean valid = classRoomRepository.existsByIdAndDepartmentIdAndTenantId(
                classRoomId, departmentId, tenantId);
        if (!valid) {
            throw new IllegalArgumentException(
                    "Class " + classRoomId + " does not belong to department " + departmentId);
        }
    }

    /**
     * Validates that a department belongs to the tenant's university.
     */
    public void validateDepartmentBelongsToTenant(Long departmentId, String tenantId) {
        departmentRepository.findByIdAndTenantId(departmentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Department " + departmentId + " does not belong to your university"));
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────────

    private String requireTenant() {
        String tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null || tenantId.isBlank()) {
            throw new IllegalStateException("Tenant context not set");
        }
        return tenantId;
    }

    private UniversityDto.Response toUniversityResponse(University u) {
        return UniversityDto.Response.builder()
                .id(u.getId()).name(u.getName()).code(u.getCode())
                .address(u.getAddress()).contactEmail(u.getContactEmail()).build();
    }

    private DepartmentDto.Response toDeptResponse(Department d) {
        return DepartmentDto.Response.builder()
                .id(d.getId()).name(d.getName()).universityId(d.getUniversityId())
                .tenantId(d.getTenantId()).description(d.getDescription()).build();
    }

    private ClassRoomDto.Response toClassResponse(ClassRoom c) {
        return ClassRoomDto.Response.builder()
                .id(c.getId()).name(c.getName()).departmentId(c.getDepartmentId())
                .universityId(c.getUniversityId()).tenantId(c.getTenantId())
                .semester(c.getSemester()).build();
    }

    private SubjectDto.Response toSubjectResponse(Subject s) {
        String className = classRoomRepository.findById(s.getClassRoomId())
                .map(ClassRoom::getName)
                .orElse("Unknown Class");

        return SubjectDto.Response.builder()
                .id(s.getId()).name(s.getName()).classRoomId(s.getClassRoomId())
                .classRoomName(className)
                .teacherId(s.getTeacherId()).departmentId(s.getDepartmentId())
                .universityId(s.getUniversityId()).tenantId(s.getTenantId()).build();
    }
}
