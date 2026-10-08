package com.studygroup.studygroupfinder.service;

import com.studygroup.studygroupfinder.dto.StudySessionDto;
import com.studygroup.studygroupfinder.dto.CalendarDto;
import com.studygroup.studygroupfinder.model.*;
import com.studygroup.studygroupfinder.repository.StudySessionRepository;
import com.studygroup.studygroupfinder.repository.StudyGroupRepository;
import com.studygroup.studygroupfinder.repository.UserRepository;
import com.studygroup.studygroupfinder.repository.GroupMemberRepository;
import com.studygroup.studygroupfinder.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudySessionService {

    private final StudySessionRepository studySessionRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final NotificationRepository notificationRepository;

    public StudySessionService(StudySessionRepository studySessionRepository,
                               StudyGroupRepository studyGroupRepository,
                               UserRepository userRepository,
                               GroupMemberRepository groupMemberRepository,
                               NotificationRepository notificationRepository) {
        this.studySessionRepository = studySessionRepository;
        this.studyGroupRepository = studyGroupRepository;
        this.userRepository = userRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.notificationRepository = notificationRepository;
    }

    public StudySessionDto createSession(StudySessionDto sessionDto) {
        // Validate group exists
        StudyGroup group = studyGroupRepository.findById(sessionDto.getGroupId())
                .orElseThrow(() -> new EntityNotFoundException("Group not found"));

        // Validate user exists and is member of the group
        User creator = userRepository.findByEmail(sessionDto.getCreatorEmail())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        boolean isMember = groupMemberRepository.findByGroupAndUserEmail(group, creator.getEmail()).isPresent();
        if (!isMember) {
            throw new IllegalArgumentException("User is not a member of this group");
        }

        // Check for session conflicts
        if (studySessionRepository.existsByGroupAndSessionDateAndSessionTime(
                group, sessionDto.getSessionDate(), sessionDto.getSessionTime())) {
            throw new IllegalArgumentException("A session is already scheduled at this time");
        }

        // Create session
        StudySession session = new StudySession();
        session.setGroup(group);
        session.setCreator(creator);
        session.setTitle(sessionDto.getTitle());
        session.setDescription(sessionDto.getDescription());
        session.setSessionDate(sessionDto.getSessionDate());
        session.setSessionTime(sessionDto.getSessionTime());
        session.setDuration(sessionDto.getDuration());
        session.setMeetingType(sessionDto.getMeetingType());
        session.setLocation(sessionDto.getLocation());
        session.setMeetingLink(sessionDto.getMeetingLink());
        session.setNotifyMembers(sessionDto.getNotifyMembers());

        StudySession savedSession = studySessionRepository.save(session);

        // Send notifications to group members if requested
        if (sessionDto.getNotifyMembers()) {
            sendSessionScheduledNotifications(savedSession);
        }

        return new StudySessionDto(savedSession);
    }

    public StudySessionDto updateSession(Long sessionId, StudySessionDto sessionDto, String userEmail) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Session not found"));

        // Check if user is the creator or group admin
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!session.getCreator().getEmail().equals(user.getEmail()) && 
            !session.getGroup().getOwnerEmail().equals(user.getEmail())) {
            throw new IllegalArgumentException("Only session creator or group admin can update session");
        }

        // Update session details
        session.setTitle(sessionDto.getTitle());
        session.setDescription(sessionDto.getDescription());
        session.setSessionDate(sessionDto.getSessionDate());
        session.setSessionTime(sessionDto.getSessionTime());
        session.setDuration(sessionDto.getDuration());
        session.setMeetingType(sessionDto.getMeetingType());
        session.setLocation(sessionDto.getLocation());
        session.setMeetingLink(sessionDto.getMeetingLink());
        session.setNotifyMembers(sessionDto.getNotifyMembers());

        StudySession updatedSession = studySessionRepository.save(session);

        // Send update notifications
        sendSessionUpdatedNotifications(updatedSession);

        return new StudySessionDto(updatedSession);
    }

    public void deleteSession(Long sessionId, String userEmail) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Session not found"));

        // Check if user is the creator or group admin
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!session.getCreator().getEmail().equals(user.getEmail()) && 
            !session.getGroup().getOwnerEmail().equals(user.getEmail())) {
            throw new IllegalArgumentException("Only session creator or group admin can delete session");
        }

        // Send cancellation notifications before deleting
        sendSessionCancelledNotifications(session);

        studySessionRepository.delete(session);
    }

    public StudySessionDto getSessionById(Long sessionId) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Session not found"));
        return new StudySessionDto(session);
    }

    public List<StudySessionDto> getSessionsByGroup(Long groupId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found"));
        
        return studySessionRepository.findByGroupOrderBySessionDateAsc(group)
                .stream()
                .map(StudySessionDto::new)
                .collect(Collectors.toList());
    }

    public List<StudySessionDto> getUpcomingSessionsForUser(String userEmail) {
        return studySessionRepository.findUpcomingSessionsForUser(userEmail, LocalDateTime.now())
                .stream()
                .map(StudySessionDto::new)
                .collect(Collectors.toList());
    }

    public List<StudySessionDto> getUpcomingSessionsForGroup(Long groupId) {
        return studySessionRepository.findUpcomingSessionsForGroup(groupId, LocalDateTime.now())
                .stream()
                .map(StudySessionDto::new)
                .collect(Collectors.toList());
    }

    public List<StudySessionDto> getSessionsInDateRange(LocalDate startDate, LocalDate endDate, String userEmail) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        return studySessionRepository.findUserSessionsInDateRange(userEmail, startDateTime, endDateTime)
                .stream()
                .map(StudySessionDto::new)
                .collect(Collectors.toList());
    }

    public List<CalendarDto> getCalendarData(LocalDate startDate, LocalDate endDate, String userEmail) {
        List<StudySession> sessions = studySessionRepository.findUserSessionsInDateRange(
                userEmail, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));

        Map<LocalDate, List<StudySession>> sessionsByDate = sessions.stream()
                .collect(Collectors.groupingBy(session -> session.getSessionDate().toLocalDate()));

        List<CalendarDto> calendarData = new ArrayList<>();
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            List<StudySession> daySessions = sessionsByDate.getOrDefault(currentDate, new ArrayList<>());
            
            List<CalendarDto.SessionSummaryDto> sessionSummaries = daySessions.stream()
                    .map(session -> new CalendarDto.SessionSummaryDto(
                            session.getId(),
                            session.getTitle(),
                            session.getGroupName(),
                            session.getSessionDate(),
                            session.getSessionTime(),
                            session.getMeetingType(),
                            session.getSessionStatus(),
                            session.getFormattedStatus(),
                            session.canJoin()
                    ))
                    .collect(Collectors.toList());

            calendarData.add(new CalendarDto(currentDate, sessionSummaries));
            currentDate = currentDate.plusDays(1);
        }

        return calendarData;
    }

    public List<StudySessionDto> getSessionsOnDate(LocalDate date, String userEmail) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        
        return studySessionRepository.findSessionsOnDate(startOfDay, endOfDay)
                .stream()
                .map(StudySessionDto::new)
                .collect(Collectors.toList());
    }

    public void sendSessionReminders() {
        // Send reminders for sessions happening in the next 24 hours
        LocalDateTime reminderTime = LocalDateTime.now().plusHours(24);
        List<StudySession> sessionsNeedingReminder = studySessionRepository.findSessionsNeedingReminder(reminderTime);

        for (StudySession session : sessionsNeedingReminder) {
            sendSessionReminderNotifications(session);
            session.setReminderSent(true);
            studySessionRepository.save(session);
        }
    }

    private void sendSessionScheduledNotifications(StudySession session) {
        List<GroupMember> members = groupMemberRepository.findByGroup(session.getGroup());
        
        for (GroupMember member : members) {
            if (!member.getUserEmail().equals(session.getCreator().getEmail())) {
                String message = String.format(
                    "New session scheduled: %s on %s at %s",
                    session.getTitle(),
                    session.getSessionDate().toLocalDate(),
                    session.getSessionTime()
                );
                
                Notification notification = new Notification(
                    Notification.NotificationType.SESSION_SCHEDULED,
                    session.getCreator().getEmail(),
                    member.getUserEmail(),
                    message
                );
                notification.setGroup(session.getGroup());
                notification.setSession(session);
                
                notificationRepository.save(notification);
            }
        }
    }

    private void sendSessionUpdatedNotifications(StudySession session) {
        List<GroupMember> members = groupMemberRepository.findByGroup(session.getGroup());
        
        for (GroupMember member : members) {
            if (!member.getUserEmail().equals(session.getCreator().getEmail())) {
                String message = String.format(
                    "Session updated: %s on %s at %s",
                    session.getTitle(),
                    session.getSessionDate().toLocalDate(),
                    session.getSessionTime()
                );
                
                Notification notification = new Notification(
                    Notification.NotificationType.SESSION_UPDATED,
                    session.getCreator().getEmail(),
                    member.getUserEmail(),
                    message
                );
                notification.setGroup(session.getGroup());
                notification.setSession(session);
                
                notificationRepository.save(notification);
            }
        }
    }

    private void sendSessionCancelledNotifications(StudySession session) {
        List<GroupMember> members = groupMemberRepository.findByGroup(session.getGroup());
        
        for (GroupMember member : members) {
            if (!member.getUserEmail().equals(session.getCreator().getEmail())) {
                String message = String.format(
                    "Session cancelled: %s scheduled for %s",
                    session.getTitle(),
                    session.getSessionDate().toLocalDate()
                );
                
                Notification notification = new Notification(
                    Notification.NotificationType.SESSION_CANCELLED,
                    session.getCreator().getEmail(),
                    member.getUserEmail(),
                    message
                );
                notification.setGroup(session.getGroup());
                notification.setSession(session);
                
                notificationRepository.save(notification);
            }
        }
    }

    private void sendSessionReminderNotifications(StudySession session) {
        List<GroupMember> members = groupMemberRepository.findByGroup(session.getGroup());
        
        for (GroupMember member : members) {
            String message = String.format(
                "Reminder: %s is scheduled for tomorrow at %s",
                session.getTitle(),
                session.getSessionTime()
            );
            
            Notification notification = new Notification(
                Notification.NotificationType.SESSION_REMINDER,
                "system",
                member.getUserEmail(),
                message
            );
            notification.setGroup(session.getGroup());
            notification.setSession(session);
            
            notificationRepository.save(notification);
        }
    }
}
