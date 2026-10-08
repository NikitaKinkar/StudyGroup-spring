import { useState, useEffect } from "react";
import InlineChat from "../groups/InlineChat";
import { MessageCircle, Search, BookOpen, Users, ArrowLeft } from "lucide-react";

const CourseChat = ({ user, onClose }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Load user's enrolled courses
  const loadCourses = () => {
    // Get all courses from localStorage or use mock data
    const allCourses = JSON.parse(localStorage.getItem("studyconnect_courses") || "[]");
    
    // Filter courses the user is enrolled in
    const enrolledCourses = allCourses.filter(course => 
      course.enrolledStudents && course.enrolledStudents.includes(user.email)
    );
    
    setCourses(enrolledCourses);
    setLoading(false);
    
    // Auto-select first course if available
    if (enrolledCourses.length > 0 && !selectedCourse) {
      setSelectedCourse(enrolledCourses[0]);
    }
  };

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Course Chat</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
                <BookOpen className="w-4 h-4" />
              </div>
              <p className="text-gray-500">Loading courses...</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Course Chat</h3>
            <p className="text-gray-500">Please wait while we set up your course chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Course List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Course Chat</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Course List */}
        <div className="flex-1 overflow-y-auto">
          {filteredCourses.length === 0 ? (
            <div className="p-4 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-gray-500">
                {searchTerm ? 'No courses found' : 'No enrolled courses'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {searchTerm ? 'Try a different search term' : 'Enroll in courses to start chatting'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`p-3 rounded-lg cursor-pointer transition-all mb-2 ${
                    selectedCourse?.id === course.id
                      ? 'bg-orange-50 border border-orange-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {course.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {course.courseCode} • {course.instructor}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {course.enrolledStudents?.length || 0} enrolled
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {courses.length} {courses.length === 1 ? 'Course' : 'Courses'} Enrolled
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {selectedCourse ? (
          <InlineChat 
            user={user} 
            group={{
              id: `course_${selectedCourse.id}`,
              name: selectedCourse.name,
              members: selectedCourse.enrolledStudents?.map(email => ({
                email: email,
                name: email.split('@')[0],
                fullName: email.split('@')[0]
              })) || [],
              owner_email: selectedCourse.instructor || 'system@course.com'
            }}
            isCourseChat={true}
            courseInfo={selectedCourse}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course</h3>
              <p className="text-gray-500">Choose a course from the left to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseChat;
