import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Bell } from 'lucide-react';

const ChatNotificationBar = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const loadNotifications = () => {
      const allNotifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
      const chatNotifications = allNotifications.filter(n => 
        n.type === 'chat_message' && n.recipient_email === user?.email && !n.read
      );
      setNotifications(chatNotifications);
    };

    loadNotifications();
    
    // Update notifications every 5 seconds
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = (notificationId) => {
    const allNotifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
    const updatedNotifications = allNotifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem("studyconnect_notifications", JSON.stringify(updatedNotifications));
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const markAllAsRead = () => {
    const allNotifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
    const updatedNotifications = allNotifications.map(n => 
      n.type === 'chat_message' && n.recipient_email === user?.email ? { ...n, read: true } : n
    );
    localStorage.setItem("studyconnect_notifications", JSON.stringify(updatedNotifications));
    setNotifications([]);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-40 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span className="font-medium">Chat Notifications</span>
            <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
              {notifications.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllAsRead}
              className="text-xs hover:bg-white/20 px-2 py-1 rounded"
            >
              Mark all read
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1 hover:bg-white/20 rounded"
            >
              {showNotifications ? <X className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {showNotifications && (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 text-xs font-bold">
                          {notification.sender_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium text-sm text-gray-900">
                          {notification.sender_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          in {notification.group_name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{notification.message}</p>
                      <p className="text-xs text-gray-500">{formatTime(notification.timestamp)}</p>
                    </div>
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatNotificationBar;
