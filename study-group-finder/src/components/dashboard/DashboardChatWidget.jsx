import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Users, ArrowLeft, Search, Paperclip, MoreVertical, Smile, Reply, Edit, Trash2, X, File, Image, Video, FileText, Minimize2, Maximize2 } from 'lucide-react';

const DashboardChatWidget = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🙏'];

  useEffect(() => {
    if (!user) return;
    
    // Get user's enrolled groups
    const fetchUserGroups = () => {
      const allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
      const userGroups = allGroups.filter(group => 
        group.members?.some(member => member.email === user?.email) ||
        group.owner_email === user?.email
      );
      setGroups(userGroups);
      setLoading(false);
      
      // Auto-select first group if available
      if (userGroups.length > 0 && !selectedGroup) {
        setSelectedGroup(userGroups[0]);
      }
    };

    fetchUserGroups();
  }, [user, selectedGroup]);

  // Load messages for selected group from shared storage
  useEffect(() => {
    if (selectedGroup) {
      console.log('Dashboard Widget: Loading messages for group:', selectedGroup.id);
      const storedMessages = JSON.parse(localStorage.getItem("studyconnect_group_messages") || "{}");
      const groupMessages = storedMessages[selectedGroup.id] || [];
      console.log('Dashboard Widget: Loaded messages:', groupMessages.length);
      setMessages(groupMessages);
    } else {
      setMessages([]);
    }
  }, [selectedGroup]);

  // Save messages to shared storage when they change
  useEffect(() => {
    if (selectedGroup) {
      console.log('Dashboard Widget: Saving messages for group:', selectedGroup.id, 'Count:', messages.length);
      const storedMessages = JSON.parse(localStorage.getItem("studyconnect_group_messages") || "{}");
      storedMessages[selectedGroup.id] = messages;
      localStorage.setItem("studyconnect_group_messages", JSON.stringify(storedMessages));
    }
  }, [messages, selectedGroup]);

  // Listen for storage changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'studyconnect_group_messages' && selectedGroup) {
        console.log('Dashboard Widget: Storage changed, refreshing messages');
        const storedMessages = JSON.parse(e.newValue || "{}");
        const groupMessages = storedMessages[selectedGroup.id] || [];
        setMessages(groupMessages);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedGroup]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (selectedGroup && user) {
      // Connect to WebSocket
      websocketService.connect(
        selectedGroup.id,
        user.email,
        user.fullName || user.name,
        handleNewMessage
      );
      setIsConnected(true);

      return () => {
        websocketService.disconnect();
        setIsConnected(false);
      };
    }
  }, [selectedGroup, user]);

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMessageMenu = (messageId, e) => {
    e.stopPropagation();
    // Close all other menus and open only this one
    setShowMessageMenu(showMessageMenu === messageId ? null : messageId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMessageMenu && !event.target.closest('.message-menu-container')) {
        setShowMessageMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMessageMenu]);

  const handleReply = (message) => {
    setReplyingTo(message);
    setShowMessageMenu(null);
    inputRef.current?.focus();
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
    setShowMessageMenu(null);
    inputRef.current?.focus();
  };

  const handleDelete = (messageId) => {
    console.log('=== DELETE OPERATION START ===');
    console.log('Target messageId:', messageId);
    console.log('Current group:', selectedGroup?.id);
    console.log('Current messages count:', messages.length);
    console.log('Current messages:', messages.map(m => ({ id: m.id, content: m.content.substring(0, 20) + '...' })));
    
    // Additional safeguard: ensure we're only deleting from current group's messages
    if (!selectedGroup?.id) {
      console.log('No group selected, aborting delete');
      setShowMessageMenu(null);
      return;
    }
    
    // Delete only the specific message with matching ID
    setMessages(prev => {
      const currentGroupMessages = [...prev]; // Create new array to avoid mutation
      const filtered = currentGroupMessages.filter(msg => {
        const shouldKeep = msg.id !== messageId;
        console.log(`Message ${msg.id}: ${shouldKeep ? 'KEEP' : 'DELETE'}`);
        return shouldKeep;
      });
      console.log('Filtered messages count:', filtered.length);
      return filtered;
    });
    
    setShowMessageMenu(null);
    console.log('=== DELETE OPERATION END ===');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if ((newMessage.trim() || attachedFiles.length > 0) && selectedGroup && user) {
      // Generate truly unique ID with timestamp, random, and group context
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      const groupId = selectedGroup?.id || 'default';
      const uniqueId = `${timestamp}-${random}-${groupId}`;
      
      const messageData = {
        id: uniqueId,
        content: newMessage.trim(),
        senderEmail: user.email,
        senderName: user.fullName || user.name,
        timestamp: new Date().toISOString(),
        replyTo: replyingTo,
        attachments: attachedFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        }))
      };
      
      console.log('Creating message with unique ID:', uniqueId);
      console.log('Message data:', messageData);

      if (editingMessage) {
        setMessages(prev => prev.map(msg => 
          msg.id === editingMessage.id ? { ...msg, content: newMessage.trim() } : msg
        ));
        setEditingMessage(null);
      } else {
        setMessages(prev => [...prev, messageData]);
      }

      setNewMessage('');
      setReplyingTo(null);
      setAttachedFiles([]);
      inputRef.current?.focus();
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setMessages([]);
    setIsMinimized(false);
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      // Remove group from localStorage
      const allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
      const updatedGroups = allGroups.filter(g => g.id !== groupId);
      localStorage.setItem("studyconnect_groups", JSON.stringify(updatedGroups));
      
      // Update state
      setGroups(updatedGroups);
      
      // Clear selected group if it was the deleted one
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
        setMessages([]);
      }
      
      console.log('Group deleted:', groupId);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110"
          title="Open Group Chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`bg-white rounded-lg shadow-2xl border border-orange-200 ${
          isMinimized ? 'w-96' : 'w-[800px] h-[600px]'
        } transition-all duration-300`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-orange-500" />
                </div>
                <h3 className="font-semibold text-white">
                  {selectedGroup ? selectedGroup.name : 'Group Chats'}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {selectedGroup && (
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 hover:bg-orange-400 rounded transition-colors text-white"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedGroup(null);
                  }}
                  className="p-1 hover:bg-orange-400 rounded transition-colors text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex h-[calc(100%-60px)]">
            {!selectedGroup ? (
              /* Group List */
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading groups...</p>
                  </div>
                ) : groups.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <p className="text-gray-600">No enrolled groups yet</p>
                    <p className="text-sm text-gray-500 mt-2">Join groups to start chatting!</p>
                  </div>
                ) : (
                  <>
                    {/* Search */}
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-400" />
                        <input
                          type="text"
                          placeholder="Search study groups..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {filteredGroups.map((group) => (
                        <div
                          key={group.id}
                          onClick={() => handleGroupSelect(group)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors border border-orange-200"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {group.name?.charAt(0)?.toUpperCase() || 'G'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{group.name}</p>
                            <p className="text-xs text-orange-600 truncate">{group.course}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-xs text-orange-600">Active</span>
                              <span className="text-xs text-gray-500">• {(group.members || []).length} members</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(group.id);
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete group"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {!isMinimized && (
                  <>
                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col">
                      {/* Chat Header */}
                      <div className="px-4 py-3 border-b border-orange-200 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedGroup(null)}
                              className="p-1 hover:bg-orange-50 rounded transition-colors"
                            >
                              <ArrowLeft className="w-4 h-4 text-gray-600" />
                            </button>
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                              {selectedGroup.name?.charAt(0)?.toUpperCase() || 'G'}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">{selectedGroup.name}</h4>
                              <p className="text-xs text-gray-500">{selectedGroup.course}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{(selectedGroup.members || []).length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-orange-50 to-white">
                        {messages.filter(message => 
                          message.senderName !== 'System' && 
                          !message.content.includes('Connected to group chat') &&
                          !message.content.includes('offline mode')
                        ).length === 0 ? (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
                              <MessageCircle className="w-6 h-6" />
                            </div>
                            <p className="text-gray-800 text-sm font-medium">No messages yet</p>
                            <p className="text-orange-600 text-xs mt-2">Start the conversation!</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {messages
                              .filter(message => 
                                message.senderName !== 'System' && 
                                !message.content.includes('Connected to group chat') &&
                                !message.content.includes('offline mode')
                              )
                              .map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex ${message.senderEmail === user?.email ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div className={`max-w-xs px-3 py-2 rounded-2xl relative message-menu-container ${
                                    message.senderEmail === user?.email
                                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                                      : 'bg-white text-gray-900 border border-orange-200 shadow-sm'
                                  }`}>
                                    {/* Three-dot menu */}
                                    <button
                                      onClick={(e) => handleMessageMenu(message.id, e)}
                                      className="absolute top-1 right-1 p-1 hover:bg-black/10 rounded transition-colors"
                                    >
                                      <MoreVertical className="w-3 h-3" />
                                    </button>

                                    {/* Message menu dropdown */}
                                    {showMessageMenu === message.id && (
                                      <div className="absolute top-6 right-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[100px]">
                                        <button
                                          onClick={() => handleReply(message)}
                                          className="w-full px-2 py-1 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center space-x-1"
                                        >
                                          <Reply className="w-3 h-3" />
                                          <span>Reply</span>
                                        </button>
                                        {message.senderEmail === user?.email && (
                                          <>
                                            <button
                                              onClick={() => handleEdit(message)}
                                              className="w-full px-2 py-1 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center space-x-1"
                                            >
                                              <Edit className="w-3 h-3" />
                                              <span>Edit</span>
                                            </button>
                                            <button
                                              onClick={() => handleDelete(message.id)}
                                              className="w-full px-2 py-1 text-left text-xs text-red-600 hover:bg-red-50 flex items-center space-x-1"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                              <span>Delete</span>
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}

                                    {/* Reply indicator */}
                                    {message.replyTo && (
                                      <div className="mb-1 p-1 bg-black/10 rounded text-xs">
                                        <div className="flex items-center space-x-1 opacity-75">
                                          <Reply className="w-2 h-2" />
                                          <span>Replying to {message.replyTo.senderName}</span>
                                        </div>
                                        <p className="truncate">{message.replyTo.content}</p>
                                      </div>
                                    )}

                                    {message.senderEmail !== user?.email && (
                                      <p className="text-xs font-medium mb-1 text-gray-700">
                                        {message.senderName}
                                      </p>
                                    )}
                                    
                                    <p className="text-xs leading-relaxed">{message.content}</p>

                                    {/* Attachments */}
                                    {message.attachments && message.attachments.length > 0 && (
                                      <div className="mt-1 space-y-1">
                                        {message.attachments.map((attachment, attIndex) => (
                                          <div key={attIndex} className="flex items-center space-x-1 p-1 bg-black/10 rounded text-xs">
                                            {attachment.type.startsWith('image/') ? (
                                              <Image className="w-3 h-3" />
                                            ) : attachment.type.startsWith('video/') ? (
                                              <Video className="w-3 h-3" />
                                            ) : attachment.type === 'application/pdf' ? (
                                              <FileText className="w-3 h-3" />
                                            ) : (
                                              <File className="w-3 h-3" />
                                            )}
                                            <span className="truncate flex-1">{attachment.name}</span>
                                            <span className="opacity-75">
                                              {(attachment.size / 1024).toFixed(1)} KB
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    <p className={`text-xs mt-1 ${
                                      message.senderEmail === user?.email ? 'text-orange-100' : 'text-gray-500'
                                    }`}>
                                      {formatTimestamp(message.timestamp)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            <div ref={messagesEndRef} />
                          </div>
                        )}
                      </div>

                      {/* Message Input */}
                      <div className="px-3 py-2 bg-gradient-to-r from-orange-50 to-white border-t border-orange-200">
                        {/* Reply indicator */}
                        {replyingTo && (
                          <div className="mb-2 p-2 bg-orange-100 rounded-lg border border-orange-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <Reply className="w-3 h-3 text-orange-600" />
                                <span className="text-xs text-orange-800 font-medium">
                                  Replying to {replyingTo.senderName}
                                </span>
                              </div>
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="text-orange-500 hover:text-orange-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-xs text-orange-700 truncate">{replyingTo.content}</p>
                          </div>
                        )}

                        {/* Attached files */}
                        {attachedFiles.length > 0 && (
                          <div className="mb-2 space-y-1">
                            {attachedFiles.map((file, index) => (
                              <div key={index} className="flex items-center space-x-1 p-1 bg-orange-50 rounded-lg border border-orange-200 text-xs">
                                {file.type.startsWith('image/') ? (
                                  <Image className="w-3 h-3 text-orange-500" />
                                ) : file.type.startsWith('video/') ? (
                                  <Video className="w-3 h-3 text-orange-500" />
                                ) : file.type === 'application/pdf' ? (
                                  <FileText className="w-3 h-3 text-orange-500" />
                                ) : (
                                  <File className="w-3 h-3 text-orange-500" />
                                )}
                                <span className="text-gray-700 truncate flex-1">{file.name}</span>
                                <span className="text-gray-500">
                                  {(file.size / 1024).toFixed(1)} KB
                                </span>
                                <button
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1 text-orange-400 hover:text-orange-600 transition-colors"
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                          />
                          
                          <div className="flex-1 relative">
                            <input
                              ref={inputRef}
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                              className="w-full px-3 py-2 border border-orange-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-sm"
                            />
                          </div>
                          
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                              className="p-1 text-orange-400 hover:text-orange-600 transition-colors"
                            >
                              <Smile className="w-4 h-4" />
                            </button>
                            
                            {/* Emoji picker */}
                            {showEmojiPicker && (
                              <div className="absolute bottom-8 right-0 bg-white border border-orange-200 rounded-lg shadow-lg p-2 z-20 w-64">
                                <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
                                  {emojis.map((emoji, index) => (
                                    <button
                                      key={index}
                                      onClick={() => handleEmojiSelect(emoji)}
                                      className="text-lg hover:bg-orange-100 rounded p-1 transition-colors"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <button
                            type="submit"
                            disabled={(!newMessage.trim() && attachedFiles.length === 0)}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-300 disabled:to-orange-400 text-white p-2 rounded-full transition-colors disabled:cursor-not-allowed"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardChatWidget;
