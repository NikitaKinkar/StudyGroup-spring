package com.studygroup.studygroupfinder.service;

import com.studygroup.studygroupfinder.dto.CreateGroupRequest;
import com.studygroup.studygroupfinder.model.GroupMember;
import com.studygroup.studygroupfinder.model.StudyGroup;
import com.studygroup.studygroupfinder.model.User;
import com.studygroup.studygroupfinder.repository.GroupMemberRepository;
import com.studygroup.studygroupfinder.repository.StudyGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudyGroupService {

    private final StudyGroupRepository studyGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final NotificationService notificationService;
    private final AuthService authService;

    public StudyGroupService(StudyGroupRepository studyGroupRepository,
                             GroupMemberRepository groupMemberRepository,
                             NotificationService notificationService,
                             AuthService authService) {
        this.studyGroupRepository = studyGroupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.notificationService = notificationService;
        this.authService = authService;
    }

    public StudyGroup createGroup(CreateGroupRequest request, User owner) {
        StudyGroup group = new StudyGroup();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setCourseName(request.getCourseName());
        group.setMaxMembers(request.getMaxMembers());
        group.setVisibility(StudyGroup.Visibility.valueOf(request.getVisibility()));
        group.setOwnerEmail(owner.getEmail());
        group.setOwnerName(owner.getFullName());

        // Save the group first
        StudyGroup savedGroup = studyGroupRepository.save(group);

        // Add owner as a member
        GroupMember ownerMember = new GroupMember(savedGroup, owner.getEmail(), owner.getFullName(), GroupMember.Role.Owner);
        groupMemberRepository.save(ownerMember);

        return savedGroup;
    }

    public List<StudyGroup> getAllGroups() {
        return studyGroupRepository.findAll();
    }

    public List<StudyGroup> getGroupsByOwner(String ownerEmail) {
        return studyGroupRepository.findByOwnerEmail(ownerEmail);
    }

    public List<StudyGroup> getGroupsByMember(String userEmail) {
        return studyGroupRepository.findGroupsByMember(userEmail);
    }

    public Optional<StudyGroup> getGroupById(Long id) {
        return studyGroupRepository.findById(id);
    }

    public void deleteGroup(Long id, String userEmail) {
        StudyGroup group = studyGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getOwnerEmail().equals(userEmail)) {
            throw new RuntimeException("Only group owner can delete the group");
        }

        studyGroupRepository.delete(group);
    }

    public java.util.Map<String, Object> requestToJoinGroup(Long groupId, User user) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        java.util.Map<String, Object> result = new java.util.HashMap<>();

        // Check if user is already the owner or member
        if (group.getOwnerEmail() != null && group.getOwnerEmail().equalsIgnoreCase(user.getEmail())) {
            result.put("joined", true);
            result.put("alreadyMember", true);
            result.put("message", "You are the owner of this group");
            return result;
        }

        Optional<GroupMember> existingMember = groupMemberRepository.findByGroup_IdAndUserEmailIgnoreCase(groupId, user.getEmail());
        if (existingMember.isPresent()) {
            result.put("joined", true);
            result.put("alreadyMember", true);
            result.put("message", "You are already a member of this group");
            return result;
        }

        // Check if group is full
        Long memberCount = groupMemberRepository.countMembersByGroupId(groupId);
        if (group.getMaxMembers() != null && memberCount >= group.getMaxMembers()) {
            throw new RuntimeException("Group is full");
        }

        // Direct join immediately without putting on request
        GroupMember member = new GroupMember(group, user.getEmail(), user.getFullName());
        groupMemberRepository.save(member);
        result.put("joined", true);
        result.put("message", "Successfully joined the group! Chat is now open.");
        return result;
    }

    public void acceptJoinRequest(Long groupId, String requesterEmail, User owner) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getOwnerEmail().equalsIgnoreCase(owner.getEmail())) {
            throw new RuntimeException("Only group owner can accept requests");
        }

        // Check if already a member
        Optional<GroupMember> existingMember = groupMemberRepository.findByGroup_IdAndUserEmailIgnoreCase(groupId, requesterEmail);
        if (existingMember.isEmpty()) {
            // Check if group is full
            Long memberCount = groupMemberRepository.countMembersByGroupId(groupId);
            if (group.getMaxMembers() != null && memberCount >= group.getMaxMembers()) {
                throw new RuntimeException("Group is full");
            }

            // Add user to group
            User requester = authService.getUserByEmail(requesterEmail);
            String name = (requester != null && requester.getFullName() != null) ? requester.getFullName() : requesterEmail;
            GroupMember newMember = new GroupMember(group, requesterEmail, name);
            groupMemberRepository.save(newMember);
        }

        // Send acceptance notification
        notificationService.createAcceptanceNotification(owner, group, requesterEmail);
    }

    public void rejectJoinRequest(Long groupId, String requesterEmail, User owner) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getOwnerEmail().equalsIgnoreCase(owner.getEmail())) {
            throw new RuntimeException("Only group owner can reject requests");
        }

        // Send rejection notification
        notificationService.createRejectionNotification(owner, group, requesterEmail);
    }
}
