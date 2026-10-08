-- Study Group Finder Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS studygroup_db;
USE studygroup_db;

-- Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    university VARCHAR(255),
    passing_year INT,
    passing_gpa DECIMAL(3,2),
    profile_image_url VARCHAR(500),
    member_since YEAR DEFAULT (YEAR(CURRENT_DATE)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Courses Table
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor VARCHAR(255),
    duration VARCHAR(100),
    level VARCHAR(50),
    image_url VARCHAR(500),
    is_custom BOOLEAN DEFAULT FALSE,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_level (level),
    INDEX idx_is_custom (is_custom)
);

-- Study Groups Table
CREATE TABLE study_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    course_name VARCHAR(255),
    max_members INT DEFAULT 100,
    visibility ENUM('Public', 'Private') DEFAULT 'Public',
    owner_email VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_email) REFERENCES users(email),
    INDEX idx_owner (owner_email),
    INDEX idx_course (course_name),
    INDEX idx_visibility (visibility)
);

-- Group Members Table
CREATE TABLE group_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    role ENUM('Owner', 'Member') DEFAULT 'Member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_email) REFERENCES users(email),
    UNIQUE KEY unique_group_member (group_id, user_email),
    INDEX idx_group (group_id),
    INDEX idx_user (user_email)
);

-- Course Enrollments Table
CREATE TABLE course_enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    course_id BIGINT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (user_email) REFERENCES users(email),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE KEY unique_user_course (user_email, course_id),
    INDEX idx_user_enrollment (user_email),
    INDEX idx_course_enrollment (course_id)
);

-- Notifications Table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('group_join_request', 'group_join_accepted', 'group_join_rejected', 'chat_message') NOT NULL,
    sender_email VARCHAR(255),
    recipient_email VARCHAR(255) NOT NULL,
    group_id BIGINT,
    group_name VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_email) REFERENCES users(email),
    FOREIGN KEY (recipient_email) REFERENCES users(email),
    FOREIGN KEY (group_id) REFERENCES study_groups(id),
    INDEX idx_recipient (recipient_email),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Insert Sample Courses
INSERT INTO courses (title, description, instructor, duration, level, image_url, is_custom) VALUES
('Computer Science Engineering (AI & ML)', 'Learn programming, algorithms, data structures, and AI fundamentals.', 'Dr. Rajesh Kumar', '4 years', 'Undergraduate', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzY2NjY2NiIvPgo8cGF0aCBkPSJNMTAgMjBIMzBNMjAgMTBWMzAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=', FALSE),
('Computer Science Engineering (Cyber Security)', 'Focus on network security, cryptography, and cyber defense strategies.', 'Dr. Priya Sharma', '4 years', 'Undergraduate', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzMzNzMzNyIvPgo8cGF0aCBkPSJNMjAgMTJWMTZIMjJWMjBIMjBWMjRIMjJWMjBIMjZWMjRIMjhWMjBIMjZWMThIMjhWMjBIMzBWMThIMjhWMjBIMjhWMTZIMzBWMThIMjhWMTZIMzBWMThIMjhWMTJIMjZWMTZIMjhWMTJIMjZWMTBIMjJWMTJIMjBWMTBIMThWMTJIMTBWMTRIMThWMTZIMTBWMTJIMTBWMTBIMThWMTBIMjBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K', FALSE),
('Computer Science Engineering (Data Science)', 'Data analysis, machine learning, and big data technologies.', 'Dr. Amit Patel', '4 years', 'Undergraduate', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwN2JmZiIvPgo8Y2lyY2xlIGN4PSIxMCIgY3k9IjIwIiByPSIzIiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjE1IiByPSIzIiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjI1IiByPSIzIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTAgMjBMMjAgMTVMMzAgMjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=', FALSE),
('Electrical and Electronics Engineering', 'Power systems, electronics, and electrical machine design.', 'Dr. Suresh Reddy', '4 years', 'Undergraduate', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI2ZmNzAwMCIvPgo8cGF0aCBkPSJNMTAgMjBIMjBWMjVIMzBWMjBIMjVWMTBIMjBWMjBIMTVWMjVIMTBWMjBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K', FALSE),
('Electronics and Instrumentation Engineering', 'Process control, instrumentation, and measurement systems.', 'Dr. Anjali Nair', '4 years', 'Undergraduate', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwY2NjYyIvPgo8cmVjdCB4PSIxNSIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIyMCIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+', FALSE),
('Information Technology', 'Software development, networking, and IT infrastructure management.', 'Dr. Vikram Mehta', '4 years', 'Undergraduate', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwODA4MCIvPgo8cmVjdCB4PSI4IiB5PSIxMiIgd2lkdGg9IjI0IiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+', FALSE),
('Civil Engineering', 'Structural design, construction management, and infrastructure development.', 'Dr. Ramesh Kumar', '4 years', 'Undergraduate', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzg3NjkyNCIvPgo8cGF0aCBkPSJNMTAgMjBIMzBMMjUgMTBWMjBIMzBWMjBIMjVWMzBIMTBWMjBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K', FALSE),
('Master of Business Administration', 'Advanced business management, leadership, and strategic planning.', 'Dr. Sarah Johnson', '2 years', 'Postgraduate', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzgwMDA4MCIvPgo8cGF0aCBkPSJNMTAgMTBIMzBWMjBIMjVWMjVIMzBWMzBIMTBWMjVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K', FALSE),
('Bachelor of Business Administration', 'Business fundamentals, management principles, and entrepreneurship.', 'Dr. Michael Brown', '3 years', 'Undergraduate', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwMDA4MCIvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+', FALSE);
