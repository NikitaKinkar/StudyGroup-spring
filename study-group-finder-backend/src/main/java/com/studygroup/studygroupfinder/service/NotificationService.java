package com.studygroup.studygroupfinder.service;

import com.studygroup.studygroupfinder.model.Notification;
import com.studygroup.studygroupfinder.model.StudyGroup;
import com.studygroup.studygroupfinder.model.User;
import com.studygroup.studygroupfinder.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getUserNotifications(String userEmail) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(userEmail);
    }

    public List<Notification> getUnreadNotifications(String userEmail) {
        return notificationRepository.findByRecipientEmailAndIsRead(userEmail, false);
    }

    public Long getUnreadCount(String userEmail) {
        return notificationRepository.countUnreadNotifications(userEmail);
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(String userEmail) {
        List<Notification> unreadNotifications = getUnreadNotifications(userEmail);
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    public void createJoinRequestNotification(User requester, StudyGroup group) {
        String message = String.format("%s wants to join your group \"%s\"", requester.getFullName(), group.getName());
        
        Notification notification = new Notification(
                Notification.NotificationType.GROUP_JOIN_REQUEST,
                requester.getEmail(),
                group.getOwnerEmail(),
                group,
                message
        );
        
        notificationRepository.save(notification);
    }

    public void createAcceptanceNotification(User owner, StudyGroup group, String requesterEmail) {
        String message = String.format("Your request to join \"%s\" has been accepted! You are now a member of the group.", group.getName());
        
        Notification notification = new Notification(
                Notification.NotificationType.GROUP_JOIN_ACCEPTED,
                owner.getEmail(),
                requesterEmail,
                group,
                message
        );
        
        notificationRepository.save(notification);
    }

    public void createRejectionNotification(User owner, StudyGroup group, String requesterEmail) {
        String message = String.format("Your request to join \"%s\" has been rejected by the group owner.", group.getName());
        
        Notification notification = new Notification(
                Notification.NotificationType.GROUP_JOIN_REJECTED,
                owner.getEmail(),
                requesterEmail,
                group,
                message
        );
        
        notificationRepository.save(notification);
    }

    public void createChatMessageNotification(String senderEmail, String recipientEmail, String message) {
        Notification notification = new Notification(
                Notification.NotificationType.CHAT_MESSAGE,
                senderEmail,
                recipientEmail,
                message
        );
        
        notificationRepository.save(notification);
    }
}
