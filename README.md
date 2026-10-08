# 🎓 StudyConnect — Collaborative Study Group & Peer Finder

A full-stack modern campus collaboration platform where students can find study groups, connect with syllabus-matched peers, schedule study sessions, and communicate in real time with interactive group chats and file sharing.

---

## 🌟 Features

- **Personalized Student Dashboard**: Overview of enrolled groups, connected peers, quick chat links, and streak stats.
- **Study Groups Catalog**: Browse, search, filter by course/stream, create public/private study groups, and track member capacities.
- **Interactive Course Catalog**: Browse engineering and management syllabi, enroll in subjects, and find classmates.
- **Live Study Sessions & Calendar**: Interactive monthly calendar to schedule, manage, and join real-time study sprint workshops.
- **Real-Time Group Chat**: STOMP over WebSocket chat with message threads, replies, emojis, file attachments, and message history.
- **Secure Authentication**: JWT token-based authentication with bcrypt password encryption and session management.

---

## 🛠️ Tech Stack

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

## 🚀 Local Development Setup

### 1. Database Setup (MySQL)
Create database:
```sql
CREATE DATABASE studygroup_db;
```
Verify MySQL is running on `localhost:3306` with username `root` and password `root` (or update credentials in `application.properties`).

### 2. Run Backend (Spring Boot)
```bash
cd study-group-finder-backend
mvn clean spring-boot:run
```
Backend runs at `http://localhost:8080`.

### 3. Run Frontend (React Vite)
```bash
cd study-group-finder
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 🌐 Cloud Deployment Guide

### Deploying Frontend (Vercel / Netlify / GitHub Pages)
1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
3. Import the repository and select the **`study-group-finder`** root directory.
4. Set Build Command: `npm run build` and Output Directory: `dist`.
5. Set Environment Variable:
   - `VITE_API_URL`: `https://your-backend-domain.com/api`
   - `VITE_WS_URL`: `https://your-backend-domain.com/ws`

### Deploying Backend (Render / Railway / Koyeb)
1. In [Render](https://render.com/) or [Railway](https://railway.app/), create a **New Web Service** connected to your GitHub repo.
2. Select root directory: `study-group-finder-backend`.
3. Set Build Command: `mvn clean package -DskipTests`.
4. Set Start Command: `java -jar target/study-group-finder-backend-0.0.1-SNAPSHOT.jar`.
5. Add Environment Variables:
   - `SPRING_DATASOURCE_URL`: `jdbc:mysql://<host>:<port>/<db>?useSSL=true`
   - `SPRING_DATASOURCE_USERNAME`: `<db_user>`
   - `SPRING_DATASOURCE_PASSWORD`: `<db_password>`
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend-domain.vercel.app`

---

## 👤 Author & License
Developed for educational & collaborative study networks.
