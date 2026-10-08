package com.studygroup.studygroupfinder.repository;

import com.studygroup.studygroupfinder.model.GroupMember;
import com.studygroup.studygroupfinder.model.StudyGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroup(StudyGroup group);
    List<GroupMember> findByGroup_Id(Long groupId);
    List<GroupMember> findByUserEmail(String userEmail);
    Optional<GroupMember> findByGroup_IdAndUserEmail(Long groupId, String userEmail);
    Optional<GroupMember> findByGroup_IdAndUserEmailIgnoreCase(Long groupId, String userEmail);
    Optional<GroupMember> findByGroupAndUserEmail(StudyGroup group, String userEmail);
    Optional<GroupMember> findByGroupAndUserEmailIgnoreCase(StudyGroup group, String userEmail);
    
    @Query("SELECT COUNT(gm) FROM GroupMember gm WHERE gm.group.id = ?1")
    Long countMembersByGroupId(Long groupId);
    
    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.id = ?1 AND gm.role = 'Owner'")
    Optional<GroupMember> findGroupOwner(Long groupId);
    
    @Query("SELECT gm FROM GroupMember gm WHERE gm.userEmail = ?1 AND gm.role = 'Member'")
    List<GroupMember> findUserMemberships(String userEmail);
}
