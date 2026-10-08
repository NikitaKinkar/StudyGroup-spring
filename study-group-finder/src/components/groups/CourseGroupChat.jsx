import { useState, useEffect, useRef } from "react";
import InlineChat from "./InlineChat";
import { MessageCircle, Search, BookOpen, Users, ArrowLeft, Send, Paperclip, MoreVertical, Reply, X, Smile, File, Download, Edit2, Trash2, Eye } from "lucide-react";

const CourseGroupChat = ({ user, onClose }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageReactions, setMessageReactions] = useState({});
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [previewingFile, setPreviewingFile] = useState(null);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Load user's enrolled courses
  const loadCourses = () => {
    // Get all courses from localStorage or use mock data
    let allCourses = JSON.parse(localStorage.getItem("studyconnect_courses") || "[]");
    
    // If no courses exist, create mock courses
    if (allCourses.length === 0) {
      allCourses = [
        {
          id: "course_1",
          name: "Data Structures and Algorithms",
          courseCode: "CSE-201",
          description: "Learn fundamental data structures and algorithms",
          enrolledStudents: [user.email, "dineshmatti707@gmail.com", "chethan707@gmail.com"],
          instructor: "Dr. Smith",
          schedule: "Mon-Wed-Fri 10:00 AM"
        },
        {
          id: "course_2",
          name: "Web Development",
          courseCode: "CSE-301",
          description: "Modern web development with React and Node.js",
          enrolledStudents: [user.email, "dineshmatti707@gmail.com"],
          instructor: "Prof. Johnson",
          schedule: "Tue-Thu 2:00 PM"
        },
        {
          id: "course_3",
          name: "Database Management Systems",
          courseCode: "CSE-401",
          description: "Database design and SQL programming",
          enrolledStudents: [user.email, "chethan707@gmail.com"],
          instructor: "Dr. Williams",
          schedule: "Mon-Wed 3:00 PM"
        }
      ];
      localStorage.setItem("studyconnect_courses", JSON.stringify(allCourses));
    }
    
    // Filter courses the user is enrolled in
    const enrolledCourses = allCourses.filter(course => 
      course.enrolledStudents && course.enrolledStudents.includes(user.email)
    );
    
    // If user is not enrolled in any courses, enroll them in some
    if (enrolledCourses.length === 0 && allCourses.length > 0) {
      // Enroll user in first 2 courses
      const updatedCourses = allCourses.map((course, index) => {
        if (index < 2) {
          return {
            ...course,
            enrolledStudents: [...(course.enrolledStudents || []), user.email]
          };
        }
        return course;
      });
      localStorage.setItem("studyconnect_courses", JSON.stringify(updatedCourses));
      
      // Get the enrolled courses again
      const newlyEnrolledCourses = updatedCourses.filter(course => 
        course.enrolledStudents && course.enrolledStudents.includes(user.email)
      );
      setCourses(newlyEnrolledCourses);
      setLoading(false);
      
      // Auto-select first course if available
      if (newlyEnrolledCourses.length > 0 && !selectedCourse) {
        setSelectedCourse(newlyEnrolledCourses[0]);
      }
    } else {
      setCourses(enrolledCourses);
      setLoading(false);
      
      // Auto-select first course if available
      if (enrolledCourses.length > 0 && !selectedCourse) {
        setSelectedCourse(enrolledCourses[0]);
      }
    }
  };

  // Load messages for selected course
  const loadMessages = () => {
    if (!selectedCourse) return;
    
    const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
    const courseGroupId = `course_${selectedCourse.id}`;
    const courseMessages = allMessages.filter(msg => msg.group_id === courseGroupId);
    
    // If no messages exist, add some mock messages
    if (courseMessages.length === 0) {
      const mockMessages = [
        {
          id: "msg_1",
          senderEmail: "dineshmatti707@gmail.com",
          senderName: "M.Dinesh",
          group_id: courseGroupId,
          group_name: selectedCourse.name,
          content: "Hello everyone! Welcome to the course group chat! 👋",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: "text"
        },
        {
          id: "msg_2", 
          senderEmail: "chethan707@gmail.com",
          senderName: "Chethan Kumar",
          group_id: courseGroupId,
          group_name: selectedCourse.name,
          content: "Hi! Excited to learn together in this course! 📚",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          type: "text"
        }
      ];
      
      // Add mock messages to localStorage
      const updatedMessages = [...allMessages, ...mockMessages];
      localStorage.setItem("studyconnect_messages", JSON.stringify(updatedMessages));
      setMessages(mockMessages);
    } else {
      setMessages(courseMessages);
    }
  };

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  useEffect(() => {
    loadMessages();
  }, [selectedCourse]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get user's full name for display
  const getUserFullName = () => {
    return user.fullName || user.name || 'User';
  };

  // Get enrolled student count
  const getStudentCount = (course) => {
    return (course.enrolledStudents || []).length;
  };

  // Get last message preview for course
  const getLastMessagePreview = (course) => {
    const courseGroupId = `course_${course.id}`;
    const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
    const courseMessages = allMessages.filter(msg => msg.group_id === courseGroupId);
    
    if (courseMessages.length === 0) return "No messages yet";
    const lastMessage = courseMessages[courseMessages.length - 1];
    if (lastMessage.type === 'file') {
      return `📎 ${lastMessage.fileName}`;
    }
    return lastMessage.content.length > 30 
      ? lastMessage.content.substring(0, 30) + "..."
      : lastMessage.content;
  };

  // Get sender name with overrides
  const getSenderName = (senderEmail) => {
    if (senderEmail === 'dineshmatti707@gmail.com') return 'M.Dinesh';
    if (senderEmail === 'chethan707@gmail.com') return 'Chethan Kumar';
    
    const users = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    const sender = users.find(u => u.email === senderEmail);
    return sender?.fullName || sender?.name || senderEmail.split('@')[0];
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result?.toString() || '');
        setShowPreview(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Send message
  const handleSendMessage = () => {
    if (!selectedCourse || (!message.trim() && !selectedFile)) return;

    const messageData = {
      id: Date.now().toString(),
      senderEmail: user.email,
      senderName: getSenderName(user.email),
      group_id: `course_${selectedCourse.id}`,
      group_name: selectedCourse.name,
      content: message.trim() || (selectedFile ? `📎 ${selectedFile.name}` : ''),
      timestamp: new Date().toISOString(),
      type: selectedFile ? 'file' : 'text',
      fileName: selectedFile?.name,
      fileSize: selectedFile?.size,
      fileType: selectedFile?.type,
      fileData: previewUrl,
      replyTo: replyingTo ? {
        id: replyingTo.id,
        senderName: replyingTo.senderName,
        content: replyingTo.content
      } : null
    };

    // Save to localStorage
    const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
    allMessages.push(messageData);
    localStorage.setItem("studyconnect_messages", JSON.stringify(allMessages));

    // Update local state
    setMessages([...messages, messageData]);
    setMessage("");
    setSelectedFile(null);
    setPreviewUrl("");
    setShowPreview(false);
    setReplyingTo(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle reply
  const handleReply = (msg) => {
    setReplyingTo(msg);
    setActiveMenu(null);
    // Focus on message input
    messageInputRef.current?.focus();
  };

  // Handle emoji reaction
  const handleEmojiReaction = (msgId, emoji) => {
    const reactions = { ...messageReactions };
    if (!reactions[msgId]) {
      reactions[msgId] = {};
    }
    
    // Toggle reaction for current user
    if (reactions[msgId][user.email] === emoji) {
      delete reactions[msgId][user.email];
    } else {
      reactions[msgId][user.email] = emoji;
    }
    
    setMessageReactions(reactions);
    setActiveMenu(null);
  };

  // Get emoji display
  const getEmojiDisplay = (emoji) => {
    const emojiMap = {
      'smile': '😊'
    };
    return emojiMap[emoji] || emoji;
  };

  // Get reaction count for message
  const getReactionCount = (msgId, emoji) => {
    const reactions = messageReactions[msgId] || {};
    return Object.values(reactions).filter(r => r === emoji).length;
  };

  // Cancel reply
  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Handle edit for file messages
  const handleEditFile = (msg) => {
    if (msg.senderEmail !== user.email) return;
    setEditingMessage(msg.id);
    setEditText(msg.content || "");
    setActiveMenu(null);
  };

  // Handle delete for file messages
  const handleDeleteFile = (msg) => {
    if (msg.senderEmail !== user.email) return;
    
    if (!confirm("Delete this message?")) return;
    
    const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
    const filteredMessages = allMessages.filter(m => m.id !== msg.id);
    localStorage.setItem("studyconnect_messages", JSON.stringify(filteredMessages));
    
    setMessages(messages.filter(m => m.id !== msg.id));
    setActiveMenu(null);
  };

  // Handle preview file
  const handlePreviewFile = (msg) => {
    setPreviewingFile(msg);
    setActiveMenu(null);
  };

  // Close file preview
  const handleClosePreview = () => {
    setPreviewingFile(null);
  };

  // Save edited message
  const handleSaveEdit = () => {
    if (!editingMessage || !editText.trim()) return;

    const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
    const messageIndex = allMessages.findIndex(m => m.id === editingMessage);
    
    if (messageIndex !== -1) {
      allMessages[messageIndex] = {
        ...allMessages[messageIndex],
        content: editText.trim(),
        edited: true,
        editedAt: new Date().toISOString()
      };
      
      localStorage.setItem("studyconnect_messages", JSON.stringify(allMessages));
      setMessages(allMessages.filter(m => m.group_id === `course_${selectedCourse.id}`));
    }
    
    setEditingMessage(null);
    setEditText("");
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
  };

  // Popular emojis for emoji bar
  const popularEmojis = [
    '😀', '😂', '😍', '🤔', '😎', '😢', '😡', '👍', '👎', '❤️', 
    '🎉', '🔥', '💯', '😊', '🙏', '💪', '👏', '🎯', '✨', '🚀',
    '💥', '⚡', '🌟', '💫', '🌈', '🌺', '🌸', '🌼', '🌻', '🍕',
    '🍔', '🍟', '🍰', '🎂', '☕', '🥤', '🍺', '🎵', '🎮', '⚽',
    '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🥊', '🎯', '🎪', '🎨'
  ];

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setMessage(prevMessage => prevMessage + emoji);
    messageInputRef.current?.focus();
  };

  // Toggle emoji bar
  const toggleEmojiBar = () => {
    setShowEmojiBar(!showEmojiBar);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!user) return null;

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-orange-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <h1 className="text-lg font-bold">Course Groups Chat</h1>
          </div>
        </div>
        <div className="text-sm">
          {getUserFullName()}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Courses List */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              />
            </div>
          </div>

          {/* Courses List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading courses...
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? "No courses found" : "No courses enrolled yet"}
              </div>
            ) : (
              <div className="p-2">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                      selectedCourse?.id === course.id
                        ? "bg-orange-100 border-orange-300 border"
                        : "bg-white hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {course.courseCode?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {course.name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {getStudentCount(course)} students
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {course.courseCode}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {getLastMessagePreview(course)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="flex-1 bg-white flex flex-col min-w-0">
          {selectedCourse ? (
            <>
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold">
                    {selectedCourse.courseCode?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {selectedCourse.name}
                    </h2>
                    <p className="text-sm text-white/80">
                      {selectedCourse.courseCode} • {getStudentCount(selectedCourse)} students
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No messages yet
                      </h3>
                      <p className="text-gray-500">
                        Start the conversation with your coursemates!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderEmail === user.email ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${msg.senderEmail === user.email ? 'order-2' : 'order-1'}`}>
                          <div className={`px-4 py-2 rounded-lg relative ${
                            msg.senderEmail === user.email
                              ? 'bg-orange-500 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}>
                            {/* Three dots menu */}
                            <button
                              onClick={() => setActiveMenu(activeMenu === msg.id ? null : msg.id)}
                              className={`absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors ${
                                msg.senderEmail === user.email ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                              }`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown menu */}
                            {activeMenu === msg.id && (
                              <div className={`absolute top-8 right-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 ${
                                msg.senderEmail === user.email ? 'right-0' : 'right-0'
                              }`}>
                                <button
                                  onClick={() => handleReply(msg)}
                                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <Reply className="w-4 h-4" />
                                  <span>Reply</span>
                                </button>
                                {msg.type === 'file' && (
                                  <button
                                    onClick={() => handlePreviewFile(msg)}
                                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>Preview</span>
                                  </button>
                                )}
                                {msg.senderEmail === user.email && (
                                  <>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                      onClick={() => handleEditFile(msg)}
                                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteFile(msg)}
                                      className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span>Delete</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}

                            {msg.senderEmail !== user.email && (
                              <p className="text-xs font-semibold text-gray-600 mb-1">
                                {msg.senderName}
                              </p>
                            )}
                            {msg.replyTo && (
                              <div className="mb-2 p-2 bg-white/10 rounded-lg border-l-2 border-white/30">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Reply className="w-3 h-3 text-white/70" />
                                  <span className="text-xs text-white/70">Replying to {msg.replyTo.senderName}</span>
                                </div>
                                <p className="text-xs text-white/60 italic">{msg.replyTo.content}</p>
                              </div>
                            )}
                            {msg.type === 'file' ? (
                              <div>
                                {msg.fileType?.startsWith('image/') ? (
                                  <img src={msg.fileData} alt={msg.fileName} className="max-w-full rounded-lg mb-2" />
                                ) : msg.fileType?.startsWith('video/') ? (
                                  <video src={msg.fileData} controls className="max-w-full rounded-lg mb-2" />
                                ) : (
                                  <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                                    <File className="w-8 h-8 text-gray-400" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-700">{msg.fileName}</p>
                                      <p className="text-xs text-gray-500">
                                        {msg.fileSize ? `${(msg.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Document'}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = msg.fileData;
                                        link.download = msg.fileName;
                                        link.click();
                                      }}
                                      className="p-2 text-orange-500 hover:text-orange-600 bg-orange-50 rounded-full transition-colors"
                                      title="Download"
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : editingMessage === msg.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-white/30 rounded bg-white/20 text-white placeholder-white/70"
                                  placeholder="Edit message..."
                                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                />
                                <div className="flex space-x-2">
                                  <button
                                    onClick={handleSaveEdit}
                                    className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-white"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-white"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm">{msg.content}</p>
                            )}
                            {/* Message reactions */}
                            {messageReactions[msg.id] && Object.keys(messageReactions[msg.id]).length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {(() => {
                                  const grouped = {};
                                  Object.entries(messageReactions[msg.id]).forEach(([_, emoji]) => {
                                    if (!grouped[emoji]) grouped[emoji] = [];
                                    grouped[emoji].push(emoji);
                                  });
                                  return Object.entries(grouped).map(([emoji, reactions]) => (
                                    <div
                                      key={emoji}
                                      className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                                    >
                                      <span>{getEmojiDisplay(emoji)}</span>
                                      <span className="text-gray-600">{reactions.length}</span>
                                    </div>
                                  ));
                                })()}
                              </div>
                            )}
                            <p className={`text-xs mt-1 ${
                              msg.senderEmail === user.email ? 'text-orange-100' : 'text-gray-500'
                            }`}>
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 px-4 py-3">
                {/* Reply indicator */}
                {replyingTo && (
                  <div className="mb-3 p-2 bg-gray-100 rounded-lg border-l-2 border-orange-400">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Reply className="w-3 h-3 text-orange-500" />
                        <span className="text-xs text-orange-600 font-medium">Replying to {replyingTo.senderName}</span>
                      </div>
                      <button
                        onClick={handleCancelReply}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">{replyingTo.content}</p>
                  </div>
                )}
                
                {showPreview && (
                  <div className="mb-3 p-2 bg-gray-100 rounded-lg">
                    {selectedFile?.type.startsWith('image/') ? (
                      <img src={previewUrl} alt="Preview" className="max-w-full h-32 object-cover rounded" />
                    ) : selectedFile?.type.startsWith('video/') ? (
                      <video src={previewUrl} className="max-w-full h-32 object-cover rounded" />
                    ) : (
                      <div className="flex items-center space-x-3">
                        <File className="w-8 h-8 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = previewUrl;
                            link.download = selectedFile.name;
                            link.click();
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl("");
                        setShowPreview(false);
                      }}
                      className="mt-2 text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.mp3,.mp4,.mov,.avi,.jpg,.jpeg,.png,.gif,.bmp"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-orange-500 transition-colors"
                    title="Send document"
                  >
                    <File className="w-5 h-5" />
                  </button>
                  <button
                    onClick={toggleEmojiBar}
                    className="p-2 text-gray-500 hover:text-orange-500 transition-colors"
                    title="Add emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    ref={messageInputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={replyingTo ? "Type a reply..." : "Type a message..."}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() && !selectedFile}
                    className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Emoji Bar */}
                {showEmojiBar && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-10 gap-2">
                      {popularEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="text-2xl hover:bg-gray-200 rounded p-1 transition-colors"
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Select a course to start chatting
                </h3>
                <p className="text-gray-500">
                  Choose a course from the left panel to view and send messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {previewingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5" />
                <h3 className="text-lg font-semibold">{previewingFile.fileName}</h3>
              </div>
              <button
                onClick={handleClosePreview}
                className="p-2 hover:bg-orange-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {previewingFile.fileType?.startsWith('image/') ? (
                <div className="space-y-4">
                  <img src={previewingFile.fileData} alt={previewingFile.fileName} className="max-w-full h-auto mx-auto rounded-lg" />
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Image: {previewingFile.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {previewingFile.fileSize ? `Size: ${(previewingFile.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
                    </p>
                  </div>
                </div>
              ) : previewingFile.fileType?.startsWith('video/') ? (
                <div className="space-y-4">
                  <video src={previewingFile.fileData} controls className="max-w-full h-auto mx-auto rounded-lg">
                    Your browser does not support the video tag.
                  </video>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Video: {previewingFile.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {previewingFile.fileSize ? `Size: ${(previewingFile.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
                    </p>
                  </div>
                </div>
              ) : previewingFile.fileType?.includes('pdf') ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <File className="w-8 h-8 text-red-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700">PDF Document</h4>
                  <p className="text-gray-600 mb-4">{previewingFile.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {previewingFile.fileSize ? `Size: ${(previewingFile.fileSize / 1024 / 1024).toFixed(2)} MB` : 'PDF File'}
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewingFile.fileData;
                        link.download = previewingFile.fileName;
                        link.click();
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Download
                    </button>
                    {previewingFile.senderEmail === user.email && (
                      <button
                        onClick={() => {
                          if (confirm("Delete this file?")) {
                            const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
                            const filteredMessages = allMessages.filter(m => m.id !== previewingFile.id);
                            localStorage.setItem("studyconnect_messages", JSON.stringify(filteredMessages));
                            setMessages(messages.filter(m => m.id !== previewingFile.id));
                            setPreviewingFile(null);
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ) : previewingFile.fileType?.includes('word') || previewingFile.fileType?.includes('document') ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <File className="w-8 h-8 text-blue-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700">Word Document</h4>
                  <p className="text-gray-600 mb-4">{previewingFile.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {previewingFile.fileSize ? `Size: ${(previewingFile.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Document File'}
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewingFile.fileData;
                        link.download = previewingFile.fileName;
                        link.click();
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Download
                    </button>
                    {previewingFile.senderEmail === user.email && (
                      <button
                        onClick={() => {
                          if (confirm("Delete this file?")) {
                            const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
                            const filteredMessages = allMessages.filter(m => m.id !== previewingFile.id);
                            localStorage.setItem("studyconnect_messages", JSON.stringify(filteredMessages));
                            setMessages(messages.filter(m => m.id !== previewingFile.id));
                            setPreviewingFile(null);
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ) : previewingFile.fileType?.includes('excel') || previewingFile.fileType?.includes('spreadsheet') ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <File className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700">Excel Spreadsheet</h4>
                  <p className="text-gray-600 mb-4">{previewingFile.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {previewingFile.fileSize ? `Size: ${(previewingFile.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Spreadsheet File'}
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewingFile.fileData;
                        link.download = previewingFile.fileName;
                        link.click();
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Download
                    </button>
                    {previewingFile.senderEmail === user.email && (
                      <button
                        onClick={() => {
                          if (confirm("Delete this file?")) {
                            const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
                            const filteredMessages = allMessages.filter(m => m.id !== previewingFile.id);
                            localStorage.setItem("studyconnect_messages", JSON.stringify(filteredMessages));
                            setMessages(messages.filter(m => m.id !== previewingFile.id));
                            setPreviewingFile(null);
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ) : previewingFile.fileType?.includes('powerpoint') || previewingFile.fileType?.includes('presentation') ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <File className="w-8 h-8 text-orange-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700">PowerPoint Presentation</h4>
                  <p className="text-gray-600 mb-4">{previewingFile.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {previewingFile.fileSize ? `Size: ${(previewingFile.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Presentation File'}
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewingFile.fileData;
                        link.download = previewingFile.fileName;
                        link.click();
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Download
                    </button>
                    {previewingFile.senderEmail === user.email && (
                      <button
                        onClick={() => {
                          if (confirm("Delete this file?")) {
                            const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
                            const filteredMessages = allMessages.filter(m => m.id !== previewingFile.id);
                            localStorage.setItem("studyconnect_messages", JSON.stringify(filteredMessages));
                            setMessages(messages.filter(m => m.id !== previewingFile.id));
                            setPreviewingFile(null);
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ) : previewingFile.fileType?.includes('audio') ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <File className="w-8 h-8 text-purple-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700">Audio File</h4>
                  <p className="text-gray-600 mb-4">{previewingFile.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {previewingFile.fileSize ? `Size: ${(previewingFile.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Audio File'}
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewingFile.fileData;
                        link.download = previewingFile.fileName;
                        link.click();
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Download
                    </button>
                    {previewingFile.senderEmail === user.email && (
                      <button
                        onClick={() => {
                          if (confirm("Delete this file?")) {
                            const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
                            const filteredMessages = allMessages.filter(m => m.id !== previewingFile.id);
                            localStorage.setItem("studyconnect_messages", JSON.stringify(filteredMessages));
                            setMessages(messages.filter(m => m.id !== previewingFile.id));
                            setPreviewingFile(null);
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ) : previewingFile.fileType?.includes('zip') || previewingFile.fileType?.includes('compressed') ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                    <File className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700">Compressed File</h4>
                  <p className="text-gray-600 mb-4">{previewingFile.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {previewingFile.fileSize ? `Size: ${(previewingFile.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Compressed File'}
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewingFile.fileData;
                        link.download = previewingFile.fileName;
                        link.click();
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Download
                    </button>
                    {previewingFile.senderEmail === user.email && (
                      <button
                        onClick={() => {
                          if (confirm("Delete this file?")) {
                            const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
                            const filteredMessages = allMessages.filter(m => m.id !== previewingFile.id);
                            localStorage.setItem("studyconnect_messages", JSON.stringify(filteredMessages));
                            setMessages(messages.filter(m => m.id !== previewingFile.id));
                            setPreviewingFile(null);
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <File className="w-8 h-8 text-gray-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700">File</h4>
                  <p className="text-gray-600 mb-4">{previewingFile.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {previewingFile.fileSize ? `Size: ${(previewingFile.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown File Type'}
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewingFile.fileData;
                        link.download = previewingFile.fileName;
                        link.click();
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Download
                    </button>
                    {previewingFile.senderEmail === user.email && (
                      <button
                        onClick={() => {
                          if (confirm("Delete this file?")) {
                            const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
                            const filteredMessages = allMessages.filter(m => m.id !== previewingFile.id);
                            localStorage.setItem("studyconnect_messages", JSON.stringify(filteredMessages));
                            setMessages(messages.filter(m => m.id !== previewingFile.id));
                            setPreviewingFile(null);
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <p>Sender: {previewingFile.senderName}</p>
                  <p>Time: {formatTime(previewingFile.timestamp)}</p>
                </div>
                {previewingFile.content && (
                  <div className="text-right">
                    <p className="font-medium">Caption:</p>
                    <p>{previewingFile.content}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseGroupChat;
