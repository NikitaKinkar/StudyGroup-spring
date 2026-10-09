package com.studygroup.studygroupfinder.controller;

import com.studygroup.studygroupfinder.dto.SignInRequest;
import com.studygroup.studygroupfinder.dto.SignUpRequest;
import com.studygroup.studygroupfinder.model.User;
import com.studygroup.studygroupfinder.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    private Map<String, Object> createUserResponseMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("fullName", user.getFullName());
        map.put("full_name", user.getFullName());
        map.put("name", user.getFullName());
        map.put("email", user.getEmail());
        map.put("university", user.getUniversity() != null ? user.getUniversity() : "");
        map.put("passingYear", user.getPassingYear());
        map.put("passing_year", user.getPassingYear());
        map.put("passingGpa", user.getPassingGpa());
        map.put("passing_gpa", user.getPassingGpa());
        map.put("memberSince", user.getMemberSince() != null ? user.getMemberSince() : "");
        map.put("role", "STUDENT");
        return map;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@Valid @RequestBody SignUpRequest signUpRequest) {
        try {
            User user = authService.signUp(signUpRequest);
            String token = authService.getJwtService().generateToken(user.getEmail());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("token", token);
            response.put("user", createUserResponseMap(user));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@Valid @RequestBody SignInRequest signInRequest) {
        try {
            String token = authService.signIn(signInRequest);
            User user = authService.getUserByEmail(signInRequest.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", createUserResponseMap(user));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String token) {
        try {
            // Remove "Bearer " prefix
            String jwtToken = token.substring(7);
            String email = authService.getJwtService().extractEmail(jwtToken);
            User user = authService.getUserByEmail(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("user", createUserResponseMap(user));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid token");
            return ResponseEntity.badRequest().body(error);
        }
    }
}
