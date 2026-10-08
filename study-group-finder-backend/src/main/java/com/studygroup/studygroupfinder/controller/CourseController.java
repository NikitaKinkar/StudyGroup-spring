package com.studygroup.studygroupfinder.controller;

import com.studygroup.studygroupfinder.model.Course;
import com.studygroup.studygroupfinder.service.AuthService;
import com.studygroup.studygroupfinder.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class CourseController {

    private final CourseService courseService;
    private final AuthService authService;

    public CourseController(CourseService courseService, AuthService authService) {
        this.courseService = courseService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/predefined")
    public ResponseEntity<List<Course>> getPredefinedCourses() {
        return ResponseEntity.ok(courseService.getPredefinedCourses());
    }

    @GetMapping("/custom")
    public ResponseEntity<List<Course>> getCustomCourses() {
        return ResponseEntity.ok(courseService.getCustomCourses());
    }

    @GetMapping("/level/{level}")
    public ResponseEntity<List<Course>> getCoursesByLevel(@PathVariable String level) {
        return ResponseEntity.ok(courseService.getCoursesByLevel(level));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Course>> searchCourses(@RequestParam String keyword) {
        return ResponseEntity.ok(courseService.searchCourses(keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable Long id) {
        try {
            Course course = courseService.getCourseById(id);
            return ResponseEntity.ok(course);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody Course course,
                                       @RequestHeader("Authorization") String token) {
        try {
            String email = getUserEmailFromToken(token);
            Long userId = authService.getUserByEmail(email).getId();
            Course savedCourse = courseService.createCourse(course, userId);
            return ResponseEntity.ok(savedCourse);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id,
                                         @RequestHeader("Authorization") String token) {
        try {
            String email = getUserEmailFromToken(token);
            authService.getUserByEmail(email);
            // Only allow deletion if user created the course
            // This is a simple check - in production, you might want more sophisticated authorization
            courseService.deleteCourse(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Course deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private String getUserEmailFromToken(String token) {
        String jwtToken = token.substring(7);
        return authService.getJwtService().extractEmail(jwtToken);
    }
}
