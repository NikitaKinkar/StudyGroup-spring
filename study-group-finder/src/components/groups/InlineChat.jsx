import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, MessageCircle, Edit2, Trash2, Paperclip, X, MoreVertical, Download, Eye, Reply, Search, Info, Smile, Heart, Hand, PawPrint, Utensils, Trophy, Package, Star } from 'lucide-react';
import websocketService from '../../services/websocketService';
import chatService from '../../services/chatService';
import { chatApi } from '@/services/api';

const InlineChat = ({ group, user, onClose, isInLayout = false, isCourseChat = false, courseInfo = null }) => {
  const activeUser = user || (() => {
    try {
      return JSON.parse(localStorage.getItem("studyconnect_user") || "null");
    } catch (e) {
      return null;
    }
  })();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(true); // Always online for demo
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('smileys');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Get current profile name with overrides
  const getCurrentProfileName = (userEmail) => {
    // Special override for your email to force M.Dinesh
    if (userEmail === 'dineshmatti707@gmail.com') {
      return 'M.Dinesh';
    }
    
    // Special override for chethan707 email to force Chethan Kumar
    if (userEmail === 'chethan707@gmail.com') {
      return 'Chethan Kumar';
    }
    
    // Always check localStorage first for most up-to-date data
    const users = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    
    // Check if this is the current user first
    const currentUserObj = activeUser || user;
    if (currentUserObj && currentUserObj.email === userEmail) {
      if (currentUserObj.fullName) {
        return currentUserObj.fullName;
      }
      if (currentUserObj.name) {
        return currentUserObj.name;
      }
      return userEmail.split('@')[0] || 'User';
    }
    
    // Find user in localStorage
    const foundUser = users.find(u => u.email === userEmail);
    if (foundUser) {
      // Force return fullName if available, otherwise name, then username
      if (foundUser.fullName) {
        return foundUser.fullName;
      }
      if (foundUser.name) {
        return foundUser.name;
      }
      return userEmail.split('@')[0] || 'User';
    }
    
    // Check if it's a group owner
    if (group && group.owner_email === userEmail) {
      const ownerUser = users.find(u => u.email === userEmail);
      if (ownerUser && ownerUser.fullName) {
        return ownerUser.fullName;
      }
      if (ownerUser && ownerUser.name) {
        return ownerUser.name;
      }
      return userEmail.split('@')[0] || 'User';
    }
    
    // Check if it's a group member
    if (group && group.members) {
      const member = group.members.find(m => m.email === userEmail);
      if (member) {
        const memberUser = users.find(u => u.email === userEmail);
        if (memberUser && memberUser.fullName) {
          return memberUser.fullName;
        }
        if (memberUser && memberUser.name) {
          return memberUser.name;
        }
        return member.fullName || member.name || userEmail.split('@')[0] || 'User';
      }
    }
    
    // Last resort - return username part of email
    return userEmail.split('@')[0] || 'User';
  };

  // Load messages for this group
  const loadMessages = async () => {
    if (!group) return;

    try {
      const serverMessages = await chatApi.getHistory(group.id, activeUser?.email);
      if (Array.isArray(serverMessages)) {
        const formatted = serverMessages.map(m => ({
          id: m.id,
          senderEmail: m.senderEmail || m.sender_email,
          sender_name: m.senderName || m.sender_name || (m.senderEmail ? m.senderEmail.split('@')[0] : 'User'),
          group_id: group.id,
          groupId: group.id,
          group_name: group.name,
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
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Could not fetch messages from server, using local fallback:", err.message);
    }

    const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
    const groupMessages = allMessages.filter(msg => 
      String(msg.group_id) === String(group.id) ||
      String(msg.group_id) === `group_${group.id}` ||
      String(msg.groupId) === String(group.id)
    );
    setMessages(groupMessages);
    setLoading(false);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect WebSocket for real-time group chat
  useEffect(() => {
    if (activeUser && group) {
      loadMessages();
      const userName = activeUser.fullName || activeUser.name || activeUser.email.split('@')[0];
      websocketService.connect(
        group.id,
        activeUser.email,
        userName,
        (incomingMsg) => {
          if (!incomingMsg) return;
          const incomingGroupId = String(incomingMsg.groupId || incomingMsg.group_id || '');
          if (incomingGroupId && incomingGroupId !== String(group.id)) return;

          setMessages(prev => {
            const alreadyExists = prev.some(m =>
              (incomingMsg.id && String(m.id) === String(incomingMsg.id)) ||
              (m.content === (incomingMsg.content || incomingMsg.message) &&
               m.senderEmail === (incomingMsg.senderEmail || incomingMsg.sender_email) &&
               Math.abs(new Date(m.timestamp) - new Date(incomingMsg.timestamp)) < 2000)
            );
            if (alreadyExists) return prev;
            return [...prev, {
              ...incomingMsg,
              id: incomingMsg.id || Date.now().toString(),
              content: incomingMsg.content || incomingMsg.message || '',
              senderEmail: incomingMsg.senderEmail || incomingMsg.sender_email,
              sender_name: incomingMsg.senderName || incomingMsg.sender_name || (incomingMsg.senderEmail ? incomingMsg.senderEmail.split('@')[0] : 'User'),
              timestamp: incomingMsg.timestamp || new Date().toISOString()
            }];
          });
        }
      );

      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeUser?.email, group?.id]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "studyconnect_messages") {
        loadMessages();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [group]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeUser || !group) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    const optimisticMessage = {
      id: Date.now().toString(),
      senderEmail: activeUser.email,
      sender_name: activeUser.fullName || activeUser.name || activeUser.email.split('@')[0],
      group_id: group.id,
      groupId: group.id,
      group_name: group.name,
      content: messageText,
      timestamp: new Date().toISOString(),
      type: 'text',
      replyTo: replyingTo ? {
        id: replyingTo.id,
        content: replyingTo.content || replyingTo.message,
        senderEmail: replyingTo.senderEmail || replyingTo.sender_email
      } : null
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setReplyingTo(null);

    // Save to localStorage
    const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
    allMessages.push(optimisticMessage);
    localStorage.setItem("studyconnect_messages", JSON.stringify(allMessages));

    // Send to backend API
    try {
      await chatApi.sendMessage({
        groupId: group.id,
        senderEmail: activeUser.email,
        senderName: activeUser.fullName || activeUser.name || activeUser.email.split('@')[0],
        message: messageText,
        content: messageText,
        messageType: 'TEXT'
      });
      loadMessages();
    } catch (err) {
      console.warn("Failed to send message to backend, preserved in local storage:", err);
    }

    // Broadcast to other group members via WebSocket
    try {
      websocketService.sendMessage({
        type: 'message',
        data: optimisticMessage,
        groupId: group.id,
        groupName: group.name
      });
    } catch (e) {}
  };

  const handleEditMessage = (messageId) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setEditingMessage(messageId);
      setEditText(message.content);  // Changed from 'message' to 'content'
    }
  };

  const handleSaveEdit = () => {
    if (!editingMessage || !editText.trim()) return;

    const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
    const messageIndex = allMessages.findIndex(m => m.id === editingMessage);
    
    if (messageIndex !== -1) {
      allMessages[messageIndex] = {
        ...allMessages[messageIndex],
        content: editText,  // Changed from 'message' to 'content'
        edited: true,
        editedAt: new Date().toISOString()
      };
      
      localStorage.setItem("studyconnect_messages", JSON.stringify(allMessages));
      const groupFiltered = allMessages.filter(msg => 
        String(msg.group_id) === String(group.id) ||
        String(msg.group_id) === `group_${group.id}` ||
        String(msg.groupId) === String(group.id)
      );
      setMessages(groupFiltered);
    }
    
    setEditingMessage(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const handleDeleteMessage = (messageId) => {
    if (confirm('Are you sure you want to delete this message?')) {
      const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
      const filteredMessages = allMessages.filter(m => m.id !== messageId);
      
      localStorage.setItem("studyconnect_messages", JSON.stringify(filteredMessages));
      const groupFiltered = filteredMessages.filter(msg => 
        String(msg.group_id) === String(group.id) ||
        String(msg.group_id) === `group_${group.id}` ||
        String(msg.groupId) === String(group.id)
      );
      setMessages(groupFiltered);
      setSelectedMessages(new Set());
      setShowDeleteOptions(false);
    }
  };

  const handleSelectMessage = (messageId) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const handleDeleteSelected = () => {
    if (confirm(`Delete ${selectedMessages.size} selected messages?`)) {
      const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
      const filteredMessages = allMessages.filter(m => !selectedMessages.has(m.id));
      
      localStorage.setItem("studyconnect_messages", JSON.stringify(filteredMessages));
      const groupFiltered = filteredMessages.filter(msg => 
        String(msg.group_id) === String(group.id) ||
        String(msg.group_id) === `group_${group.id}` ||
        String(msg.groupId) === String(group.id)
      );
      setMessages(groupFiltered);
      setSelectedMessages(new Set());
      setShowDeleteOptions(false);
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setNewMessage('');
    setShowDeleteOptions(false);
    setSelectedMessages(new Set());
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreviewFile = (fileMessage) => {
    let fileUrl = fileMessage.fileUrl || fileMessage.fileData;
    
    if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://') || fileUrl.startsWith('blob:'))) {
      window.open(fileUrl, '_blank');
      return;
    }

    if (fileMessage.fileData && fileMessage.fileData.startsWith('data:')) {
      try {
        const byteCharacters = atob(fileMessage.fileData.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileMessage.fileType || 'application/octet-stream' });
        fileUrl = URL.createObjectURL(blob);
        window.open(fileUrl, '_blank');
        return;
      } catch (e) {
        console.error('Error opening base64 file:', e);
      }
    }
    
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const handleDownloadFile = (fileMessage) => {
    try {
      let fileUrl = fileMessage.fileUrl || fileMessage.fileData;
      
      if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://') || fileUrl.startsWith('blob:'))) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileMessage.fileName || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      if (fileMessage.fileData && fileMessage.fileData.startsWith('data:')) {
        const byteCharacters = atob(fileMessage.fileData.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileMessage.fileType || 'application/octet-stream' });
        fileUrl = URL.createObjectURL(blob);
      } else {
        return;
      }
      
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileMessage.fileName || 'download';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 1000);
    } catch (error) {
      console.error('Download failed:', error);
      if (fileMessage.fileUrl) {
        window.open(fileMessage.fileUrl, '_blank');
      }
    }
  };

  const handleSendFiles = async () => {
    if (selectedFiles.length === 0 || !user || !group) return;

    const filesToSend = [...selectedFiles];
    setSelectedFiles([]);
    setShowFileUpload(false);

    for (const file of filesToSend) {
      let fileUrl = '';
      try {
        const uploadRes = await chatApi.uploadFile(file);
        if (uploadRes && uploadRes.fileUrl) {
          fileUrl = uploadRes.fileUrl;
        }
      } catch (err) {
        console.warn('Backend file upload failed, using local object URL fallback:', err);
        fileUrl = URL.createObjectURL(file);
      }

      const fileMessage = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
        senderEmail: user.email,
        sender_name: user.fullName || user.name || user.email.split('@')[0],
        group_id: group.id,
        groupId: group.id,
        group_name: group.name,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: fileUrl,
        fileData: fileUrl,
        content: `Shared file: ${file.name}`,
        timestamp: new Date().toISOString(),
        type: 'file'
      };

      // Add to local state & storage
      setMessages(prev => [...prev, fileMessage]);
      const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
      allMessages.push(fileMessage);
      localStorage.setItem("studyconnect_messages", JSON.stringify(allMessages));

      // Post to backend API
      try {
        await chatApi.sendMessage({
          groupId: group.id,
          senderEmail: user.email,
          senderName: user.fullName || user.name || user.email.split('@')[0],
          message: `Shared file: ${file.name}`,
          content: `Shared file: ${file.name}`,
          fileUrl: fileUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          messageType: 'FILE'
        });
        loadMessages();
      } catch (err) {
        console.warn('Failed to send file message to backend:', err);
      }

      // Broadcast via WebSocket
      try {
        websocketService.sendMessage({
          type: 'message',
          data: fileMessage,
          groupId: group.id,
          groupName: group.name
        });
      } catch (e) {}
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading messages...</h3>
            <p className="text-gray-500">Please wait while we set up your chat.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !group) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No group selected</h3>
            <p className="text-gray-500">Please select a group to start chatting.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Only show header if not in layout */}
      {!isInLayout && (
        <>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-orange-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
              {isCourseChat ? '📚' : (group.name?.charAt(0)?.toUpperCase() || 'G')}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isCourseChat ? courseInfo?.name || 'Course Chat' : group.name}
              </h2>
              <p className="text-xs text-orange-100">
                {isCourseChat 
                  ? `${courseInfo?.courseCode || 'COURSE'} • ${courseInfo?.enrolledStudents?.length || 0} students`
                  : `${group.course} • ${(group.members || []).length + 1} members`
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-orange-700 rounded-lg transition-colors">
            <Info className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
        </>
      )}

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600">Start the conversation!</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((message) => {
              const isCurrentUser = (message.senderEmail || message.sender_email)?.toLowerCase() === user?.email?.toLowerCase();
              const senderEmail = message.senderEmail || message.sender_email;
              const isFile = message.type === 'file' || Boolean(message.fileUrl || message.file_url);

              return (
              <div
                key={message.id}
                className={`flex ${
                  isCurrentUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Profile name outside message box for all users */}
                <div className={`mb-2 text-sm font-medium ${
                  isCurrentUser ? 'text-right' : 'text-left'
                }`}>
                  {getCurrentProfileName(senderEmail)}
                </div>
                
                <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2 relative ${
                  isCurrentUser 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                  {showDeleteOptions && (
                    <input
                      type="checkbox"
                      checked={selectedMessages.has(message.id)}
                      onChange={() => handleSelectMessage(message.id)}
                      className="absolute top-2 left-2 w-4 h-4"
                    />
                  )}
                  
                  {/* Only show avatar for other users */}
                  {!isCurrentUser && (
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {getCurrentProfileName(senderEmail)?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                  )}
                  
                  {/* Message content with three dots */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {message.replyTo && (
                        <div className="mb-2 p-2 bg-white/10 rounded-lg border-l-2 border-orange-300">
                          <div className="flex items-center space-x-2 mb-1">
                            <Reply className="w-3 h-3 text-orange-200" />
                            <span className="text-xs text-orange-200">Replying to {getCurrentProfileName(message.replyTo.senderEmail || message.replyTo.sender_email)}</span>
                          </div>
                          <p className="text-xs text-orange-100 italic">{message.replyTo.content || message.replyTo.message}</p>
                        </div>
                      )}
                      
                      {isFile ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{message.fileName || message.file_name || 'File attachment'}</p>
                              {message.fileSize && <p className="text-xs opacity-75">{(message.fileSize / 1024).toFixed(1)} KB</p>}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handlePreviewFile(message)}
                              className="text-xs bg-orange-500 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-orange-600 transition-colors"
                            >
                              <Eye className="w-3 h-3" /> Preview
                            </button>
                            <button
                              onClick={() => handleDownloadFile(message)}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" /> Download
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className={`${
                          isCurrentUser ? 'text-white' : 'text-gray-900'
                        }`}>
                          {message.content || message.message}
                          {message.edited && (
                            <span className="text-xs opacity-75 ml-1">(edited)</span>
                          )}
                        </p>
                      )}
                    </div>
                    
                    {/* Three dots positioned on the right side of text */}
                    {isCurrentUser && !showDeleteOptions && (
                      <div className="ml-2">
                        <button
                          onClick={() => setActiveMenu(activeMenu === message.id ? null : message.id)}
                          className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeMenu === message.id && (
                          <div className="absolute right-0 bottom-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                            <button
                              onClick={() => {
                                handleReply(message);
                                setActiveMenu(null);
                              }}
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Reply className="w-3 h-3" />
                              <span>Reply</span>
                            </button>
                            <button
                              onClick={() => {
                                handleEditMessage(message.id);
                                setActiveMenu(null);
                              }}
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteMessage(message.id);
                                setActiveMenu(null);
                              }}
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
        {replyingTo && (
          <div className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Reply className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-700">Replying to {getCurrentProfileName(replyingTo.senderEmail)}</span>
              </div>
              <button
                onClick={handleCancelReply}
                className="text-xs text-orange-500 hover:text-orange-600 underline"
              >
                Cancel
              </button>
            </div>
            <div className="text-xs text-orange-600 italic">{replyingTo.content}</div>
          </div>
        )}
        
        {showDeleteOptions && (
          <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-700">
                {selectedMessages.size} message{selectedMessages.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleDeleteSelected}
                  className="text-xs bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => {
                    setShowDeleteOptions(false);
                    setSelectedMessages(new Set());
                  }}
                  className="text-xs text-gray-500 hover:text-gray-600 underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            {replyingTo && (
              <input
                type="text"
                value={`@${getCurrentProfileName(replyingTo.senderEmail)} `}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 italic"
              />
            )}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${isCourseChat ? 'course' : 'group'}...`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Smile className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Paperclip className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineChat;
