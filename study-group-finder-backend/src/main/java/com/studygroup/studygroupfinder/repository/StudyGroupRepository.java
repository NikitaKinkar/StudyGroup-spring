package com.studygroup.studygroupfinder.repository;

import com.studygroup.studygroupfinder.model.StudyGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {
    List<StudyGroup> findByOwnerEmail(String ownerEmail);
    List<StudyGroup> findByCourseName(String courseName);
    List<StudyGroup> findByVisibility(StudyGroup.Visibility visibility);
    
    @Query("SELECT g FROM StudyGroup g WHERE g.courseName = ?1 AND g.visibility = 'Public'")
    List<StudyGroup> findPublicGroupsByCourse(String courseName);
    
    @Query("SELECT g FROM StudyGroup g WHERE g.name LIKE %?1% OR g.description LIKE %?1% OR g.courseName LIKE %?1%")
    List<StudyGroup> findByKeyword(String keyword);
    
    @Query("SELECT g FROM StudyGroup g JOIN GroupMember gm ON g.id = gm.group.id WHERE gm.userEmail = ?1")
    List<StudyGroup> findGroupsByMember(String userEmail);
}
