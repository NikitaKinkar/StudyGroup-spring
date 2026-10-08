package com.studygroup.studygroupfinder.controller;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.studygroup.studygroupfinder.model.ChatMessage;
import com.studygroup.studygroupfinder.service.ChatService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatRestController {

    private final ChatService chatService;
    private final Path uploadDir = Paths.get("uploads/chat").toAbsolutePath().normalize();

    public ChatRestController(ChatService chatService) {
        this.chatService = chatService;
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            System.err.println("Could not create upload directory: " + e.getMessage());
        }
    }

    @GetMapping("/history/{groupId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @PathVariable Long groupId,
            @RequestParam(required = false) String userEmail) {
        try {
            List<ChatMessage> messages = chatService.getChatHistory(groupId, userEmail);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            System.err.println("Error fetching chat history for group " + groupId + ": " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody ChatMessageRequest request) {
        try {
            ChatMessage message = chatService.sendMessage(
                    request.getGroupId(),
                    request.getSenderEmail(),
                    request.getSenderName(),
                    request.getContent(),
                    request.getMessageType(),
                    request.getFileUrl(),
                    request.getFileName(),
                    request.getFileType(),
                    request.getFileSize()
            );
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            System.err.println("Error sending chat message: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String cleanFilename = originalFilename != null ? Paths.get(originalFilename).getFileName().toString() : "file";
            String uniqueName = UUID.randomUUID().toString() + "_" + cleanFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
            Path targetLocation = uploadDir.resolve(uniqueName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "http://localhost:8080/api/chat/files/" + uniqueName;

            Map<String, Object> response = new HashMap<>();
            response.put("fileUrl", fileUrl);
            response.put("file_url", fileUrl);
            response.put("fileName", originalFilename);
            response.put("file_name", originalFilename);
            response.put("fileType", file.getContentType());
            response.put("file_type", file.getContentType());
            response.put("fileSize", file.getSize());
            response.put("file_size", file.getSize());

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to store file: " + e.getMessage()));
        }
    }

    @GetMapping("/files/{fileName:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) {
        try {
            Path filePath = uploadDir.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = null;
            try {
                contentType = Files.probeContentType(filePath);
            } catch (IOException ignored) {}

            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/count/{groupId}")
    public ResponseEntity<Long> getMessageCount(@PathVariable Long groupId) {
        try {
            Long count = chatService.getMessageCount(groupId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    public static class ChatMessageRequest {
        @JsonAlias({"groupId", "group_id"})
        private Long groupId;

        @JsonAlias({"senderEmail", "sender_email"})
        private String senderEmail;

        @JsonAlias({"senderName", "sender_name"})
        private String senderName;

        @JsonAlias({"content", "message"})
        private String content;

        @JsonAlias({"messageType", "message_type", "type"})
        private String messageType = "TEXT";

        @JsonAlias({"fileUrl", "file_url"})
        private String fileUrl;

        @JsonAlias({"fileName", "file_name"})
        private String fileName;

        @JsonAlias({"fileType", "file_type"})
        private String fileType;

        @JsonAlias({"fileSize", "file_size"})
        private Long fileSize;

        // Getters and Setters
        public Long getGroupId() { return groupId; }
        public void setGroupId(Long groupId) { this.groupId = groupId; }

        public String getSenderEmail() { return senderEmail; }
        public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }

        public String getContent() { return content != null ? content : ""; }
        public void setContent(String content) { this.content = content; }

        public String getMessageType() { return messageType; }
        public void setMessageType(String messageType) { this.messageType = messageType; }

        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }

        public String getFileType() { return fileType; }
        public void setFileType(String fileType) { this.fileType = fileType; }

        public Long getFileSize() { return fileSize; }
        public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    }
}
