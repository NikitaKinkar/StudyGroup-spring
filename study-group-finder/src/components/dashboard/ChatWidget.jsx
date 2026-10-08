import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Users, X, Minimize2, Maximize2 } from 'lucide-react';
import websocketService from '../../services/websocketService';
import chatService from '../../services/chatService';

const ChatWidget = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
    };

    fetchUserGroups();
  }, [user]);

  useEffect(() => {
    if (selectedGroup && user) {
      // Fetch chat history for selected group
      const fetchChatHistory = async () => {
        try {
          const history = await chatService.getChatHistory(selectedGroup.id, user.email);
          setMessages(history);
        } catch (error) {
          console.error('Failed to fetch chat history:', error);
        }
      };

      fetchChatHistory();

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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && isConnected && selectedGroup && user) {
      websocketService.sendMessage(
        selectedGroup.id,
        user.email,
        user.fullName || user.name,
        newMessage.trim()
      );
      setNewMessage('');
      inputRef.current?.focus();
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setIsMinimized(false);
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 ${
          isMinimized ? 'w-80' : 'w-96 h-[500px]'
        } transition-all duration-300`}>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">
                {selectedGroup ? selectedGroup.name : 'Group Chats'}
              </h3>
              {selectedGroup && isConnected && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {selectedGroup && (
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4 text-gray-600" /> : <Minimize2 className="w-4 h-4 text-gray-600" />}
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedGroup(null);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex flex-col h-full">
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
                  <div className="space-y-2">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        onClick={() => handleGroupSelect(group)}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-200 hover:border-orange-300"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {group.name?.charAt(0)?.toUpperCase() || 'G'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{group.name}</p>
                          <p className="text-sm text-gray-500 truncate">{group.course}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600">Active</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {(group.members || []).length}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {!isMinimized && (
                  <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
                            <MessageCircle className="w-6 h-6" />
                          </div>
                          <p className="text-gray-600">No messages yet</p>
                          <p className="text-sm text-gray-500 mt-2">Start the conversation!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {messages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${
                                message.senderEmail === user?.email ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div className={`max-w-xs px-3 py-2 rounded-lg ${
                                message.senderEmail === user?.email
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                                  : 'bg-white text-gray-900 border border-gray-200'
                              }`}>
                                {message.senderEmail !== user?.email && (
                                  <p className="text-xs font-medium mb-1 text-gray-700">
                                    {message.senderName}
                                  </p>
                                )}
                                <p className="text-sm">{message.content}</p>
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
                    <div className="p-4 bg-white border-t border-gray-200">
                      <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <div className="flex-1 relative">
                          <input
                            ref={inputRef}
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            disabled={!isConnected}
                            className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-100 text-sm"
                          />
                          <button
                            type="submit"
                            disabled={!isConnected || !newMessage.trim()}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white p-1.5 rounded-full transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </form>
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

export default ChatWidget;
