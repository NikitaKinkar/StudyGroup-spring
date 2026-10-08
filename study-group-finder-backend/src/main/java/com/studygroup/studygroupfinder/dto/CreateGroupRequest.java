package com.studygroup.studygroupfinder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateGroupRequest {
    @NotBlank(message = "Group name is required")
    @Size(min = 3, max = 100, message = "Group name must be between 3 and 100 characters")
    private String name;

    private String description;

    @NotBlank(message = "Course is required")
    private String courseName;

    private Integer maxMembers = 100;

    private String visibility = "Public";

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    public void setCourse(String course) {
        if (this.courseName == null || this.courseName.trim().isEmpty()) {
            this.courseName = course;
        }
    }
    public String getCourse() { return courseName; }

    public Integer getMaxMembers() { return maxMembers; }
    public void setMaxMembers(Integer maxMembers) { this.maxMembers = maxMembers; }
    public void setMax_members(Object maxMembersObj) {
        if (maxMembersObj != null) {
            try {
                this.maxMembers = Integer.parseInt(maxMembersObj.toString());
            } catch (NumberFormatException ignored) {}
        }
    }
    public Integer getMax_members() { return maxMembers; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
}
