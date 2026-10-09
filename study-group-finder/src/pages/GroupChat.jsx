import React, { useState, useEffect, useRef } from 'react';
import { createPageUrl } from '@/utils/index.js';
import { MessageCircle, Send, Users, ArrowLeft, Search, Paperclip, MoreVertical, Smile, Reply, Edit, Trash2, X, File, Image, Video, FileText } from 'lucide-react';
import websocketService from '../services/websocketService';
import chatService from '../services/chatService';
import { chatApi, groupsApi } from '@/services/api';

export default function GroupChat() {
  console.log('GroupChat: Component loaded');
  
  const [user, setUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load user data
    const userData = JSON.parse(localStorage.getItem("studyconnect_user"));
    if (userData) {
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Get user's enrolled groups
    const fetchUserGroups = async () => {
      const userEmail = (user.email || '').toLowerCase();
      let allGroups = [];
      try {
        const res = await groupsApi.getAll();
        if (Array.isArray(res) && res.length > 0) {
          allGroups = res;
          localStorage.setItem("studyconnect_groups", JSON.stringify(res));
        }
      } catch (e) {}

      if (allGroups.length === 0) {
        allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
      }

      const userGroups = allGroups.filter(group => {
        const owner = (group.owner_email || group.ownerEmail || '').toLowerCase();
        const isOwner = userEmail && owner === userEmail;
        const isMember = (group.members || []).some(m => (m.email || m.userEmail || '').toLowerCase() === userEmail);
        return isOwner || isMember;
      });

      setGroups(userGroups);
      setLoading(false);
      
      // Auto-select first group if available
      if (userGroups.length > 0 && !selectedGroup) {
        setSelectedGroup(userGroups[0]);
      }
    };

    fetchUserGroups();
  }, [user, selectedGroup]);

  // Load messages for selected group
  useEffect(() => {
    const loadGroupMessages = async () => {
      if (!selectedGroup) {
        setMessages([]);
        return;
      }

      try {
        const serverMessages = await chatApi.getHistory(selectedGroup.id, user?.email);
        if (Array.isArray(serverMessages)) {
          const formatted = serverMessages.map(m => ({
            id: m.id,
            senderEmail: m.senderEmail || m.sender_email,
            senderName: m.senderName || m.sender_name || (m.senderEmail ? m.senderEmail.split('@')[0] : 'User'),
            content: m.content || m.message || '',
            timestamp: m.timestamp || new Date().toISOString(),
            attachments: (m.fileUrl || m.file_url) ? [{
              name: m.fileName || m.file_name || 'File',
              type: m.fileType || m.file_type || '',
              size: m.fileSize || m.file_size || 0,
              url: m.fileUrl || m.file_url
            }] : []
          }));
          setMessages(formatted);
          return;
        }
      } catch (e) {}

      const storedMessages = JSON.parse(localStorage.getItem("studyconnect_group_messages") || "{}");
      const groupMessages = storedMessages[selectedGroup.id] || [];
      setMessages(groupMessages);
    };

    loadGroupMessages();
  }, [selectedGroup]);

  // Save messages to shared storage when they change
  useEffect(() => {
    if (selectedGroup) {
      console.log('GroupChat: Saving messages for group:', selectedGroup.id, 'Count:', messages.length);
      const storedMessages = JSON.parse(localStorage.getItem("studyconnect_group_messages") || "{}");
      storedMessages[selectedGroup.id] = messages;
      localStorage.setItem("studyconnect_group_messages", JSON.stringify(storedMessages));
    }
  }, [messages, selectedGroup]);

  // Listen for storage changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'studyconnect_group_messages' && selectedGroup) {
        console.log('GroupChat: Storage changed, refreshing messages');
        const storedMessages = JSON.parse(e.newValue || "{}");
        const groupMessages = storedMessages[selectedGroup.id] || [];
        setMessages(groupMessages);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedGroup]);

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

  const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🙏'];

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
    console.log('handleMessageMenu called with messageId:', messageId);
    console.log('Current showMessageMenu:', showMessageMenu);
    setShowMessageMenu(showMessageMenu === messageId ? null : messageId);
    console.log('New showMessageMenu will be:', showMessageMenu === messageId ? null : messageId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log('Click outside detected, showMessageMenu:', showMessageMenu);
      if (showMessageMenu && !event.target.closest('.message-menu-container')) {
        console.log('Closing menu due to outside click');
        setShowMessageMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMessageMenu]);

  const handleReply = (message) => {
    console.log('handleReply called with message:', message);
    setReplyingTo(message);
    setShowMessageMenu(null);
    inputRef.current?.focus();
  };

  const handleEdit = (message) => {
    console.log('handleEdit called with message:', message);
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
        // Update existing message
        setMessages(prev => prev.map(msg => 
          msg.id === editingMessage.id ? { ...msg, content: newMessage.trim() } : msg
        ));
        setEditingMessage(null);
      } else {
        // Add new message
        setMessages(prev => [...prev, messageData]);

        // Send to backend and broadcast via WebSocket
        try {
          chatApi.sendMessage({
            groupId: selectedGroup.id,
            senderEmail: user.email,
            senderName: user.fullName || user.name || user.email.split('@')[0],
            content: newMessage.trim(),
            messageType: attachedFiles.length > 0 ? 'FILE' : 'TEXT'
          }).catch(e => console.warn('Could not persist message to server:', e));

          websocketService.sendMessage({
            groupId: selectedGroup.id,
            senderEmail: user.email,
            senderName: user.fullName || user.name || user.email.split('@')[0],
            content: newMessage.trim(),
            messageType: attachedFiles.length > 0 ? 'FILE' : 'TEXT'
          });
        } catch (err) {
          console.warn('Chat dispatch warning:', err);
        }
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
    console.log('Switching to group:', group.id, group.name);
    console.log('Clearing previous messages');
    setSelectedGroup(group);
    setMessages([]); // Clear messages when switching groups
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
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <a 
              href={createPageUrl("Dashboard")}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white cursor-pointer"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-xs rounded-xl flex items-center justify-center border border-white/20">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight leading-tight">Group Chats</h1>
                <p className="text-[11px] text-white/80 font-medium">Real-time collaborative study discussions</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-semibold border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync
            </span>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Sidebar - Group List */}
        <div className="w-80 lg:w-88 bg-white border-r border-slate-200/80 flex flex-col">
          {/* Search */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white transition"
              />
            </div>
          </div>

          {/* Group List */}
          <div className="flex-1 overflow-y-auto p-3.5">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-slate-500">Loading groups...</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-3 border border-orange-100">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-700">No enrolled groups found</p>
                <p className="text-[11px] text-slate-400 mt-1">Join study groups to start chatting!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-150 cursor-pointer ${
                      selectedGroup?.id === group.id 
                        ? 'bg-orange-50/90 border-2 border-orange-400 shadow-xs' 
                        : 'bg-white hover:bg-slate-50 border border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0" onClick={() => handleGroupSelect(group)}>
                      <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-xs">
                        {group.name?.charAt(0)?.toUpperCase() || 'G'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">{group.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{group.course}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          <span className="text-[10px] text-emerald-600 font-semibold">Active</span>
                          <span className="text-[10px] text-slate-400">• {(group.members || []).length} members</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(group.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 cursor-pointer ml-1"
                      title="Delete group"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedGroup ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-3.5 border-b border-slate-200/80 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-xs rounded-xl flex items-center justify-center text-white font-bold border border-white/20 shadow-xs">
                      {selectedGroup.name?.charAt(0)?.toUpperCase() || 'G'}
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-base tracking-tight">{selectedGroup.name}</h2>
                      <p className="text-xs text-white/80 font-medium">{selectedGroup.course}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/20">
                    <Users className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs text-white font-semibold">{(selectedGroup.members || []).length} members</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                {messages.filter(message => 
                  message.senderName !== 'System' && 
                  !message.content.includes('Connected to group chat') &&
                  !message.content.includes('offline mode')
                ).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-orange-100/70 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-4 border border-orange-200/60 shadow-xs">
                      <MessageCircle className="w-8 h-8" />
                    </div>
                    <p className="text-slate-800 text-base font-bold">No messages yet</p>
                    <p className="text-slate-500 text-xs mt-1">Start the conversation with your study buddies!</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl mx-auto">
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
                        <div className={`max-w-md px-4 py-3 rounded-2xl relative message-menu-container shadow-xs ${
                          message.senderEmail === user?.email
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-xs'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                        }`}>
                          {/* Three-dot menu */}
                          <button
                            onClick={(e) => handleMessageMenu(message.id, e)}
                            className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Message menu dropdown */}
                          {(() => {
                            console.log('Rendering menu check - showMessageMenu:', showMessageMenu, 'message.id:', message.id);
                            return showMessageMenu === message.id;
                          })() && (
                            <div className="absolute top-8 right-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                              <button
                                onClick={() => {
                                  console.log('Reply button clicked');
                                  handleReply(message);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                              >
                                <Reply className="w-4 h-4" />
                                <span>Reply</span>
                              </button>
                              {message.senderEmail === user?.email && (
                                <>
                                  <button
                                    onClick={() => {
                                      console.log('Edit button clicked');
                                      handleEdit(message);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      console.log('Delete button clicked');
                                      handleDelete(message.id);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}

                          {/* Reply indicator */}
                          {message.replyTo && (
                            <div className="mb-2 p-2 bg-black/10 rounded-lg">
                              <div className="flex items-center space-x-1 text-xs opacity-75">
                                <Reply className="w-3 h-3" />
                                <span>Replying to {message.replyTo.senderName}</span>
                              </div>
                              <p className="text-sm mt-1 truncate">{message.replyTo.content}</p>
                            </div>
                          )}

                          {message.senderEmail !== user?.email && (
                            <p className="text-xs font-medium mb-1 text-gray-700">
                              {message.senderName}
                            </p>
                          )}
                          
                          <p className="text-sm leading-relaxed">
                            {message.content}
                          </p>

                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((attachment, attIndex) => (
                                <div key={attIndex} className="flex items-center space-x-2 p-2 bg-black/10 rounded-lg">
                                  {attachment.type.startsWith('image/') ? (
                                    <Image className="w-4 h-4" />
                                  ) : attachment.type.startsWith('video/') ? (
                                    <Video className="w-4 h-4" />
                                  ) : attachment.type === 'application/pdf' ? (
                                    <FileText className="w-4 h-4" />
                                  ) : (
                                    <File className="w-4 h-4" />
                                  )}
                                  <span className="text-xs truncate flex-1">{attachment.name}</span>
                                  <span className="text-xs opacity-75">
                                    {(attachment.size / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <p className={`text-xs mt-2 ${
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
              <div className="px-6 py-3.5 bg-white border-t border-slate-200/80">
                {/* Reply indicator */}
                {replyingTo && (
                  <div className="mb-3 p-2.5 bg-orange-50 rounded-xl border border-orange-200/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Reply className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-semibold text-slate-700">
                          Replying to {replyingTo.senderName}
                        </span>
                      </div>
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 truncate italic">{replyingTo.content}</p>
                  </div>
                )}

                {/* Attached files */}
                {attachedFiles.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-orange-50 rounded-xl border border-orange-200/80">
                        {file.type.startsWith('image/') ? (
                          <Image className="w-4 h-4 text-orange-500" />
                        ) : file.type.startsWith('video/') ? (
                          <Video className="w-4 h-4 text-orange-500" />
                        ) : file.type === 'application/pdf' ? (
                          <FileText className="w-4 h-4 text-orange-500" />
                        ) : (
                          <File className="w-4 h-4 text-orange-500" />
                        )}
                        <span className="text-xs text-slate-700 font-medium truncate flex-1">{file.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                    title="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                  />
                  
                  {/* Emoji picker on the left */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                      title="Insert emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    
                    {/* Emoji picker */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-12 left-0 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-20 w-80">
                        <div className="grid grid-cols-8 gap-1 max-h-60 overflow-y-auto">
                          {emojis.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => handleEmojiSelect(emoji)}
                              className="text-xl hover:bg-slate-100 rounded-lg p-1.5 transition-all cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                      className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-slate-50 focus:bg-white transition"
                    />
                  </div>
                  
                  {/* Send button only on the right */}
                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && attachedFiles.length === 0)}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all disabled:cursor-not-allowed shadow-sm shadow-orange-500/20 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-6">
                  <MessageCircle className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Group Chats</h3>
                <p className="text-orange-600 max-w-md">
                  Select a group from the sidebar to start chatting with your study group members.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
