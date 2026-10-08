package com.studygroup.studygroupfinder.controller;

import com.studygroup.studygroupfinder.dto.StudySessionDto;
import com.studygroup.studygroupfinder.dto.CalendarDto;
import com.studygroup.studygroupfinder.model.StudySession;
import com.studygroup.studygroupfinder.service.StudySessionService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "http://localhost:5173")
public class StudySessionController {

    private final StudySessionService studySessionService;

    public StudySessionController(StudySessionService studySessionService) {
        this.studySessionService = studySessionService;
    }

    @PostMapping
    public ResponseEntity<StudySessionDto> createSession(@Valid @RequestBody StudySessionDto sessionDto) {
        try {
            StudySessionDto createdSession = studySessionService.createSession(sessionDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSession);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{sessionId}")
    public ResponseEntity<StudySessionDto> updateSession(
            @PathVariable Long sessionId,
            @Valid @RequestBody StudySessionDto sessionDto,
            @RequestHeader("X-User-Email") String userEmail) {
        try {
            StudySessionDto updatedSession = studySessionService.updateSession(sessionId, sessionDto, userEmail);
            return ResponseEntity.ok(updatedSession);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteSession(
            @PathVariable Long sessionId,
            @RequestHeader("X-User-Email") String userEmail) {
        try {
            studySessionService.deleteSession(sessionId, userEmail);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<StudySessionDto> getSession(@PathVariable Long sessionId) {
        try {
            StudySessionDto session = studySessionService.getSessionById(sessionId);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<StudySessionDto>> getSessionsByGroup(@PathVariable Long groupId) {
        try {
            List<StudySessionDto> sessions = studySessionService.getSessionsByGroup(groupId);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<StudySessionDto>> getUpcomingSessionsForUser(
            @RequestHeader("X-User-Email") String userEmail) {
        try {
            List<StudySessionDto> sessions = studySessionService.getUpcomingSessionsForUser(userEmail);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/upcoming/group/{groupId}")
    public ResponseEntity<List<StudySessionDto>> getUpcomingSessionsForGroup(@PathVariable Long groupId) {
        try {
            List<StudySessionDto> sessions = studySessionService.getUpcomingSessionsForGroup(groupId);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<CalendarDto>> getCalendarData(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestHeader("X-User-Email") String userEmail) {
        try {
            List<CalendarDto> calendarData = studySessionService.getCalendarData(startDate, endDate, userEmail);
            return ResponseEntity.ok(calendarData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<StudySessionDto>> getSessionsOnDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("X-User-Email") String userEmail) {
        try {
            List<StudySessionDto> sessions = studySessionService.getSessionsOnDate(date, userEmail);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/range")
    public ResponseEntity<List<StudySessionDto>> getSessionsInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestHeader("X-User-Email") String userEmail) {
        try {
            List<StudySessionDto> sessions = studySessionService.getSessionsInDateRange(startDate, endDate, userEmail);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/reminders")
    public ResponseEntity<Void> sendSessionReminders() {
        try {
            studySessionService.sendSessionReminders();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{sessionId}/join")
    public ResponseEntity<Map<String, Object>> joinSession(
            @PathVariable Long sessionId,
            @RequestHeader("X-User-Email") String userEmail) {
        try {
            StudySessionDto session = studySessionService.getSessionById(sessionId);
            
            if (!session.isCanJoin()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Cannot join completed session",
                    "status", session.getFormattedStatus()
                ));
            }
            
            // Here you would implement actual join logic (e.g., add to participants, generate meeting link, etc.)
            // For now, we'll just return the session info with join details
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Successfully joined session");
            response.put("session", session);
            response.put("joinTime", LocalDateTime.now());
            
            if (session.getMeetingType() == StudySession.MeetingType.ONLINE && session.getMeetingLink() != null) {
                response.put("meetingLink", session.getMeetingLink());
            } else if (session.getMeetingType() == StudySession.MeetingType.IN_PERSON && session.getLocation() != null) {
                response.put("location", session.getLocation());
            }
            
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
