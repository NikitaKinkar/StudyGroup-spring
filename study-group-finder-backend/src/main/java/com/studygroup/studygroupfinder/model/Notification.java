package com.studygroup.studygroupfinder.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(name = "sender_email")
    private String senderEmail;

    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private StudyGroup group;

    @Column(name = "group_name")
    private String groupName;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private StudySession session;

    @Column(name = "session_id", insertable = false, updatable = false)
    private Long sessionId;

    @Column(name = "session_title")
    private String sessionTitle;

    @Column(name = "created_at")
    private Timestamp createdAt;

    public enum NotificationType {
        GROUP_JOIN_REQUEST,
        GROUP_JOIN_ACCEPTED,
        GROUP_JOIN_REJECTED,
        CHAT_MESSAGE,
        SESSION_SCHEDULED,
        SESSION_REMINDER,
        SESSION_UPDATED,
        SESSION_CANCELLED
    }

    // Constructors
    public Notification() {
        this.createdAt = new Timestamp(System.currentTimeMillis());
        this.isRead = false;
    }

    public Notification(NotificationType type, String senderEmail, String recipientEmail, String message) {
        this();
        this.type = type;
        this.senderEmail = senderEmail;
        this.recipientEmail = recipientEmail;
        this.message = message;
    }

    public Notification(NotificationType type, String senderEmail, String recipientEmail, StudyGroup group, String message) {
        this(type, senderEmail, recipientEmail, message);
        this.group = group;
        this.groupName = group != null ? group.getName() : null;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }
    public String getSender_email() { return senderEmail; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    public String getRecipient_email() { return recipientEmail; }

    public StudyGroup getGroup() { return group; }
    public void setGroup(StudyGroup group) { this.group = group; }
    public Long getGroupId() { return group != null ? group.getId() : null; }
    public Long getGroup_id() { return getGroupId(); }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }
    public String getGroup_name() { return groupName; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public Boolean getRead() { return isRead; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
    public Timestamp getCreated_at() { return createdAt; }

    public StudySession getSession() { return session; }
    public void setSession(StudySession session) { 
        this.session = session;
        this.sessionId = session != null ? session.getId() : null;
        this.sessionTitle = session != null ? session.getTitle() : null;
    }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public String getSessionTitle() { return sessionTitle; }
    public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }
}
