import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import websocketService from '../services/websocketService';
import chatService from '../services/chatService';

const ChatWidget = ({ groupId, userEmail, userName, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (groupId && userEmail) {
      // Fetch initial chat history
      const fetchChatHistory = async () => {
        try {
          const history = await chatService.getChatHistory(groupId, userEmail);
          setMessages(history);
        } catch (error) {
          console.error('Failed to fetch chat history:', error);
        }
      };

      fetchChatHistory();

      // Connect to WebSocket
      websocketService.connect(groupId, userEmail, userName, handleNewMessage);
      setIsConnected(true);

      return () => {
        websocketService.disconnect();
        setIsConnected(false);
      };
    }
  }, [groupId, userEmail, userName]);

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
    if (!isOpen || isMinimized) {
      setUnreadCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && isConnected) {
      websocketService.sendMessage(groupId, userEmail, userName, newMessage.trim());
      setNewMessage('');
      inputRef.current?.focus();
    }
  };

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      setIsMinimized(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!groupId || !userEmail) {
    return null;
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Chat Bubble */}
      {!isOpen && (
        <button
          onClick={handleToggleOpen}
          className="relative bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-2xl shadow-xl shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition-all hover:scale-105 cursor-pointer"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden ${
          isMinimized ? 'w-80' : 'w-96 h-[520px]'
        } flex flex-col font-sans`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-xs">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">Study Chat</span>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-300 ring-2 ring-emerald-500/30' : 'bg-amber-300'}`} />
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleMinimize}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleToggleOpen}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3 bg-slate-50/60">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 mx-auto mb-2">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">No messages yet</p>
                    <p className="text-[11px] text-slate-400">Say hello to the group!</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`flex ${message.senderEmail === userEmail ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl shadow-xs ${
                          message.senderEmail === userEmail
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-xs'
                            : message.senderEmail === 'system'
                            ? 'bg-slate-200 text-slate-700 text-xs'
                            : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs'
                        }`}
                      >
                        {message.senderEmail !== 'system' && message.senderEmail !== userEmail && (
                          <p className="text-[10px] font-bold text-orange-600 mb-0.5">
                            {message.senderName}
                          </p>
                        )}
                        <p className="text-xs break-words leading-relaxed">{message.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${
                          message.senderEmail === userEmail ? 'text-white/80' : 'text-slate-400'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 border-t border-slate-200/80 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-slate-50 focus:bg-white transition"
                    disabled={!isConnected}
                  />
                  <button
                    type="submit"
                    disabled={!isConnected || !newMessage.trim()}
                    className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-orange-500/20 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
