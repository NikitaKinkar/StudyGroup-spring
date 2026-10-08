package com.studygroup.studygroupfinder.repository;

import com.studygroup.studygroupfinder.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByIsCustomFalse();
    List<Course> findByIsCustomTrue();
    List<Course> findByLevel(String level);
    
    @Query("SELECT c FROM Course c WHERE c.isCustom = false OR c.createdBy = ?1")
    List<Course> findAvailableCourses(Long userId);
    
    @Query("SELECT c FROM Course c WHERE c.title LIKE %?1% OR c.description LIKE %?1%")
    List<Course> findByTitleOrDescriptionContaining(String keyword);
}
