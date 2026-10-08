package com.studygroup.studygroupfinder.model;

import jakarta.persistence.*;
import java.time.Year;
import java.sql.Timestamp;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(name = "university")
    private String university;

    @Column(name = "passing_year")
    private Integer passingYear;

    @Column(name = "passing_gpa")
    private Double passingGpa;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "member_since")
    private Year memberSince;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    // Constructors
    public User() {
        this.createdAt = new Timestamp(System.currentTimeMillis());
        this.updatedAt = new Timestamp(System.currentTimeMillis());
        this.memberSince = Year.now();
    }

    public User(String fullName, String email, String passwordHash) {
        this();
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getFull_name() { return fullName; }
    public String getName() { return fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getUniversity() { return university; }
    public void setUniversity(String university) { this.university = university; }

    public Integer getPassingYear() { return passingYear; }
    public void setPassingYear(Integer passingYear) { this.passingYear = passingYear; }
    public Integer getPassing_year() { return passingYear; }

    public Double getPassingGpa() { return passingGpa; }
    public void setPassingGpa(Double passingGpa) { this.passingGpa = passingGpa; }
    public Double getPassing_gpa() { return passingGpa; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    public String getProfile_image_url() { return profileImageUrl; }

    public Year getMemberSince() { return memberSince; }
    public void setMemberSince(Year memberSince) { this.memberSince = memberSince; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }
}
