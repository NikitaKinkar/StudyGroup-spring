package com.studygroup.studygroupfinder.dto;

import com.studygroup.studygroupfinder.model.StudySession;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class StudySessionDto {
    
    private Long id;

    @NotNull(message = "Group ID is required")
    private Long groupId;

    private String groupName;

    @NotNull(message = "Creator email is required")
    @Email(message = "Invalid email format")
    private String creatorEmail;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Session date is required")
    @Future(message = "Session date must be in the future")
    private LocalDateTime sessionDate;

    @NotBlank(message = "Session time is required")
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Time must be in HH:MM format")
    private String sessionTime;

    @NotNull(message = "Duration is required")
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    @Max(value = 480, message = "Duration must not exceed 480 minutes")
    private Integer duration;

    @NotNull(message = "Meeting type is required")
    private StudySession.MeetingType meetingType;

    private String location;

    private String meetingLink;

    @NotNull(message = "Notify members preference is required")
    private Boolean notifyMembers = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Dynamic status fields
    private StudySession.SessionStatus sessionStatus;
    private String formattedStatus;
    private boolean canJoin;
    private LocalDateTime sessionEndTime;

    // Constructors
    public StudySessionDto() {}

    public StudySessionDto(StudySession session) {
        this.id = session.getId();
        this.groupId = session.getGroup() != null ? session.getGroup().getId() : null;
        this.groupName = session.getGroupName();
        this.creatorEmail = session.getCreatorEmail();
        this.title = session.getTitle();
        this.description = session.getDescription();
        this.sessionDate = session.getSessionDate();
        this.sessionTime = session.getSessionTime();
        this.duration = session.getDuration();
        this.meetingType = session.getMeetingType();
        this.location = session.getLocation();
        this.meetingLink = session.getMeetingLink();
        this.notifyMembers = session.getNotifyMembers();
        this.createdAt = session.getCreatedAt();
        this.updatedAt = session.getUpdatedAt();
        
        // Set dynamic status fields
        this.sessionStatus = session.getSessionStatus();
        this.formattedStatus = session.getFormattedStatus();
        this.canJoin = session.canJoin();
        this.sessionEndTime = session.getSessionEndTime();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public String getCreatorEmail() { return creatorEmail; }
    public void setCreatorEmail(String creatorEmail) { this.creatorEmail = creatorEmail; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDateTime sessionDate) { this.sessionDate = sessionDate; }

    public String getSessionTime() { return sessionTime; }
    public void setSessionTime(String sessionTime) { this.sessionTime = sessionTime; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public StudySession.MeetingType getMeetingType() { return meetingType; }
    public void setMeetingType(StudySession.MeetingType meetingType) { this.meetingType = meetingType; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public Boolean getNotifyMembers() { return notifyMembers; }
    public void setNotifyMembers(Boolean notifyMembers) { this.notifyMembers = notifyMembers; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public StudySession.SessionStatus getSessionStatus() { return sessionStatus; }
    public void setSessionStatus(StudySession.SessionStatus sessionStatus) { this.sessionStatus = sessionStatus; }

    public String getFormattedStatus() { return formattedStatus; }
    public void setFormattedStatus(String formattedStatus) { this.formattedStatus = formattedStatus; }

    public boolean isCanJoin() { return canJoin; }
    public void setCanJoin(boolean canJoin) { this.canJoin = canJoin; }

    public LocalDateTime getSessionEndTime() { return sessionEndTime; }
    public void setSessionEndTime(LocalDateTime sessionEndTime) { this.sessionEndTime = sessionEndTime; }
}
