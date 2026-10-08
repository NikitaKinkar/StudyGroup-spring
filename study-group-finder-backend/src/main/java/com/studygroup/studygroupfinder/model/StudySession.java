package com.studygroup.studygroupfinder.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_sessions")
public class StudySession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    @Column(name = "group_name", nullable = false)
    private String groupName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_email", referencedColumnName = "email", nullable = false)
    private User creator;

    @Column(name = "creator_email", insertable = false, updatable = false)
    private String creatorEmail;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "session_date", nullable = false)
    private LocalDateTime sessionDate;

    @Column(name = "session_time", nullable = false)
    private String sessionTime;

    @Column(nullable = false)
    private Integer duration; // in minutes

    @Enumerated(EnumType.STRING)
    @Column(name = "meeting_type", nullable = false)
    private MeetingType meetingType;

    @Column(name = "location")
    private String location;

    @Column(name = "meeting_link")
    private String meetingLink;

    @Column(name = "notify_members", nullable = false)
    private Boolean notifyMembers = true;

    @Column(name = "reminder_sent")
    private Boolean reminderSent = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum MeetingType {
        ONLINE,
        IN_PERSON
    }

    public enum SessionStatus {
        UPCOMING,
        ACTIVE,
        COMPLETED
    }

    // Constructors
    public StudySession() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.notifyMembers = true;
        this.reminderSent = false;
    }

    public StudySession(StudyGroup group, User creator, String title, String description, 
                        LocalDateTime sessionDate, String sessionTime, Integer duration, 
                        MeetingType meetingType, String location, String meetingLink, Boolean notifyMembers) {
        this();
        this.group = group;
        this.groupName = group.getName();
        this.creator = creator;
        this.creatorEmail = creator.getEmail();
        this.title = title;
        this.description = description;
        this.sessionDate = sessionDate;
        this.sessionTime = sessionTime;
        this.duration = duration;
        this.meetingType = meetingType;
        this.location = location;
        this.meetingLink = meetingLink;
        this.notifyMembers = notifyMembers;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public StudyGroup getGroup() { return group; }
    public void setGroup(StudyGroup group) { 
        this.group = group;
        this.groupName = group != null ? group.getName() : null;
    }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public User getCreator() { return creator; }
    public void setCreator(User creator) { 
        this.creator = creator;
        this.creatorEmail = creator != null ? creator.getEmail() : null;
    }

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

    public MeetingType getMeetingType() { return meetingType; }
    public void setMeetingType(MeetingType meetingType) { this.meetingType = meetingType; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public Boolean getNotifyMembers() { return notifyMembers; }
    public void setNotifyMembers(Boolean notifyMembers) { this.notifyMembers = notifyMembers; }

    public Boolean getReminderSent() { return reminderSent; }
    public void setReminderSent(Boolean reminderSent) { this.reminderSent = reminderSent; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Dynamic session status calculation
    public SessionStatus getSessionStatus() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sessionStart = this.sessionDate;
        LocalDateTime sessionEnd = sessionStart.plusMinutes(this.duration);

        if (now.isBefore(sessionStart)) {
            return SessionStatus.UPCOMING;
        } else if (now.isBefore(sessionEnd)) {
            return SessionStatus.ACTIVE;
        } else {
            return SessionStatus.COMPLETED;
        }
    }

    // Helper method to get session end time
    public LocalDateTime getSessionEndTime() {
        return this.sessionDate.plusMinutes(this.duration);
    }

    // Helper method to check if session can be joined
    public boolean canJoin() {
        return getSessionStatus() != SessionStatus.COMPLETED;
    }

    // Helper method to get formatted status for UI
    public String getFormattedStatus() {
        switch (getSessionStatus()) {
            case UPCOMING:
                return "Upcoming";
            case ACTIVE:
                return "Active";
            case COMPLETED:
                return "Completed";
            default:
                return "Unknown";
        }
    }
}
