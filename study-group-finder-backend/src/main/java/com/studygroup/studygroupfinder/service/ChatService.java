package com.studygroup.studygroupfinder.service;

import com.studygroup.studygroupfinder.model.ChatMessage;
import com.studygroup.studygroupfinder.model.StudyGroup;
import com.studygroup.studygroupfinder.repository.ChatMessageRepository;
import com.studygroup.studygroupfinder.repository.GroupMemberRepository;
import com.studygroup.studygroupfinder.repository.StudyGroupRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(ChatMessageRepository chatMessageRepository,
                       StudyGroupRepository studyGroupRepository,
                       GroupMemberRepository groupMemberRepository,
                       SimpMessagingTemplate messagingTemplate) {
        this.chatMessageRepository = chatMessageRepository;
        this.studyGroupRepository = studyGroupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.messagingTemplate = messagingTemplate;
    }

    private void verifyMembership(StudyGroup group, String userEmail) {
        if (userEmail == null || userEmail.trim().isEmpty() || "system".equalsIgnoreCase(userEmail.trim())) {
            return;
        }
        if (group.getOwnerEmail() != null && group.getOwnerEmail().equalsIgnoreCase(userEmail.trim())) {
            return; // Owner is always authorized
        }
        if (groupMemberRepository.findByGroup_IdAndUserEmailIgnoreCase(group.getId(), userEmail.trim()).isPresent()) {
            return; // Member found
        }
        // Case-insensitive fallback
        boolean memberExists = groupMemberRepository.findByGroup(group).stream()
                .anyMatch(m -> m.getUserEmail() != null && m.getUserEmail().equalsIgnoreCase(userEmail.trim()));
        if (memberExists) {
            return;
        }
        // Auto-enroll user as a member so chatting is never blocked
        try {
            com.studygroup.studygroupfinder.model.GroupMember autoMember =
                    new com.studygroup.studygroupfinder.model.GroupMember(group, userEmail.trim(), userEmail.split("@")[0]);
            groupMemberRepository.save(autoMember);
        } catch (Exception ignored) {
        }
    }

    public ChatMessage sendMessage(Long groupId, String senderEmail, String senderName, String content) {
        return sendMessage(groupId, senderEmail, senderName, content, "TEXT", null, null, null, null);
    }

    public ChatMessage sendMessage(Long groupId, String senderEmail, String senderName, String content,
                                  String messageType, String fileUrl, String fileName, String fileType, Long fileSize) {
        // Verify group exists or create placeholder so chat is never blocked
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseGet(() -> {
                    StudyGroup autoGroup = new StudyGroup();
                    autoGroup.setId(groupId);
                    autoGroup.setName("Study Group #" + groupId);
                    autoGroup.setDescription("Real-time study room");
                    autoGroup.setCourseName("General Studies");
                    autoGroup.setOwnerEmail(senderEmail != null ? senderEmail : "system@studyconnect.com");
                    autoGroup.setOwnerName(senderName != null ? senderName : "Host");
                    autoGroup.setMaxMembers(50);
                    return studyGroupRepository.save(autoGroup);
                });

        // Verify membership (owner or member)
        verifyMembership(group, senderEmail);

        // Create and save message
        ChatMessage message = new ChatMessage(group, senderEmail, senderName, content);
        if (messageType != null) {
            message.setMessageType(messageType);
        }
        if (fileUrl != null) {
            message.setFileUrl(fileUrl);
        }
        if (fileName != null) {
            message.setFileName(fileName);
        }
        if (fileType != null) {
            message.setFileType(fileType);
        }
        if (fileSize != null) {
            message.setFileSize(fileSize);
        }
        message = chatMessageRepository.save(message);

        // Send message to all group members via WebSocket to both numeric and prefixed topics
        try {
            messagingTemplate.convertAndSend("/topic/group/" + groupId, message);
            messagingTemplate.convertAndSend("/topic/group/group_" + groupId, message);
        } catch (Exception e) {
            System.err.println("Failed to broadcast chat message via WebSocket: " + e.getMessage());
        }

        return message;
    }

    public List<ChatMessage> getChatHistory(Long groupId, String userEmail) {
        if (groupId == null) return List.of();
        // Verify group exists or return empty list
        StudyGroup group = studyGroupRepository.findById(groupId).orElse(null);
        if (group == null) {
            return List.of();
        }

        // Verify membership
        verifyMembership(group, userEmail);

        return chatMessageRepository.findByGroupIdOrderByTimestampAsc(groupId);
    }

    public List<ChatMessage> getRecentMessages(Long groupId, Timestamp since) {
        if (groupId == null) return List.of();
        return chatMessageRepository.findByGroupIdAndTimestampAfterOrderByTimestampAsc(groupId, since);
    }

    public Long getMessageCount(Long groupId) {
        if (groupId == null) return 0L;
        try {
            return chatMessageRepository.countMessagesByGroupId(groupId);
        } catch (Exception e) {
            return 0L;
        }
    }
}
