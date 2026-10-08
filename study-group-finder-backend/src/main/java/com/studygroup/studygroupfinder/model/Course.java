package com.studygroup.studygroupfinder.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String instructor;

    private String duration;

    private String level;

    private String imageUrl;

    @Column(name = "is_custom")
    private Boolean isCustom = false;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at")
    private Timestamp createdAt;

    // Constructors
    public Course() {
        this.createdAt = new Timestamp(System.currentTimeMillis());
        this.isCustom = false;
    }

    public Course(String title, String description, String instructor, String duration, String level, String imageUrl) {
        this();
        this.title = title;
        this.description = description;
        this.instructor = instructor;
        this.duration = duration;
        this.level = level;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getInstructor() { return instructor; }
    public void setInstructor(String instructor) { this.instructor = instructor; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Boolean getIsCustom() { return isCustom; }
    public void setIsCustom(Boolean isCustom) { this.isCustom = isCustom; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
