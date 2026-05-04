package com.campusflow.ai.chat.repository;

import com.campusflow.ai.chat.model.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Data access for ChatHistory entity.
 */
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {

    /** Returns all chat history for a specific user, newest first */
    List<ChatHistory> findByUserIdOrderByTimestampDesc(Long userId);
}
