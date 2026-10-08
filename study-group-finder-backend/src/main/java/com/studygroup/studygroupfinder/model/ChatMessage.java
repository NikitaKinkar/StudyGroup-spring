package com.studygroup.studygroupfinder.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    @Column(name = "sender_email", nullable = false)
    private String senderEmail;

    @Column(name = "sender_name", nullable = false)
    private String senderName;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "timestamp", nullable = false)
    private Timestamp timestamp;

    @Column(name = "message_type", nullable = false)
    private String messageType = "TEXT"; // TEXT, IMAGE, FILE, etc.

    @Column(name = "file_url", columnDefinition = "TEXT")
    private String fileUrl;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_size")
    private Long fileSize;

    public ChatMessage() {
        this.timestamp = new Timestamp(System.currentTimeMillis());
        this.messageType = "TEXT";
    }

    public ChatMessage(StudyGroup group, String senderEmail, String senderName, String content) {
        this();
        this.group = group;
        this.senderEmail = senderEmail;
        this.senderName = senderName;
        this.content = content != null ? content : "";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public StudyGroup getGroup() { return group; }
    public void setGroup(StudyGroup group) { this.group = group; }

    @JsonProperty("groupId")
    public Long getGroupId() {
        return group != null ? group.getId() : null;
    }

    @JsonProperty("group_id")
    public Long getGroupIdSnake() {
        return group != null ? group.getId() : null;
    }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    @JsonProperty("sender_email")
    public String getSenderEmailSnake() { return senderEmail; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    @JsonProperty("sender_name")
    public String getSenderNameSnake() { return senderName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    @JsonProperty("message")
    public String getMessage() { return content; }

    public Timestamp getTimestamp() { return timestamp; }
    public void setTimestamp(Timestamp timestamp) { this.timestamp = timestamp; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    @JsonProperty("type")
    public String getType() { return messageType != null ? messageType.toLowerCase() : "text"; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    @JsonProperty("file_url")
    public String getFileUrlSnake() { return fileUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    @JsonProperty("file_name")
    public String getFileNameSnake() { return fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    @JsonProperty("file_type")
    public String getFileTypeSnake() { return fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    @JsonProperty("file_size")
    public Long getFileSizeSnake() { return fileSize; }
}
