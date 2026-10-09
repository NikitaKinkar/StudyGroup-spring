package com.studygroup.studygroupfinder.controller;

import com.studygroup.studygroupfinder.model.ChatMessage;
import com.studygroup.studygroupfinder.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    private Long parseGroupId(Object rawGroupId) {
        if (rawGroupId == null) return null;
        String str = String.valueOf(rawGroupId).trim();
        try {
            return Long.parseLong(str);
        } catch (NumberFormatException e) {
            return (long) Math.abs(str.hashCode());
        }
    }

    @MessageMapping("/chat.sendMessage")
    public ChatMessage sendMessage(@Payload Map<String, Object> messagePayload, 
                                  SimpMessageHeaderAccessor headerAccessor) {
        try {
            Object rawGroupId = messagePayload.get("groupId");
            if (rawGroupId == null) rawGroupId = messagePayload.get("group_id");
            Long groupId = parseGroupId(rawGroupId);
            if (groupId == null) return null;

            String senderEmail = (String) messagePayload.getOrDefault("senderEmail", messagePayload.get("sender_email"));
            String senderName = (String) messagePayload.getOrDefault("senderName", messagePayload.get("sender_name"));
            String content = (String) messagePayload.getOrDefault("content", messagePayload.get("message"));
            String messageType = (String) messagePayload.getOrDefault("messageType", messagePayload.getOrDefault("type", "TEXT"));
            String fileUrl = (String) messagePayload.getOrDefault("fileUrl", messagePayload.get("file_url"));
            String fileName = (String) messagePayload.getOrDefault("fileName", messagePayload.get("file_name"));
            String fileType = (String) messagePayload.getOrDefault("fileType", messagePayload.get("file_type"));
            Long fileSize = null;
            if (messagePayload.get("fileSize") != null) {
                fileSize = Long.parseLong(String.valueOf(messagePayload.get("fileSize")));
            }

            return chatService.sendMessage(groupId, senderEmail, senderName, content, messageType, fileUrl, fileName, fileType, fileSize);
        } catch (Exception e) {
            System.err.println("Failed to send message: " + e.getMessage());
            return null;
        }
    }

    @MessageMapping("/chat.addUser")
    public ChatMessage addUser(@Payload Map<String, Object> messagePayload,
                              SimpMessageHeaderAccessor headerAccessor) {
        try {
            Object rawGroupId = messagePayload.get("groupId");
            if (rawGroupId == null) rawGroupId = messagePayload.get("group_id");
            Long groupId = parseGroupId(rawGroupId);
            if (groupId == null) return null;

            String senderName = (String) messagePayload.getOrDefault("senderName", messagePayload.get("sender_name"));
            if (senderName == null) senderName = "User";

            // Create a system message when user joins
            String content = senderName + " joined the chat";
            return chatService.sendMessage(groupId, "system", "System", content);
        } catch (Exception e) {
            System.err.println("Failed to add user: " + e.getMessage());
            return null;
        }
    }
}
