import { useState, useEffect } from "react";
import { createPageUrl } from "@/utils/index.js";
import TopBar from "../components/dashboard/TopBar";
import Sidebar from "../components/dashboard/Sidebar";
import NotificationBar from "../components/notifications/NotificationBar";
import ChatNotificationBar from "../components/notifications/ChatNotificationBar";
import InlineChat from "../components/groups/InlineChat";
import { BookOpen, Users, Clock, Star, CheckCircle, X, User, MessageCircle, Trash2 } from "lucide-react";
import { coursesApi } from "@/services/api";

const COURSES_DATA = [
  {
    id: "cse",
    title: "Computer Science Engineering",
    description: "Learn programming, algorithms, data structures, and software development fundamentals.",
    instructor: "Dr. Rajesh Kumar",
    duration: "4 years",
    level: "Undergraduate",
    enrolled: 320,
    rating: 4.7,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad1)' width='400' height='200'/%3E%3Ctext x='50%25' y='40%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='24' font-weight='bold'%3ECSE%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='14' opacity='0.9'%3EProgramming • Algorithms • Software%3C/text%3E%3C/svg%3E",
    topics: ["Programming", "Data Structures", "Algorithms", "Software Engineering", "Database", "Web Development"],
    price: "Free"
  },
  {
    id: "aiml",
    title: "Artificial Intelligence & Machine Learning",
    description: "Master AI concepts, machine learning algorithms, deep learning, and neural networks.",
    instructor: "Dr. Priya Sharma",
    duration: "4 years",
    level: "Undergraduate",
    enrolled: 280,
    rating: 4.8,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Cdefs%3E%3ClinearGradient id='grad2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f093fb;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23f5576c;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad2)' width='400' height='200'/%3E%3Ctext x='50%25' y='40%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='24' font-weight='bold'%3EAIML%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='14' opacity='0.9'%3EAI • Machine Learning • Deep Learning%3C/text%3E%3C/svg%3E",
    topics: ["AI Fundamentals", "Machine Learning", "Deep Learning", "Neural Networks", "Python", "Data Science"],
    price: "Free"
  },
  {
    id: "eee",
    title: "Electrical and Electronics Engineering",
    description: "Study electrical circuits, power systems, electronics, and renewable energy technologies.",
    instructor: "Dr. Anand Reddy",
    duration: "4 years",
    level: "Undergraduate",
    enrolled: 245,
    rating: 4.6,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Cdefs%3E%3ClinearGradient id='grad3' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234facfe;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2300f2fe;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad3)' width='400' height='200'/%3E%3Ctext x='50%25' y='40%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='24' font-weight='bold'%3EEEE%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='14' opacity='0.9'%3EElectrical • Electronics • Power Systems%3C/text%3E%3C/svg%3E",
    topics: ["Electrical Circuits", "Electronics", "Power Systems", "Control Systems", "Renewable Energy", "Signal Processing"],
    price: "Free"
  },
  {
    id: "it",
    title: "Information Technology",
    description: "Learn network security, database management, cloud computing, and IT infrastructure.",
    instructor: "Dr. Suresh Babu",
    duration: "4 years",
    level: "Undergraduate",
    enrolled: 267,
    rating: 4.7,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Cdefs%3E%3ClinearGradient id='grad4' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23fa709a;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23fee140;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad4)' width='400' height='200'/%3E%3Ctext x='50%25' y='40%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='24' font-weight='bold'%3EIT%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='14' opacity='0.9'%3ENetworks • Security • Cloud Computing%3C/text%3E%3C/svg%3E",
    topics: ["Network Security", "Database Management", "Cloud Computing", "IT Infrastructure", "Cybersecurity", "Web Development"],
    price: "Free"
  },
  {
    id: "eie",
    title: "Electronics and Instrumentation Engineering",
    description: "Study electronic devices, instrumentation, control systems, and industrial automation.",
    instructor: "Dr. Lakshmi Narayanan",
    duration: "4 years",
    level: "Undergraduate",
    enrolled: 198,
    rating: 4.5,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Cdefs%3E%3ClinearGradient id='grad5' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2330cfd0;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23330868;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad5)' width='400' height='200'/%3E%3Ctext x='50%25' y='40%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='24' font-weight='bold'%3EEIE%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='14' opacity='0.9'%3EElectronics • Instrumentation • Control%3C/text%3E%3C/svg%3E",
    topics: ["Electronic Devices", "Instrumentation", "Control Systems", "Industrial Automation", "Sensors", "Signal Processing"],
    price: "Free"
  }
];

export default function Courses() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("studyconnect_user") || "null");
    } catch (e) {
      return null;
    }
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [customCourses, setCustomCourses] = useState([]);
  const [showCustomCourseInput, setShowCustomCourseInput] = useState(false);
  const [customCourseName, setCustomCourseName] = useState("");
  const [chatCourseId, setChatCourseId] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("studyconnect_user");
    if (!stored || !sessionStorage.getItem("studyconnect_token")) { window.location.href = createPageUrl("Auth"); return; }
    setUser(JSON.parse(stored));

    // Load enrolled courses
    const enrolled = JSON.parse(localStorage.getItem("studyconnect_enrolled_courses") || "[]");
    setEnrolledCourses(enrolled);

    // Load custom courses from backend or fallback to local
    const loadCourses = async () => {
      try {
        const backendCourses = await coursesApi.getCustom();
        if (Array.isArray(backendCourses) && backendCourses.length > 0) {
          const formatted = backendCourses.map(c => ({
            id: c.id?.toString() || `custom-${Date.now()}`,
            title: c.title,
            description: c.description || `Custom course: ${c.title}`,
            instructor: c.instructor || "Custom Instructor",
            duration: c.duration || "Self-paced",
            level: c.level || "Custom",
            enrolled: 0,
            rating: 0,
            image: c.imageUrl || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Cdefs%3E%3ClinearGradient id='grad-custom' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238b5cf6;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23ec4899;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad-custom)' width='400' height='200'/%3E%3Ctext x='50%25' y='40%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='24' font-weight='bold'%3E${encodeURIComponent(c.title)}%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='14' opacity='0.9'%3ECustom Course%3C/text%3E%3C/svg%3E`,
            topics: ["Custom Topics"],
            price: "Free",
            isCustom: true
          }));
          setCustomCourses(formatted);
          localStorage.setItem("studyconnect_custom_courses", JSON.stringify(formatted));
          return;
        }
      } catch (err) {
        console.warn("Could not fetch custom courses from backend:", err.message);
      }
      const storedCustomCourses = JSON.parse(localStorage.getItem("studyconnect_custom_courses") || "[]");
      setCustomCourses(storedCustomCourses);
    };

    loadCourses();
  }, []);

  const handleAddCustomCourse = async () => {
    if (!customCourseName.trim()) {
      alert("Please enter a course name");
      return;
    }

    try {
      await coursesApi.create({
        title: customCourseName,
        description: `Custom course: ${customCourseName}`,
        instructor: user?.full_name || "Custom Instructor",
        duration: "Self-paced",
        level: "Undergraduate",
        imageUrl: "",
        isCustom: true
      });
    } catch (err) {
      console.warn("Could not save course to backend:", err.message);
    }

    const newCustomCourse = {
      id: `custom-${Date.now()}`,
      title: customCourseName,
      description: `Custom course: ${customCourseName}`,
      instructor: "Custom Instructor",
      duration: "Custom",
      level: "Custom",
      enrolled: 0,
      rating: 0,
      image: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Cdefs%3E%3ClinearGradient id='grad-custom' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238b5cf6;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23ec4899;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad-custom)' width='400' height='200'/%3E%3Ctext x='50%25' y='40%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='24' font-weight='bold'%3E${encodeURIComponent(customCourseName)}%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='14' opacity='0.9'%3ECustom Course%3C/text%3E%3C/svg%3E`,
      topics: ["Custom Topics"],
      price: "Free",
      isCustom: true
    };

    const updatedCustomCourses = [...customCourses, newCustomCourse];
    setCustomCourses(updatedCustomCourses);
    localStorage.setItem("studyconnect_custom_courses", JSON.stringify(updatedCustomCourses));
    
    setCustomCourseName("");
    setShowCustomCourseInput(false);
    
    alert(`Custom course "${customCourseName}" added successfully!`);
  };

  const handleDisenroll = (courseId) => {
    if (!confirm("Are you sure you want to leave this course?")) return;
    
    const updatedEnrollments = enrolledCourses.filter(c => c.id !== courseId);
    setEnrolledCourses(updatedEnrollments);
    localStorage.setItem("studyconnect_enrolled_courses", JSON.stringify(updatedEnrollments));
    
    alert("You have successfully left the course.");
  };

  const handleEnroll = (course) => {
    // Check if already enrolled
    if (enrolledCourses.some(c => c.id === course.id)) {
      alert("You are already enrolled in this course!");
      return;
    }

    // Add to enrolled courses
    const newEnrollment = {
      ...course,
      enrolledAt: new Date().toISOString(),
      progress: 0
    };
    
    const updatedEnrollments = [...enrolledCourses, newEnrollment];
    setEnrolledCourses(updatedEnrollments);
    localStorage.setItem("studyconnect_enrolled_courses", JSON.stringify(updatedEnrollments));
    
    alert(`Successfully enrolled in ${course.title}!`);
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(c => c.id === courseId);
  };

  const allCourses = [...COURSES_DATA, ...customCourses];
  
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans">
      <TopBar user={user} extraContent={<NotificationBar user={user} />} />
      <div className="flex">
        <Sidebar currentPage="Courses" user={user} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto">
          <div>
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                Academic Courses <span className="text-orange-500">•</span> Catalog
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explore campus courses, track your curriculum progress, and collaborate in course discussions.
              </p>
            </div>

            {/* Modern Search and Filters */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 mb-8 flex flex-col md:flex-row gap-3">
              <div className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/70 focus-within:bg-white border border-slate-200/80 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 rounded-xl px-3.5 py-2 flex-1 transition-all">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses by title, topic, or instructor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 outline-none placeholder:text-slate-400 font-medium"
                />
              </div>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100/80 cursor-pointer"
              >
                <option value="All">All Course Levels</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* My Enrollments */}
            {enrolledCourses.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Enrolled Courses</span>
                    <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">
                      {enrolledCourses.length}
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map(course => (
                    <div key={course.id} className="bg-white rounded-2xl shadow-xs border border-emerald-200/70 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                      <div>
                        <div className="relative">
                          <img src={course.image} alt={course.title} className="w-full h-36 object-cover" />
                          <div className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm">
                            <CheckCircle className="w-3 h-3" />
                            Enrolled
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-slate-900 text-base leading-snug mb-1">{course.title}</h3>
                          <p className="text-xs text-slate-500 mb-3 font-medium">{course.instructor}</p>
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {course.duration}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-semibold text-slate-600">{course.level}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 pt-0">
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            {new Date(course.enrolledAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setChatCourseId(course.id)}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Chat
                            </button>
                            <button
                              onClick={() => handleDisenroll(course.id)}
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-xl text-xs font-medium transition"
                            >
                              Leave
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Courses */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">All Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <div key={course.id} className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="relative overflow-hidden">
                        <img src={course.image} alt={course.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[11px] font-semibold">
                          {course.level}
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-orange-600 transition-colors mb-1.5">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                          {course.description}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            {course.instructor}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {course.duration}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-extrabold text-orange-600">{course.price}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-bold text-slate-700">{course.rating}</span>
                            <span className="text-[11px] text-slate-400">({course.enrolled})</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {course.topics.slice(0, 3).map((topic, index) => (
                            <span key={index} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        onClick={() => handleEnroll(course)}
                        disabled={isEnrolled(course.id)}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-sm ${
                          isEnrolled(course.id)
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed"
                            : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20 hover:shadow-md"
                        }`}
                      >
                        {isEnrolled(course.id) ? "Already Enrolled" : "Enroll in Course"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No courses found matching your criteria.</p>
                </div>
              )}

              {/* Other Course Option */}
              <div className="mt-8">
                {!showCustomCourseInput ? (
                  <button
                    onClick={() => setShowCustomCourseInput(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-400 hover:text-orange-500 transition"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      <span className="font-medium">Other - Add Custom Course</span>
                    </div>
                  </button>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Course</h3>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Enter your course name..."
                        value={customCourseName}
                        onChange={(e) => setCustomCourseName(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomCourse()}
                      />
                      <button
                        onClick={handleAddCustomCourse}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium transition"
                      >
                        Add Course
                      </button>
                      <button
                        onClick={() => {
                          setShowCustomCourseInput(false);
                          setCustomCourseName("");
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-medium transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {chatCourseId && (
        <InlineChat 
          group={{
            id: chatCourseId,
            name: COURSES_DATA.find(c => c.id === chatCourseId)?.title || customCourses.find(c => c.id === chatCourseId)?.title || 'Course Chat',
            course: COURSES_DATA.find(c => c.id === chatCourseId)?.title || customCourses.find(c => c.id === chatCourseId)?.title || 'Course',
            members: enrolledCourses.filter(c => c.id === chatCourseId).map(() => ({ email: user.email, name: user.fullName || user.name }))
          }}
          user={user} 
          onClose={() => setChatCourseId(null)}
        />
      )}
      
      <ChatNotificationBar user={user} />
    </div>
  );
}