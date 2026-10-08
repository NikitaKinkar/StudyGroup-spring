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

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/group/{groupId}")
    public ChatMessage sendMessage(@Payload Map<String, String> messagePayload, 
                                  SimpMessageHeaderAccessor headerAccessor) {
        try {
            Long groupId = Long.parseLong(messagePayload.get("groupId"));
            String senderEmail = messagePayload.get("senderEmail");
            String senderName = messagePayload.get("senderName");
            String content = messagePayload.get("content");

            return chatService.sendMessage(groupId, senderEmail, senderName, content);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send message: " + e.getMessage());
        }
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/group/{groupId}")
    public ChatMessage addUser(@Payload Map<String, String> messagePayload,
                              SimpMessageHeaderAccessor headerAccessor) {
        try {
            Long groupId = Long.parseLong(messagePayload.get("groupId"));
            String senderName = messagePayload.get("senderName");

            // Create a system message when user joins
            String content = senderName + " joined the chat";
            return chatService.sendMessage(groupId, "system", "System", content);
        } catch (Exception e) {
            throw new RuntimeException("Failed to add user: " + e.getMessage());
        }
    }
}
