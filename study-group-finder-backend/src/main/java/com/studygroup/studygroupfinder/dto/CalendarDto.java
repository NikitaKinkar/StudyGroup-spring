package com.studygroup.studygroupfinder.dto;

import java.time.LocalDate;

import java.time.LocalDateTime;
import java.util.List;

import com.studygroup.studygroupfinder.model.StudySession;

public class CalendarDto {
    
    private LocalDate date;
    private List<SessionSummaryDto> sessions;
    private boolean hasSessions;
    private int sessionCount;

    // Constructors
    public CalendarDto() {}

    public CalendarDto(LocalDate date, List<SessionSummaryDto> sessions) {
        this.date = date;
        this.sessions = sessions;
        this.hasSessions = sessions != null && !sessions.isEmpty();
        this.sessionCount = sessions != null ? sessions.size() : 0;
    }

    // Getters and Setters
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public List<SessionSummaryDto> getSessions() { return sessions; }
    public void setSessions(List<SessionSummaryDto> sessions) { 
        this.sessions = sessions;
        this.hasSessions = sessions != null && !sessions.isEmpty();
        this.sessionCount = sessions != null ? sessions.size() : 0;
    }

    public boolean isHasSessions() { return hasSessions; }
    public void setHasSessions(boolean hasSessions) { this.hasSessions = hasSessions; }

    public int getSessionCount() { return sessionCount; }
    public void setSessionCount(int sessionCount) { this.sessionCount = sessionCount; }

    // Inner class for session summary
    public static class SessionSummaryDto {
        private Long id;
        private String title;
        private String groupName;
        private LocalDateTime sessionDate;
        private String sessionTime;
        private StudySession.MeetingType meetingType;
        private StudySession.SessionStatus sessionStatus;
        private String formattedStatus;
        private boolean canJoin;

        // Constructors
        public SessionSummaryDto() {}

        public SessionSummaryDto(Long id, String title, String groupName, 
                                LocalDateTime sessionDate, String sessionTime, 
                                StudySession.MeetingType meetingType,
                                StudySession.SessionStatus sessionStatus,
                                String formattedStatus,
                                boolean canJoin) {
            this.id = id;
            this.title = title;
            this.groupName = groupName;
            this.sessionDate = sessionDate;
            this.sessionTime = sessionTime;
            this.meetingType = meetingType;
            this.sessionStatus = sessionStatus;
            this.formattedStatus = formattedStatus;
            this.canJoin = canJoin;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getGroupName() { return groupName; }
        public void setGroupName(String groupName) { this.groupName = groupName; }

        public LocalDateTime getSessionDate() { return sessionDate; }
        public void setSessionDate(LocalDateTime sessionDate) { this.sessionDate = sessionDate; }

        public String getSessionTime() { return sessionTime; }
        public void setSessionTime(String sessionTime) { this.sessionTime = sessionTime; }

        public StudySession.MeetingType getMeetingType() { return meetingType; }
        public void setMeetingType(StudySession.MeetingType meetingType) { this.meetingType = meetingType; }

        public StudySession.SessionStatus getSessionStatus() { return sessionStatus; }
        public void setSessionStatus(StudySession.SessionStatus sessionStatus) { this.sessionStatus = sessionStatus; }

        public String getFormattedStatus() { return formattedStatus; }
        public void setFormattedStatus(String formattedStatus) { this.formattedStatus = formattedStatus; }

        public boolean isCanJoin() { return canJoin; }
        public void setCanJoin(boolean canJoin) { this.canJoin = canJoin; }
    }
}
