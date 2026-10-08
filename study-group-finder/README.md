# Study Group Finder

A comprehensive study group finder application with course management, group creation, join requests, and real-time notifications.

## Features

### 🎓 Course Management
- Browse and enroll in engineering and professional courses
- Custom course creation with "Other" option
- Course filtering and search functionality
- Progress tracking for enrolled courses

### 👥 Study Groups
- Create study groups with customizable settings
- Request to join existing groups
- Group owner approval system
- Member management and group settings

### 🔔 Real-time Notifications
- Group join requests with accept/reject functionality
- Notification counter with unread indicators
- Persistent notification storage
- Cross-page notification system

### 👤 User Management
- Complete authentication system with forgot password
- Profile management with photo upload
- Academic information tracking
- Member since year display

### 🎨 Modern UI/UX
- Responsive design for all devices
- Clean and intuitive interface
- Smooth animations and transitions
- Accessible color scheme

## Technology Stack

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Storage**: LocalStorage for data persistence

## Available Courses

### Engineering Programs
- **CSE(AIML)** - Computer Science Engineering (AI & ML)
- **CSE(Cyber)** - Computer Science Engineering (Cyber Security)
- **CSE(DS)** - Computer Science Engineering (Data Science)
- **EEE** - Electrical and Electronics Engineering
- **EIE** - Electronics and Instrumentation Engineering
- **IT** - Information Technology
- **Civil** - Civil Engineering

### Business Programs
- **MBA** - Master of Business Administration
- **BBA** - Bachelor of Business Administration

### Custom Courses
- Users can create custom courses via "Other" option
- Personalized course management
- Dynamic course addition

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Application Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── groups/          # Group management
│   └── notifications/   # Notification system
├── pages/               # Application pages
└── lib/                # Utilities and configuration
```

## Data Storage

The application uses localStorage for data persistence:

- `studyconnect_user` - Current user session
- `studyconnect_users` - All registered users
- `studyconnect_groups` - Study groups data
- `studyconnect_enrolled_courses` - Course enrollments
- `studyconnect_custom_courses` - User-created courses
- `studyconnect_notifications` - Notification data

## Security Features

- Password hashing (production ready)
- Input validation and sanitization
- XSS protection
- Secure authentication flow
- Session management

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
