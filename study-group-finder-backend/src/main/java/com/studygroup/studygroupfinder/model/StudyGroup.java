package com.studygroup.studygroupfinder.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "study_groups")
public class StudyGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "course_name")
    private String courseName;

    @Column(name = "max_members")
    private Integer maxMembers = 100;

    @Enumerated(EnumType.STRING)
    private Visibility visibility = Visibility.Public;

    @Column(name = "owner_email", nullable = false)
    private String ownerEmail;

    @Column(name = "owner_name", nullable = false)
    private String ownerName;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private java.util.List<GroupMember> members = new java.util.ArrayList<>();

    public enum Visibility {
        Public, Private
    }

    // Constructors
    public StudyGroup() {
        this.createdAt = new Timestamp(System.currentTimeMillis());
        this.updatedAt = new Timestamp(System.currentTimeMillis());
        this.maxMembers = 100;
        this.visibility = Visibility.Public;
    }

    public StudyGroup(String name, String description, String courseName, String ownerEmail, String ownerName) {
        this();
        this.name = name;
        this.description = description;
        this.courseName = courseName;
        this.ownerEmail = ownerEmail;
        this.ownerName = ownerName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    public String getCourse() { return courseName; }

    public Integer getMaxMembers() { return maxMembers; }
    public void setMaxMembers(Integer maxMembers) { this.maxMembers = maxMembers; }
    public Integer getMax_members() { return maxMembers; }

    public Visibility getVisibility() { return visibility; }
    public void setVisibility(Visibility visibility) { this.visibility = visibility; }

    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
    public String getOwner_email() { return ownerEmail; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getOwner_name() { return ownerName; }

    public java.util.List<GroupMember> getMembers() { return members; }
    public void setMembers(java.util.List<GroupMember> members) { this.members = members; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }
}
