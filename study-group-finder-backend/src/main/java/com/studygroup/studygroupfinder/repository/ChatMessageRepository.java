package com.studygroup.studygroupfinder.repository;

import com.studygroup.studygroupfinder.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.group.id = ?1 ORDER BY cm.timestamp ASC")
    List<ChatMessage> findByGroupIdOrderByTimestampAsc(Long groupId);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.group.id = ?1 AND cm.timestamp >= ?2 ORDER BY cm.timestamp ASC")
    List<ChatMessage> findByGroupIdAndTimestampAfterOrderByTimestampAsc(Long groupId, java.sql.Timestamp timestamp);
    
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.group.id = ?1")
    Long countMessagesByGroupId(Long groupId);
}
