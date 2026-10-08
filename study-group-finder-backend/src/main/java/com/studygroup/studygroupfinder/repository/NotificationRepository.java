package com.studygroup.studygroupfinder.repository;

import com.studygroup.studygroupfinder.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientEmail(String recipientEmail);
    List<Notification> findByRecipientEmailAndIsRead(String recipientEmail, Boolean isRead);
    
    @Query("SELECT n FROM Notification n WHERE n.recipientEmail = ?1 ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientEmail = ?1 AND n.isRead = false")
    Long countUnreadNotifications(String recipientEmail);
    
    @Query("SELECT n FROM Notification n WHERE n.type = 'GROUP_JOIN_REQUEST' AND n.recipientEmail = ?1 AND n.isRead = false")
    List<Notification> findUnreadJoinRequests(String recipientEmail);
    
    @Query("SELECT DISTINCT n.recipientEmail FROM Notification n WHERE n.type IN ('SESSION_SCHEDULED', 'SESSION_REMINDER') AND n.createdAt >= CURRENT_DATE")
    List<String> findUsersWithSessionsToday();
    
    @Query("SELECT n FROM Notification n WHERE n.type = 'SESSION_REMINDER' AND n.session.sessionDate BETWEEN :startTime AND :endTime")
    List<Notification> findSessionsStartingSoon(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT n FROM Notification n WHERE n.createdAt < :date")
    List<Notification> findNotificationsOlderThan(@Param("date") LocalDateTime date);
    
    @Query("SELECT n FROM Notification n WHERE n.recipientEmail = ?1 AND n.type IN ('SESSION_SCHEDULED', 'SESSION_REMINDER') AND n.createdAt >= CURRENT_DATE")
    List<Notification> findTodaySessionsForUser(String recipientEmail);
    
    void deleteByRecipientEmailAndIsRead(String recipientEmail, Boolean isRead);
}
