package com.campusflow.ai.transport.repository;

import com.campusflow.ai.transport.model.BusLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Data access for BusLocation entity.
 */
public interface BusLocationRepository extends JpaRepository<BusLocation, Long> {

    /**
     * Returns the most recent location ping for a given bus.
     * Used by GET /api/transport/location/{busId}
     *
     * Orders by timestamp DESC and takes the first result.
     */
    @Query("SELECT bl FROM BusLocation bl WHERE bl.busId = :busId ORDER BY bl.timestamp DESC LIMIT 1")
    Optional<BusLocation> findLatestByBusId(@Param("busId") String busId);

    @Query("SELECT bl FROM BusLocation bl WHERE bl.busId = :busId ORDER BY bl.timestamp DESC LIMIT 50")
    List<BusLocation> findRecentByBusId(@Param("busId") String busId);
}
