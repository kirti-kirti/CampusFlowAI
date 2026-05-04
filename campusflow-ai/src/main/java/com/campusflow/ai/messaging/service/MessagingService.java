package com.campusflow.ai.messaging.service;

import com.campusflow.ai.messaging.dto.MessageResponse;
import com.campusflow.ai.messaging.dto.SendMessageRequest;
import com.campusflow.ai.messaging.model.Message;
import com.campusflow.ai.messaging.repository.MessageRepository;
import com.campusflow.ai.model.Role;
import com.campusflow.ai.model.User;
import com.campusflow.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Business logic for the Messaging module.
 *
 * Rules:
 *  - TEACHER can send to STUDENT or PARENT
 *  - ADMIN can send to anyone
 *  - STUDENT/PARENT can reply to TEACHER
 *  - Users cannot message themselves
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MessagingService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    // ─── Send Message ────────────────────────────────────────────────────────────

    /**
     * Sends a message from the authenticated user to a receiver.
     *
     * Validations:
     *  1. Receiver must exist
     *  2. Sender cannot message themselves
     *  3. Role-based rules:
     *     - TEACHER/ADMIN → can message anyone
     *     - STUDENT/PARENT → can only message TEACHER or ADMIN
     *
     * @param senderEmail  from JWT — cannot be spoofed
     * @param request      receiverId + message text
     */
    @Transactional
    public MessageResponse send(String senderEmail, SendMessageRequest request) {
        User sender = findByEmail(senderEmail);
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Receiver not found with ID: " + request.getReceiverId()));

        // Cannot message yourself
        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("You cannot send a message to yourself");
        }

        // Role-based restriction: STUDENT/PARENT can only message TEACHER or ADMIN
        if ((sender.getRole() == Role.STUDENT || sender.getRole() == Role.PARENT) &&
            (receiver.getRole() != Role.TEACHER && receiver.getRole() != Role.ADMIN)) {
            throw new IllegalArgumentException(
                    "Students and Parents can only message Teachers or Admins");
        }

        Message saved = messageRepository.save(Message.builder()
                .senderId(sender.getId())
                .receiverId(receiver.getId())
                .message(request.getMessage())
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build());

        log.info("Message sent: from {} (id={}) to {} (id={})",
                senderEmail, sender.getId(), receiver.getEmail(), receiver.getId());

        return toResponse(saved, sender, receiver);
    }

    // ─── Get Conversation ────────────────────────────────────────────────────────

    /**
     * Returns the full conversation between the authenticated user and another user.
     * Messages are ordered oldest → newest (chat style).
     * Also marks all unread messages from the other user as read.
     *
     * @param currentUserEmail  from JWT
     * @param otherUserId       the other participant's user ID
     */
    @Transactional
    public List<MessageResponse> getConversation(String currentUserEmail, Long otherUserId) {
        User currentUser = findByEmail(currentUserEmail);
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User not found with ID: " + otherUserId));

        // Mark messages from otherUser → currentUser as read
        List<Message> unread = messageRepository
                .findByReceiverIdOrderByTimestampDesc(currentUser.getId())
                .stream()
                .filter(m -> m.getSenderId().equals(otherUserId) && !m.getIsRead())
                .collect(Collectors.toList());

        unread.forEach(m -> m.setIsRead(true));
        if (!unread.isEmpty()) {
            messageRepository.saveAll(unread);
            log.info("Marked {} messages as read for user {}", unread.size(), currentUserEmail);
        }

        // Fetch full conversation
        return messageRepository
                .findConversation(currentUser.getId(), otherUserId)
                .stream()
                .map(m -> {
                    User s = m.getSenderId().equals(currentUser.getId()) ? currentUser : otherUser;
                    User r = m.getReceiverId().equals(currentUser.getId()) ? currentUser : otherUser;
                    return toResponse(m, s, r);
                })
                .collect(Collectors.toList());
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private MessageResponse toResponse(Message m, User sender, User receiver) {
        return MessageResponse.builder()
                .id(m.getId())
                .senderId(m.getSenderId())
                .senderName(sender.getName())
                .receiverId(m.getReceiverId())
                .receiverName(receiver.getName())
                .message(m.getMessage())
                .timestamp(m.getTimestamp())
                .isRead(m.getIsRead())
                .build();
    }
}
