package com.campusflow.ai.config;

import com.campusflow.ai.hierarchy.model.*;
import com.campusflow.ai.hierarchy.repository.*;
import com.campusflow.ai.model.Role;
import com.campusflow.ai.model.User;
import com.campusflow.ai.repository.UserRepository;
import com.campusflow.ai.transport.model.Bus;
import com.campusflow.ai.transport.model.BusLocation;
import com.campusflow.ai.transport.repository.BusLocationRepository;
import com.campusflow.ai.transport.repository.BusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UniversityRepository universityRepository;
    private final DepartmentRepository departmentRepository;
    private final ClassRoomRepository classRoomRepository;
    private final SubjectRepository subjectRepository;
    private final BusRepository busRepository;
    private final BusLocationRepository busLocationRepository;

    @Override
    public void run(String... args) throws Exception {
        // ─── Hierarchy Setup ───
        
        // 1. Create University
        University uni = universityRepository.findByCode("INST001")
                .orElseGet(() -> universityRepository.save(University.builder()
                        .name("Campus Flow University")
                        .code("INST001")
                        .address("Main Campus, City")
                        .contactEmail("info@campusflow.ai")
                        .build()));

        // 2. Create Department
        Department dept = departmentRepository.findByTenantId("INST001").stream().findFirst()
                .orElseGet(() -> departmentRepository.save(Department.builder()
                        .name("Computer Science")
                        .universityId(uni.getId())
                        .tenantId("INST001")
                        .description("CSE Dept")
                        .build()));

        // 3. Create ClassRoom
        ClassRoom classRoom = classRoomRepository.findByDepartmentIdAndTenantId(dept.getId(), "INST001").stream().findFirst()
                .orElseGet(() -> classRoomRepository.save(ClassRoom.builder()
                        .name("CSE-3A")
                        .departmentId(dept.getId())
                        .universityId(uni.getId())
                        .tenantId("INST001")
                        .semester("Semester 5")
                        .build()));

        // Create Admin
        if (!userRepository.existsByEmail("admin@campusflow.ai")) {
            User admin = User.builder()
                    .name("System Administrator")
                    .email("admin@campusflow.ai")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .tenantId("INST001")
                    .universityId(uni.getId())
                    .build();
            userRepository.save(admin);
        }

        // Create Teacher
        User teacher;
        if (!userRepository.existsByEmail("teacher@campusflow.ai")) {
            teacher = User.builder()
                    .name("Dr. Smith")
                    .email("teacher@campusflow.ai")
                    .password(passwordEncoder.encode("teacher123"))
                    .role(Role.TEACHER)
                    .tenantId("INST001")
                    .universityId(uni.getId())
                    .departmentId(dept.getId())
                    .build();
            userRepository.save(teacher);
        } else {
            teacher = userRepository.findByEmail("teacher@campusflow.ai").get();
        }

        // Create Student
        if (!userRepository.existsByEmail("student@campusflow.ai")) {
            User student = User.builder()
                    .name("John Doe")
                    .email("student@campusflow.ai")
                    .password(passwordEncoder.encode("student123"))
                    .role(Role.STUDENT)
                    .tenantId("INST001")
                    .universityId(uni.getId())
                    .departmentId(dept.getId())
                    .classRoomId(classRoom.getId())
                    .build();
            userRepository.save(student);
        }

        // Create Student (Deepansh)
        if (!userRepository.existsByEmail("deepansh@campusflow.ai")) {
            User deepansh = User.builder()
                    .name("Deepansh")
                    .email("deepansh@campusflow.ai")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.STUDENT)
                    .tenantId("INST001")
                    .universityId(uni.getId())
                    .departmentId(dept.getId())
                    .classRoomId(classRoom.getId())
                    .build();
            userRepository.save(deepansh);
        }

        // 4. Create Subject (assigned to teacher)
        if (subjectRepository.findByTeacherIdAndTenantId(teacher.getId(), "INST001").isEmpty()) {
            subjectRepository.save(Subject.builder()
                    .name("Database Management Systems")
                    .classRoomId(classRoom.getId())
                    .teacherId(teacher.getId())
                    .departmentId(dept.getId())
                    .universityId(uni.getId())
                    .tenantId("INST001")
                    .build());
        }

        // 5. Create Bus & Location
        if (!busRepository.existsByBusId("BUS-01")) {
            busRepository.save(Bus.builder()
                    .busId("BUS-01")
                    .busNumber("KA-01-CF-1234")
                    .driverName("Michael Scott")
                    .driverId("DRV-101")
                    .routeName("North Campus Route")
                    .assignedClass("INST001")
                    .build());

            busLocationRepository.save(BusLocation.builder()
                    .busId("BUS-01")
                    .latitude(28.6139)
                    .longitude(77.2090)
                    .timestamp(java.time.LocalDateTime.now())
                    .build());
        }
    }
}
