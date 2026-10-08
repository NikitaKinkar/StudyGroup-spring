package com.studygroup.studygroupfinder.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "group_members")
public class GroupMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Enumerated(EnumType.STRING)
    private Role role = Role.Member;

    @Column(name = "joined_at")
    private Timestamp joinedAt;

    public enum Role {
        Owner, Member
    }

    // Constructors
    public GroupMember() {
        this.joinedAt = new Timestamp(System.currentTimeMillis());
        this.role = Role.Member;
    }

    public GroupMember(StudyGroup group, String userEmail, String userName) {
        this();
        this.group = group;
        this.userEmail = userEmail;
        this.userName = userName;
    }

    public GroupMember(StudyGroup group, String userEmail, String userName, Role role) {
        this(group, userEmail, userName);
        this.role = role;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public StudyGroup getGroup() { return group; }
    public void setGroup(StudyGroup group) { this.group = group; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getEmail() { return userEmail; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getName() { return userName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Timestamp getJoinedAt() { return joinedAt; }
    public void setJoinedAt(Timestamp joinedAt) { this.joinedAt = joinedAt; }
}
