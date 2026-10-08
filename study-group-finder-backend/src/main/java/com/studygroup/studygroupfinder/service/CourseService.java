package com.studygroup.studygroupfinder.service;

import com.studygroup.studygroupfinder.model.Course;
import com.studygroup.studygroupfinder.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> getPredefinedCourses() {
        return courseRepository.findByIsCustomFalse();
    }

    public List<Course> getCustomCourses() {
        return courseRepository.findByIsCustomTrue();
    }

    public List<Course> getCoursesByLevel(String level) {
        return courseRepository.findByLevel(level);
    }

    public List<Course> searchCourses(String keyword) {
        return courseRepository.findByTitleOrDescriptionContaining(keyword);
    }

    public Course createCourse(Course course, Long createdBy) {
        course.setIsCustom(true);
        course.setCreatedBy(createdBy);
        return courseRepository.save(course);
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}
