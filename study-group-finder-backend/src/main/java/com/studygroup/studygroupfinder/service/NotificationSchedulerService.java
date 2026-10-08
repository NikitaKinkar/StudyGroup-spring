package com.studygroup.studygroupfinder.service;

import com.studygroup.studygroupfinder.model.Notification;
import com.studygroup.studygroupfinder.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationSchedulerService {

    private final StudySessionService studySessionService;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    public NotificationSchedulerService(StudySessionService studySessionService,
                                        NotificationRepository notificationRepository,
                                        EmailService emailService) {
        this.studySessionService = studySessionService;
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
    }

    // Run every hour to check for sessions needing reminders
    @Scheduled(cron = "0 0 * * * ?") // Every hour at minute 0
    public void sendSessionReminders() {
        try {
            studySessionService.sendSessionReminders();
        } catch (Exception e) {
            System.err.println("Error sending session reminders: " + e.getMessage());
        }
    }

    // Run daily at 9 AM to send daily session summaries
    @Scheduled(cron = "0 0 9 * * ?") // Every day at 9:00 AM
    public void sendDailySessionSummaries() {
        try {
            // Get all users who have sessions today
            List<String> usersWithSessionsToday = notificationRepository.findUsersWithSessionsToday();
            
            for (String userEmail : usersWithSessionsToday) {
                sendDailySessionSummary(userEmail);
            }
        } catch (Exception e) {
            System.err.println("Error sending daily session summaries: " + e.getMessage());
        }
    }

    // Run daily at 8 AM to send reminders for sessions starting in 1-2 hours
    @Scheduled(cron = "0 0 8 * * ?") // Every day at 8:00 AM
    public void sendImmediateReminders() {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startTime = now.plusHours(1);
            LocalDateTime endTime = now.plusHours(2);
            List<Notification> immediateReminders = notificationRepository.findSessionsStartingSoon(startTime, endTime);
            
            for (Notification notification : immediateReminders) {
                emailService.sendSessionReminderEmail(notification);
            }
        } catch (Exception e) {
            System.err.println("Error sending immediate reminders: " + e.getMessage());
        }
    }

    // Clean up old notifications (older than 30 days)
    @Scheduled(cron = "0 0 2 * * ?") // Every day at 2:00 AM
    public void cleanupOldNotifications() {
        try {
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            List<Notification> oldNotifications = notificationRepository.findNotificationsOlderThan(thirtyDaysAgo);
            
            for (Notification notification : oldNotifications) {
                // Mark as read instead of deleting to maintain history
                notification.setIsRead(true);
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            System.err.println("Error cleaning up old notifications: " + e.getMessage());
        }
    }

    private void sendDailySessionSummary(String userEmail) {
        try {
            // Get user's sessions for today
            List<Notification> todaySessions = notificationRepository.findTodaySessionsForUser(userEmail);
            
            if (!todaySessions.isEmpty()) {
                StringBuilder summary = new StringBuilder();
                summary.append("Good morning! Here's your study session schedule for today:\n\n");
                
                for (Notification notification : todaySessions) {
                    summary.append("• ").append(notification.getSessionTitle())
                           .append(" (").append(notification.getGroupName()).append(")\n");
                    if (notification.getSession() != null) {
                        summary.append("  Time: ").append(notification.getSession().getSessionTime()).append("\n");
                        if (notification.getSession().getMeetingType() == com.studygroup.studygroupfinder.model.StudySession.MeetingType.ONLINE) {
                            summary.append("  Type: Online\n");
                        } else {
                            summary.append("  Type: In Person\n");
                        }
                    }
                    summary.append("\n");
                }
                
                summary.append("Have a productive day!\n\n");
                summary.append("Best regards,\n");
                summary.append("Study Group Finder Team");
                
                // Send email summary
                emailService.sendCustomEmail(userEmail, "Daily Study Session Summary", summary.toString());
            }
        } catch (Exception e) {
            System.err.println("Error sending daily session summary to " + userEmail + ": " + e.getMessage());
        }
    }
}
