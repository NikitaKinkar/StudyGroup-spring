package com.studygroup.studygroupfinder.controller;

import com.studygroup.studygroupfinder.model.Notification;
import com.studygroup.studygroupfinder.service.JwtService;
import com.studygroup.studygroupfinder.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtService jwtService;

    public NotificationController(NotificationService notificationService, JwtService jwtService) {
        this.notificationService = notificationService;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(@RequestHeader("Authorization") String token) {
        String email = getUserEmailFromToken(token);
        List<Notification> notifications = notificationService.getUserNotifications(email);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@RequestHeader("Authorization") String token) {
        String email = getUserEmailFromToken(token);
        List<Notification> notifications = notificationService.getUnreadNotifications(email);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestHeader("Authorization") String token) {
        String email = getUserEmailFromToken(token);
        Long count = notificationService.getUnreadCount(email);
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id,
                                       @RequestHeader("Authorization") String token) {
        try {
            notificationService.markAsRead(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Notification marked as read");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(@RequestHeader("Authorization") String token) {
        String email = getUserEmailFromToken(token);
        notificationService.markAllAsRead(email);
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id,
                                              @RequestHeader("Authorization") String token) {
        try {
            notificationService.deleteNotification(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Notification deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private String getUserEmailFromToken(String token) {
        String jwtToken = token.substring(7);
        return jwtService.extractEmail(jwtToken);
    }
}
