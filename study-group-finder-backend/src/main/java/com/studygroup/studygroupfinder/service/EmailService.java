package com.studygroup.studygroupfinder.service;

import com.studygroup.studygroupfinder.model.Notification;
import com.studygroup.studygroupfinder.model.StudySession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendSessionScheduledEmail(Notification notification) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(notification.getRecipientEmail());
            message.setSubject("New Study Session Scheduled - " + notification.getSessionTitle());

            String emailBody = buildSessionScheduledEmailBody(notification);
            message.setText(emailBody);

            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't throw to avoid breaking the flow
            System.err.println("Failed to send session scheduled email: " + e.getMessage());
        }
    }

    public void sendSessionReminderEmail(Notification notification) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(notification.getRecipientEmail());
            message.setSubject("Reminder: Study Session Tomorrow - " + notification.getSessionTitle());

            String emailBody = buildSessionReminderEmailBody(notification);
            message.setText(emailBody);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send session reminder email: " + e.getMessage());
        }
    }

    public void sendSessionUpdatedEmail(Notification notification) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(notification.getRecipientEmail());
            message.setSubject("Study Session Updated - " + notification.getSessionTitle());

            String emailBody = buildSessionUpdatedEmailBody(notification);
            message.setText(emailBody);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send session updated email: " + e.getMessage());
        }
    }

    public void sendSessionCancelledEmail(Notification notification) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(notification.getRecipientEmail());
            message.setSubject("Study Session Cancelled - " + notification.getSessionTitle());

            String emailBody = buildSessionCancelledEmailBody(notification);
            message.setText(emailBody);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send session cancelled email: " + e.getMessage());
        }
    }

    private String buildSessionScheduledEmailBody(Notification notification) {
        StringBuilder body = new StringBuilder();
        
        body.append("Hello,\n\n");
        body.append("A new study session has been scheduled for your group \"").append(notification.getGroupName()).append("\".\n\n");
        
        body.append("Session Details:\n");
        body.append("Title: ").append(notification.getSessionTitle()).append("\n");
        
        if (notification.getSession() != null) {
            StudySession session = notification.getSession();
            body.append("Date: ").append(session.getSessionDate().format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy"))).append("\n");
            body.append("Time: ").append(session.getSessionTime()).append("\n");
            body.append("Duration: ").append(session.getDuration()).append(" minutes\n");
            
            if (session.getMeetingType() == StudySession.MeetingType.ONLINE) {
                body.append("Type: Online\n");
                if (session.getMeetingLink() != null) {
                    body.append("Meeting Link: ").append(session.getMeetingLink()).append("\n");
                }
            } else {
                body.append("Type: In Person\n");
                if (session.getLocation() != null) {
                    body.append("Location: ").append(session.getLocation()).append("\n");
                }
            }
            
            if (session.getDescription() != null) {
                body.append("Description: ").append(session.getDescription()).append("\n");
            }
        }
        
        body.append("Created by: ").append(notification.getSenderEmail()).append("\n\n");
        
        body.append("You can view all your sessions by logging into Study Group Finder:\n");
        body.append(frontendUrl).append("/sessions\n\n");
        
        body.append("Best regards,\n");
        body.append("Study Group Finder Team");
        
        return body.toString();
    }

    private String buildSessionReminderEmailBody(Notification notification) {
        StringBuilder body = new StringBuilder();
        
        body.append("Hello,\n\n");
        body.append("This is a friendly reminder about your upcoming study session tomorrow.\n\n");
        
        body.append("Session Details:\n");
        body.append("Title: ").append(notification.getSessionTitle()).append("\n");
        body.append("Group: ").append(notification.getGroupName()).append("\n");
        
        if (notification.getSession() != null) {
            StudySession session = notification.getSession();
            body.append("Date: ").append(session.getSessionDate().format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy"))).append("\n");
            body.append("Time: ").append(session.getSessionTime()).append("\n");
            body.append("Duration: ").append(session.getDuration()).append(" minutes\n");
            
            if (session.getMeetingType() == StudySession.MeetingType.ONLINE) {
                body.append("Type: Online\n");
                if (session.getMeetingLink() != null) {
                    body.append("Meeting Link: ").append(session.getMeetingLink()).append("\n");
                }
            } else {
                body.append("Type: In Person\n");
                if (session.getLocation() != null) {
                    body.append("Location: ").append(session.getLocation()).append("\n");
                }
            }
        }
        
        body.append("\nDon't forget to prepare and join the session on time!\n\n");
        
        body.append("View session details:\n");
        body.append(frontendUrl).append("/sessions\n\n");
        
        body.append("Best regards,\n");
        body.append("Study Group Finder Team");
        
        return body.toString();
    }

    private String buildSessionUpdatedEmailBody(Notification notification) {
        StringBuilder body = new StringBuilder();
        
        body.append("Hello,\n\n");
        body.append("A study session has been updated for your group \"").append(notification.getGroupName()).append("\".\n\n");
        
        body.append("Updated Session Details:\n");
        body.append("Title: ").append(notification.getSessionTitle()).append("\n");
        
        if (notification.getSession() != null) {
            StudySession session = notification.getSession();
            body.append("Date: ").append(session.getSessionDate().format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy"))).append("\n");
            body.append("Time: ").append(session.getSessionTime()).append("\n");
            body.append("Duration: ").append(session.getDuration()).append(" minutes\n");
            
            if (session.getMeetingType() == StudySession.MeetingType.ONLINE) {
                body.append("Type: Online\n");
                if (session.getMeetingLink() != null) {
                    body.append("Meeting Link: ").append(session.getMeetingLink()).append("\n");
                }
            } else {
                body.append("Type: In Person\n");
                if (session.getLocation() != null) {
                    body.append("Location: ").append(session.getLocation()).append("\n");
                }
            }
        }
        
        body.append("Updated by: ").append(notification.getSenderEmail()).append("\n\n");
        
        body.append("Please check the updated details and adjust your schedule accordingly.\n\n");
        
        body.append("View session details:\n");
        body.append(frontendUrl).append("/sessions\n\n");
        
        body.append("Best regards,\n");
        body.append("Study Group Finder Team");
        
        return body.toString();
    }

    private String buildSessionCancelledEmailBody(Notification notification) {
        StringBuilder body = new StringBuilder();
        
        body.append("Hello,\n\n");
        body.append("Unfortunately, a study session has been cancelled for your group \"").append(notification.getGroupName()).append("\".\n\n");
        
        body.append("Cancelled Session:\n");
        body.append("Title: ").append(notification.getSessionTitle()).append("\n");
        
        if (notification.getSession() != null) {
            StudySession session = notification.getSession();
            body.append("Originally scheduled: ").append(session.getSessionDate().format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy"))).append("\n");
            body.append("Time: ").append(session.getSessionTime()).append("\n");
        }
        
        body.append("Cancelled by: ").append(notification.getSenderEmail()).append("\n\n");
        
        body.append("We apologize for any inconvenience. Please check for other upcoming sessions in your group.\n\n");
        
        body.append("View your sessions:\n");
        body.append(frontendUrl).append("/sessions\n\n");
        
        body.append("Best regards,\n");
        body.append("Study Group Finder Team");
        
        return body.toString();
    }

    public void sendBulkSessionEmails(List<Notification> notifications) {
        for (Notification notification : notifications) {
            switch (notification.getType()) {
                case SESSION_SCHEDULED:
                    sendSessionScheduledEmail(notification);
                    break;
                case SESSION_REMINDER:
                    sendSessionReminderEmail(notification);
                    break;
                case SESSION_UPDATED:
                    sendSessionUpdatedEmail(notification);
                    break;
                case SESSION_CANCELLED:
                    sendSessionCancelledEmail(notification);
                    break;
                default:
                    break;
            }
        }
    }

    public void sendCustomEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send custom email: " + e.getMessage());
        }
    }
}
