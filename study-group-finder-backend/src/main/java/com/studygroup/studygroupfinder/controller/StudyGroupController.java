package com.studygroup.studygroupfinder.controller;

import com.studygroup.studygroupfinder.dto.CreateGroupRequest;
import com.studygroup.studygroupfinder.model.StudyGroup;
import com.studygroup.studygroupfinder.model.User;
import com.studygroup.studygroupfinder.service.AuthService;
import com.studygroup.studygroupfinder.service.JwtService;
import com.studygroup.studygroupfinder.service.StudyGroupService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class StudyGroupController {

    private final StudyGroupService studyGroupService;
    private final AuthService authService;
    private final JwtService jwtService;

    public StudyGroupController(StudyGroupService studyGroupService, AuthService authService, JwtService jwtService) {
        this.studyGroupService = studyGroupService;
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<List<StudyGroup>> getAllGroups() {
        return ResponseEntity.ok(studyGroupService.getAllGroups());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getGroupById(@PathVariable Long id) {
        Optional<StudyGroup> group = studyGroupService.getGroupById(id);
        if (group.isPresent()) {
            return ResponseEntity.ok(group.get());
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Group not found");
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createGroup(@Valid @RequestBody CreateGroupRequest request,
                                        @RequestHeader("Authorization") String token) {
        try {
            String email = getUserEmailFromToken(token);
            User owner = authService.getUserByEmail(email);
            StudyGroup group = studyGroupService.createGroup(request, owner);
            return ResponseEntity.ok(group);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable Long id,
                                         @RequestHeader("Authorization") String token) {
        try {
            String email = getUserEmailFromToken(token);
            studyGroupService.deleteGroup(id, email);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Group deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> requestToJoinGroup(@PathVariable Long id,
                                             @RequestHeader("Authorization") String token) {
        try {
            String email = getUserEmailFromToken(token);
            User user = authService.getUserByEmail(email);
            Map<String, Object> result = studyGroupService.requestToJoinGroup(id, user);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptJoinRequest(@PathVariable Long id,
                                            @RequestParam String requesterEmail,
                                            @RequestHeader("Authorization") String token) {
        try {
            String email = getUserEmailFromToken(token);
            User owner = authService.getUserByEmail(email);
            studyGroupService.acceptJoinRequest(id, requesterEmail, owner);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Join request accepted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectJoinRequest(@PathVariable Long id,
                                            @RequestParam String requesterEmail,
                                            @RequestHeader("Authorization") String token) {
        try {
            String email = getUserEmailFromToken(token);
            User owner = authService.getUserByEmail(email);
            studyGroupService.rejectJoinRequest(id, requesterEmail, owner);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Join request rejected successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/my-groups")
    public ResponseEntity<List<StudyGroup>> getMyGroups(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        try {
            String email = getUserEmailFromToken(token);
            List<StudyGroup> groups = studyGroupService.getGroupsByMember(email);
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    @GetMapping("/owned")
    public ResponseEntity<List<StudyGroup>> getOwnedGroups(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        try {
            String email = getUserEmailFromToken(token);
            List<StudyGroup> groups = studyGroupService.getGroupsByOwner(email);
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    private String getUserEmailFromToken(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Authentication token required. Please sign in.");
        }
        try {
            String jwtToken = token.substring(7);
            return jwtService.extractEmail(jwtToken);
        } catch (Exception e) {
            throw new RuntimeException("Invalid authentication token. Please sign in again.");
        }
    }
}
