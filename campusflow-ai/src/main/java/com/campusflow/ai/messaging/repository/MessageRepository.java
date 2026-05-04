package com.campusflow.ai.messaging.repository;

import com.campusflow.ai.messaging.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Data access for Message entity.
 */
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Returns the full conversation between two users, ordered by timestamp.
     * Used by GET /api/messages/chat/{userId}
     *
     * Fetches messages where:
     *  - (sender = user1 AND receiver = user2) OR
     *  - (sender = user2 AND receiver = user1)
     */
    @Query("""
        SELECT m FROM Message m
        WHERE (m.senderId = :user1 AND m.receiverId = :user2)
           OR (m.senderId = :user2 AND m.receiverId = :user1)
        ORDER BY m.timestamp ASC
        """)
    List<Message> findConversation(@Param("user1") Long user1, @Param("user2") Long user2);

    /** Returns all messages sent by a specific user */
    List<Message> findBySenderIdOrderByTimestampDesc(Long senderId);

    /** Returns all messages received by a specific user */
    List<Message> findByReceiverIdOrderByTimestampDesc(Long receiverId);
}
