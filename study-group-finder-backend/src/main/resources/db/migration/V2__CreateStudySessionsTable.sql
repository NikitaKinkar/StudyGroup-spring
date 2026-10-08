-- Create study_sessions table
CREATE TABLE study_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    group_name VARCHAR(255) NOT NULL,
    creator_email VARCHAR(255) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    session_date DATETIME NOT NULL,
    session_time VARCHAR(10) NOT NULL,
    duration INT NOT NULL,
    meeting_type ENUM('ONLINE', 'IN_PERSON') NOT NULL,
    location VARCHAR(500),
    meeting_link VARCHAR(1000),
    notify_members BOOLEAN DEFAULT TRUE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_group_id (group_id),
    INDEX idx_creator_email (creator_email),
    INDEX idx_session_date (session_date),
    INDEX idx_session_date_time (session_date, session_time),
    INDEX idx_reminder_sent (reminder_sent),
    
    FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_email) REFERENCES users(email) ON DELETE CASCADE
);

-- Add session-related columns to notifications table
ALTER TABLE notifications 
ADD COLUMN session_id BIGINT,
ADD COLUMN session_title VARCHAR(200),
ADD INDEX idx_session_id (session_id),
ADD FOREIGN KEY (session_id) REFERENCES study_sessions(id) ON DELETE CASCADE;
