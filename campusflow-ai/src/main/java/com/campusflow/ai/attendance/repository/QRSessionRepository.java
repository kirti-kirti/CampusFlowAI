package com.campusflow.ai.attendance.repository;

import com.campusflow.ai.attendance.model.QRSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Data access for QR sessions.
 */
public interface QRSessionRepository extends JpaRepository<QRSession, Long> {

    /** Look up a session by the UUID token embedded in the QR code */
    Optional<QRSession> findByQrCode(String qrCode);
}
