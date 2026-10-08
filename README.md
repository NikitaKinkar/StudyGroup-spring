# 🎓 StudyConnect — Collaborative Study Group & Peer Finder

A full-stack modern campus collaboration platform where students can find study groups, connect with syllabus-matched peers, schedule study sessions, and communicate in real time with interactive group chats and file sharing.

---
 Features

- **Personalized Student Dashboard**: Overview of enrolled groups, connected peers, quick chat links, and streak stats.
- **Study Groups Catalog**: Browse, search, filter by course/stream, create public/private study groups, and track member capacities.
- **Interactive Course Catalog**: Browse engineering and management syllabi, enroll in subjects, and find classmates.
- **Live Study Sessions & Calendar**: Interactive monthly calendar to schedule, manage, and join real-time study sprint workshops.
- **Real-Time Group Chat**: STOMP over WebSocket chat with message threads, replies, emojis, file attachments, and message history.
- **Secure Authentication**: JWT token-based authentication with bcrypt password encryption and session management.

---

# Tech Stack

### Frontend (`/study-group-finder`)
- **React 19** with Hooks & Modern State Management
- **Vite** for fast bundling and Hot Module Replacement
- **Tailwind CSS** for modern responsive UI styling
- **Lucide React** for icons
- **Axios** for REST API communication
- **SockJS & StompJS** for real-time WebSocket group chat

### Backend (`/study-group-finder-backend`)
- **Java 21**
- **Spring Boot 3.3.6**
- **Spring Data JPA & Hibernate**
- **Spring Security** with JWT Stateless Authentication
- **Spring WebSocket & STOMP**
- **MySQL 8.0**

---

