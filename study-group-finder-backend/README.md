# Study Group Finder Backend

A comprehensive Spring Boot backend API for the Study Group Finder application with MySQL database integration.

## Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Password encryption with BCrypt
- Profile management

### 👥 Study Groups
- Create study groups
- Join group requests with approval system
- Group member management
- Group deletion by owners

### 🎓 Course Management
- Pre-defined engineering and business courses
- Custom course creation
- Course enrollment tracking

### 🔔 Notifications
- Real-time notification system
- Group join requests
- Accept/reject notifications
- Unread count tracking

### 📊 Database
- MySQL database with comprehensive schema
- JPA/Hibernate ORM
- Proper relationships and constraints

## Technology Stack

- **Spring Boot 3.2.0**
- **Java 17**
- **MySQL 8.0**
- **Spring Security**
- **JWT Authentication**
- **Spring Data JPA**
- **Maven**

## Database Configuration

### Database Details
- **Database Name**: `studygroup_db`
- **Username**: `root`
- **Password**: `Dinesh@2005`
- **Port**: `3306`

### Setup Instructions

1. **Install MySQL** on your system
2. **Create Database**:
   ```sql
   CREATE DATABASE studygroup_db;
   ```
3. **Run Schema Script**: Execute the `schema.sql` file to create tables
4. **Update Configuration**: Verify `application.properties` settings

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/profile` - Get user profile

### Study Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create new group
- `GET /api/groups/{id}` - Get group by ID
- `DELETE /api/groups/{id}` - Delete group
- `POST /api/groups/{id}/join` - Request to join group
- `POST /api/groups/{id}/accept` - Accept join request
- `POST /api/groups/{id}/reject` - Reject join request
- `GET /api/groups/my-groups` - Get user's groups
- `GET /api/groups/owned` - Get owned groups

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread` - Get unread notifications
- `GET /api/notifications/unread-count` - Get unread count
- `POST /api/notifications/{id}/read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/{id}` - Delete notification

## Database Schema

### Tables
1. **users** - User information and profiles
2. **courses** - Available courses
3. **study_groups** - Study group details
4. **group_members** - Group membership information
5. **course_enrollments** - Course enrollment tracking
6. **notifications** - Notification system

## Running the Application

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd study-group-finder-backend
   ```

2. **Install Dependencies**:
   ```bash
   mvn clean install
   ```

3. **Run Application**:
   ```bash
   mvn spring-boot:run
   ```

4. **Access API**: `http://localhost:8080`

## Configuration

### application.properties
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/studygroup_db
spring.datasource.username=root
spring.datasource.password=Dinesh@2005

# JWT Configuration
jwt.secret=mySecretKey
jwt.expiration=86400000
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: BCrypt password hashing
- **CORS Configuration**: Cross-origin resource sharing
- **Input Validation**: Request validation with Jakarta Validation
- **SQL Injection Prevention**: JPA parameterized queries

## Sample Data

The schema.sql file includes sample courses:
- CSE(AIML), CSE(Cyber), CSE(DS)
- EEE, EIE, IT, Civil
- MBA, BBA

## Error Handling

- **Global Exception Handling**: Consistent error responses
- **Validation Errors**: Input validation feedback
- **Authentication Errors**: JWT validation messages
- **Resource Not Found**: 404 error handling

## Testing

- **Unit Tests**: Service layer testing
- **Integration Tests**: API endpoint testing
- **Security Tests**: Authentication and authorization

## Deployment

- **Docker Support**: Containerization ready
- **Environment Variables**: Configuration management
- **Production Ready**: Optimized for production deployment
