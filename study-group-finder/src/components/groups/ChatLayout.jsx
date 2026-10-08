import { useState, useEffect, useRef } from "react";
import { MessageCircle, Search, Users, Plus, ArrowLeft, BookOpen, Send, Paperclip, File, X, MoreVertical, Reply, Edit2, Trash2, Eye, Smile, Download } from "lucide-react";
import { chatApi, groupsApi } from "@/services/api";
import websocketService from "../../services/websocketService";

const ChatLayout = ({ user, onClose, groupId }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [previewingFile, setPreviewingFile] = useState(null);
  const [showEmojiBar, setShowEmojiBar] = useState(false);

  // Load user's groups
  const loadGroups = async () => {
    const userEmail = user?.email?.toLowerCase();
    let allGroups = [];
    try {
      const serverGroups = await groupsApi.getAll();
      if (Array.isArray(serverGroups)) {
        allGroups = serverGroups;
        localStorage.setItem("studyconnect_groups", JSON.stringify(serverGroups));
      }
    } catch (e) {
      allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
    }

    if (allGroups.length === 0) {
      allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
    }

    const userGroups = allGroups.filter(g => {
      const owner = (g.owner_email || g.ownerEmail || '').toLowerCase();
      const isOwner = userEmail && owner === userEmail;
      const isMember = (g.members || []).some(m => (m.email || m.userEmail || '').toLowerCase() === userEmail);
      return isOwner || isMember;
    });

    setGroups(userGroups);
    setLoading(false);
    
    // Select specific group if groupId is provided, otherwise auto-select first group
    if (userGroups.length > 0 && !selectedGroup) {
      if (groupId && groupId !== "all") {
        const specificGroup = userGroups.find(g => String(g.id) === String(groupId));
        if (specificGroup) {
          setSelectedGroup(specificGroup);
        } else {
          setSelectedGroup(userGroups[0]);
        }
      } else {
        setSelectedGroup(userGroups[0]);
      }
    }
  };

  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup]);

  // Load messages for passed group
  const loadMessages = async () => {
    if (!selectedGroup) return;

    try {
      const serverMessages = await chatApi.getHistory(selectedGroup.id, user.email);
      if (Array.isArray(serverMessages)) {
        const formatted = serverMessages.map(m => ({
          id: m.id,
          senderEmail: m.senderEmail || m.sender_email,
          senderName: m.senderName || m.sender_name || (m.senderEmail ? m.senderEmail.split('@')[0] : 'User'),
          group_id: `group_${selectedGroup.id}`,
          groupId: selectedGroup.id,
          group_name: selectedGroup.name,
          content: m.content || m.message || '',
          type: (m.fileUrl || m.file_url) ? 'file' : ((m.messageType || m.type || 'text').toLowerCase()),
          fileName: m.fileName || m.file_name,
          fileUrl: m.fileUrl || m.file_url,
          fileData: m.fileUrl || m.file_url,
          fileType: m.fileType || m.file_type,
          fileSize: m.fileSize || m.file_size,
          timestamp: m.timestamp || new Date().toISOString(),
        }));
        setMessages(formatted);
        return;
      }
    } catch (err) {
      console.warn("Could not fetch messages from server, using local fallback:", err.message);
    }

    const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
    const groupMessages = allMessages.filter(msg => 
      String(msg.group_id) === `group_${selectedGroup.id}` || 
      String(msg.group_id) === String(selectedGroup.id) ||
      String(msg.groupId) === String(selectedGroup.id)
    );
    setMessages(groupMessages);
  };

  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  useEffect(() => {
    loadMessages();
  }, [selectedGroup]);

  // Set selectedGroup when groupId prop changes
  useEffect(() => {
    if (groupId && groups.length > 0) {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        setSelectedGroup(group);
        loadMessages();
      }
    }
  }, [groupId, groups]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter groups based on search
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get user's full name for display
  const getUserFullName = () => {
    return user.fullName || user.name || 'User';
  };

  // Get sender name with overrides
  const getSenderName = (senderEmail) => {
    if (senderEmail === 'dineshmatti707@gmail.com') return 'M.Dinesh';
    if (senderEmail === 'chethan707@gmail.com') return 'Chethan Kumar';
    
    const users = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    const sender = users.find(u => u.email === senderEmail);
    return sender?.fullName || sender?.name || senderEmail.split('@')[0];
  };

  // Get group member count
  const getMemberCount = (group) => {
    return (group.members || []).length + 1; // +1 for owner
  };

  // Get last message preview
  const getLastMessagePreview = (group) => {
    const groupId = `group_${group.id}`;
    const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
    const groupMessages = allMessages.filter(msg => msg.group_id === groupId);
    
    if (groupMessages.length === 0) return "No messages yet";
    const lastMessage = groupMessages[groupMessages.length - 1];
    if (lastMessage.type === 'file') {
      return `📎 ${lastMessage.fileName}`;
    }
    return lastMessage.content.length > 30 
      ? lastMessage.content.substring(0, 30) + "..."
      : lastMessage.content;
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          setPreviewUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Download file function
  const handleDownloadFile = (message) => {
    if (!message.fileData || !message.fileName) return;
    
    try {
      // Create a temporary anchor element
      const link = document.createElement('a');
      
      // Handle different file types
      if (message.fileData.startsWith('data:')) {
        // Base64 encoded file
        link.href = message.fileData;
        link.download = message.fileName;
        link.click();
      } else {
        // Regular URL or blob
        fetch(message.fileData)
          .then(response => response.blob())
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            link.href = url;
            link.download = message.fileName;
            link.click();
            window.URL.revokeObjectURL(url);
          })
          .catch(error => {
            console.error('Error downloading file:', error);
            alert('Error downloading file. Please try again.');
          });
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="w-5 h-5" />;
    
    if (fileType.startsWith('image/')) return <File className="w-5 h-5 text-green-500" />;
    if (fileType.startsWith('video/')) return <File className="w-5 h-5 text-purple-500" />;
    if (fileType.includes('pdf')) return <File className="w-5 h-5 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <File className="w-5 h-5 text-blue-500" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <File className="w-5 h-5 text-green-600" />;
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return <File className="w-5 h-5 text-orange-500" />;
    if (fileType.includes('audio/')) return <File className="w-5 h-5 text-pink-500" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('compressed')) return <File className="w-5 h-5 text-yellow-500" />;
    
    return <File className="w-5 h-5 text-gray-500" />;
  };

  // Send message
  const handleSendMessage = async () => {
    if (!selectedGroup) return;

    let fileUrl = previewUrl;
    let fileName = selectedFile?.name;
    let fileType = selectedFile?.type;
    let fileSize = selectedFile?.size;

    if (selectedFile) {
      try {
        const uploadRes = await chatApi.uploadFile(selectedFile);
        if (uploadRes && uploadRes.fileUrl) {
          fileUrl = uploadRes.fileUrl;
          fileName = uploadRes.fileName || fileName;
          fileType = uploadRes.fileType || fileType;
          fileSize = uploadRes.fileSize || fileSize;
        }
      } catch (uploadErr) {
        console.warn("Server file upload failed, using Data URL fallback:", uploadErr.message);
      }
    }

    const payload = {
      groupId: selectedGroup.id,
      senderEmail: user.email,
      senderName: getSenderName(user.email),
      content: newMessage.trim() || (fileName ? `📎 ${fileName}` : ''),
      messageType: selectedFile ? 'FILE' : 'TEXT',
      fileUrl: fileUrl,
      fileName: fileName,
      fileType: fileType,
      fileSize: fileSize,
    };

    if (payload.content || selectedFile) {
      try {
        const saved = await chatApi.sendMessage(payload);
        if (saved) {
          websocketService.sendMessage({
            type: 'message',
            data: saved,
            groupId: selectedGroup.id,
            groupName: selectedGroup.name
          });
        }
      } catch (sendErr) {
        console.warn("Server message send failed, storing locally:", sendErr.message);
      }
    }

    const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");

    if (selectedFile) {
      // Send file message
      const newMsg = {
        id: Date.now().toString(),
        senderEmail: user.email,
        senderName: getSenderName(user.email),
        group_id: `group_${selectedGroup.id}`,
        groupId: selectedGroup.id,
        group_name: selectedGroup.name,
        content: payload.content,
        type: 'file',
        fileName: fileName,
        fileSize: fileSize,
        fileType: fileType,
        fileData: fileUrl,
        fileUrl: fileUrl,
        timestamp: new Date().toISOString(),
        replyTo: replyingTo ? {
          id: replyingTo.id,
          senderName: replyingTo.senderName,
          content: replyingTo.content
        } : null
      };
      allMessages.push(newMsg);
      
      // Reset file selection
      setSelectedFile(null);
      setPreviewUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else if (newMessage.trim()) {
      // Send text message
      const newMsg = {
        id: Date.now().toString(),
        senderEmail: user.email,
        senderName: getSenderName(user.email),
        group_id: `group_${selectedGroup.id}`,
        groupId: selectedGroup.id,
        group_name: selectedGroup.name,
        content: newMessage.trim(),
        type: 'text',
        timestamp: new Date().toISOString(),
        replyTo: replyingTo ? {
          id: replyingTo.id,
          senderName: replyingTo.senderName,
          content: replyingTo.content
        } : null
      };
      allMessages.push(newMsg);
    }
    
    localStorage.setItem("studyconnect_messages", JSON.stringify(allMessages));
    setMessages(allMessages.filter(m => 
      String(m.group_id) === `group_${selectedGroup.id}` ||
      String(m.group_id) === String(selectedGroup.id) ||
      String(m.groupId) === String(selectedGroup.id)
    ));
    setNewMessage("");
    setReplyingTo(null);
    setEditingMessage(null);
    
    // Scroll to bottom
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Handle reply
  const handleReply = (message) => {
    setReplyingTo(message);
    setActiveMenu(null);
    messageInputRef.current?.focus();
  };

  // Handle edit
  const handleEdit = (message) => {
    setEditingMessage(message.id);
    setEditText(message.content);
    setActiveMenu(null);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!selectedGroup || !editingMessage) return;

    const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
    const messageIndex = allMessages.findIndex(msg => msg.id === editingMessage);
    
    if (messageIndex !== -1) {
      allMessages[messageIndex] = {
        ...allMessages[messageIndex],
        content: editText.trim(),
        edited: true,
        editedAt: new Date().toISOString()
      };
      
      localStorage.setItem("studyconnect_messages", JSON.stringify(allMessages));
      setMessages(allMessages.filter(msg => msg.group_id === `group_${selectedGroup.id}`));
    }
    
    setEditingMessage(null);
    setEditText("");
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
  };

  // Handle delete
  const handleDelete = (message) => {
    if (!selectedGroup) return;

    if (!confirm("Delete this message?")) return;

    const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
    const filteredMessages = allMessages.filter(msg => msg.id !== message.id);

    localStorage.setItem("studyconnect_messages", JSON.stringify(filteredMessages));
    setMessages(filteredMessages.filter(msg => msg.group_id === `group_${selectedGroup.id}`));
    setActiveMenu(null);
  };

  // Handle preview file
  const handlePreviewFile = (message) => {
    setPreviewingFile(message);
    setActiveMenu(null);
  };

  // Handle close preview
  const handleClosePreview = () => {
    setPreviewingFile(null);
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
    setNewMessage(prevMessage => prevMessage + emoji);
    messageInputRef.current?.focus();
  };

  // Toggle emoji bar
  const toggleEmojiBar = () => {
    setShowEmojiBar(!showEmojiBar);
  };

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Left Sidebar - Study Groups Only */}
      <div className="w-80 lg:w-88 bg-white border-r border-slate-200/80 flex flex-col">
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-xs">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-base font-bold text-white tracking-tight">Study Groups</h1>
            </div>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs border border-white/20 text-white">
            {getUserFullName()}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search study groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
            />
          </div>
        </div>

        {/* Study Groups Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3.5">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Your Groups</h3>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {filteredGroups.length}
              </span>
            </div>
            {loading ? (
              <div className="text-center text-slate-400 py-6 text-xs">
                Loading groups...
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center text-slate-400 py-8 text-xs">
                {searchTerm ? "No groups match search" : "No joined groups yet"}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                      selectedGroup?.id === group.id
                        ? "bg-orange-50/90 border-2 border-orange-400 shadow-xs"
                        : "bg-white hover:bg-slate-50 border border-slate-200/80"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs flex-shrink-0">
                        {group.name?.charAt(0)?.toUpperCase() || 'G'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-bold text-slate-900 text-xs truncate">
                            {group.name}
                          </h3>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {getMemberCount(group)} members
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {group.course}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-1">
                          {getLastMessagePreview(group)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Chat Area */}
      <div className="flex-1 bg-white flex flex-col min-w-0">
        {selectedGroup ? (
          <>
            {/* Modern Chat Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                  title="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="w-10 h-10 bg-white/20 backdrop-blur-xs rounded-xl flex items-center justify-center text-white font-bold border border-white/20 shadow-xs">
                  {selectedGroup.name?.charAt(0)?.toUpperCase() || 'G'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    {selectedGroup.name}
                  </h2>
                  <p className="text-xs text-white/80 font-medium">
                    {selectedGroup.course} • {getMemberCount(selectedGroup)} members
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
                      Start the conversation!
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
                      <div className={`max-w-xs lg:max-w-md ${
                        msg.senderEmail === user.email
                          ? 'order-2'
                          : 'order-1'
                      }`}>
                        {/* Sender name for other users' messages */}
                        {msg.senderEmail !== user.email && (
                          <p className="text-xs font-semibold text-gray-600 mb-1">
                            {msg.senderName}
                          </p>
                        )}
                        
                        {/* Reply indicator */}
                        {msg.replyTo && (
                          <div className="mb-2 p-2 bg-blue-50 border-l-2 border-blue-300 rounded">
                            <div className="flex items-center space-x-2 mb-1">
                              <Reply className="w-3 h-3 text-blue-500" />
                              <span className="text-xs text-blue-700 font-medium">Replying to {msg.replyTo.senderName}</span>
                            </div>
                            <p className="text-xs text-gray-600 italic">{msg.replyTo.content}</p>
                          </div>
                        )}
                        
                        <div className={`px-4 py-2.5 rounded-2xl relative shadow-xs ${
                          msg.senderEmail === user.email
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-xs'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
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
                              {msg.senderEmail === user.email && (
                                <>
                                  <div className="border-t border-gray-100 my-1"></div>
                                  <button
                                    onClick={() => handleEdit(msg)}
                                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(msg)}
                                    className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}

                          {/* Message content */}
                          {editingMessage === msg.id ? (
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
                            <>
                              {msg.type === 'file' ? (
                                <div>
                                  {msg.fileType?.startsWith('image/') ? (
                                    <div className="relative group">
                                      <img src={msg.fileData} alt={msg.fileName} className="max-w-full rounded-lg mb-2" />
                                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => handleDownloadFile(msg)}
                                          className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                                          title="Download image"
                                        >
                                          <Download className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : msg.fileType?.startsWith('video/') ? (
                                    <div className="relative group">
                                      <video src={msg.fileData} controls className="max-w-full rounded-lg mb-2" />
                                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => handleDownloadFile(msg)}
                                          className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                                          title="Download video"
                                        >
                                          <Download className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                      <div className="flex-shrink-0">
                                        {getFileIcon(msg.fileType)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 truncate">{msg.fileName}</p>
                                        <p className="text-xs text-gray-500">
                                          {msg.fileSize ? formatFileSize(msg.fileSize) : 'Document'}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => handleDownloadFile(msg)}
                                        className="flex-shrink-0 p-2 text-orange-500 hover:text-orange-600 bg-orange-50 rounded-full transition-colors"
                                        title="Download file"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                  {msg.content && (
                                    <p className="text-sm mb-2">{msg.content}</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm">{msg.content}</p>
                              )}
                              {msg.edited && (
                                <p className={`text-xs mt-1 ${
                                  msg.senderEmail === user.email ? 'text-orange-100' : 'text-gray-500'
                                }`}>
                                  edited {formatTime(msg.editedAt)}
                                </p>
                              )}
                            </>
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

            {/* Message Input with File Upload and Emoji Bar */}
            <div className="bg-white border-t border-slate-200/80 px-4 py-3.5">
              {/* Reply indicator */}
              {replyingTo && (
                <div className="mb-3 p-2.5 bg-orange-50 border border-orange-200/80 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Reply className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-semibold text-slate-700">Replying to {replyingTo.senderName}</span>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 italic">{replyingTo.content}</p>
                </div>
              )}
              
              {/* Emoji Bar */}
              {showEmojiBar && (
                <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs">
                  <div className="grid grid-cols-10 gap-1.5">
                    {popularEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="text-2xl hover:bg-white hover:shadow-xs rounded-lg p-1.5 transition-all cursor-pointer"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedFile && (
                <div className="mb-3 p-2.5 bg-orange-50 border border-orange-200/85 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <File className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-semibold text-slate-700">{selectedFile.name}</span>
                      <span className="text-xs text-slate-400">({formatFileSize(selectedFile.size)})</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl("");
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.mp3,.mp4,.mov,.avi,.jpg,.jpeg,.png,.gif,.bmp,.webp,.heic,.heif"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleEmojiBar}
                  className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  ref={messageInputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={replyingTo ? "Type a reply..." : "Type a message..."}
                  className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && !selectedFile}
                  className="p-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-orange-500/20 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Select a study group to start chatting
              </h3>
              <p className="text-gray-500">
                Choose a study group from the left panel to view and send messages
              </p>
            </div>
          </div>
        )}
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
                <img src={previewingFile.fileData} alt={previewingFile.fileName} className="max-w-full h-auto mx-auto" />
              ) : previewingFile.fileType?.startsWith('video/') ? (
                <video src={previewingFile.fileData} controls className="max-w-full h-auto mx-auto">
                  Your browser does not support video tag.
                </video>
              ) : previewingFile.fileType?.includes('pdf') ? (
                <div className="text-center">
                  {getFileIcon(previewingFile.fileType)}
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">PDF Document</h4>
                  <p className="text-gray-500 mb-2 truncate">{previewingFile.fileName}</p>
                  <p className="text-gray-500 mb-4">
                    {previewingFile.fileSize ? `Size: ${formatFileSize(previewingFile.fileSize)}` : 'PDF File'}
                  </p>
                  <button
                    onClick={() => handleDownloadFile(previewingFile)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Download PDF
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  {getFileIcon(previewingFile.fileType)}
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Document Preview</h4>
                  <p className="text-gray-500 mb-2 truncate">{previewingFile.fileName}</p>
                  <p className="text-gray-500 mb-4">
                    {previewingFile.fileSize ? `Size: ${formatFileSize(previewingFile.fileSize)}` : 'Document File'}
                  </p>
                  <button
                    onClick={() => handleDownloadFile(previewingFile)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Download File
                  </button>
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

export default ChatLayout;
