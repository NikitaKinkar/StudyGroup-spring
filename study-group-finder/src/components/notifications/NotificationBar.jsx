import { useState, useEffect } from "react";
import { Bell, X, Check, X as XIcon, User, Users, MessageCircle, Clock } from "lucide-react";
import { useSessionNotifications } from "../../hooks/useSessionNotifications";
import { notificationsApi, groupsApi } from "@/services/api";

export default function NotificationBar({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Initialize session notifications
  useSessionNotifications(user);

  // Debug: Log when notifications are updated
  useEffect(() => {
    console.log('NotificationBar - User:', user?.email);
    console.log('NotificationBar - Total notifications:', notifications.length);
    console.log('NotificationBar - Session notifications:', notifications.filter(n => n.type === 'session_reminder' || n.type === 'session_started').length);
    console.log('NotificationBar - Unread count:', unreadCount);
  }, [notifications, unreadCount, user]);

  // Convert 24-hour time to 12-hour format with AM/PM
  const convertTo12HourFormat = (time24) => {
    if (!time24) return '12:00 PM';
    
    // Handle different time formats
    let hours, minutes;
    
    if (time24.includes(':')) {
      [hours, minutes] = time24.split(':').map(Number);
    } else {
      // If time is in format like "2100" or "21"
      if (time24.length === 4) {
        hours = parseInt(time24.substring(0, 2));
        minutes = parseInt(time24.substring(2, 4));
      } else if (time24.length === 3) {
        hours = parseInt(time24.substring(0, 1));
        minutes = parseInt(time24.substring(1, 3));
      } else {
        hours = parseInt(time24);
        minutes = 0;
      }
    }
    
    if (isNaN(hours) || isNaN(minutes)) return '12:00 PM';
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  // Test function to create a sample notification
  const createTestNotification = () => {
    if (!user) return;
    
    const formattedTime = convertTo12HourFormat('5:45 PM');
    
    const testNotification = {
      id: `test_${Date.now()}`,
      type: 'session_reminder',
      sender_email: 'system',
      recipient_email: user.email,
      session_id: 'test_session',
      session_title: 'Test Session',
      session_date: new Date().toISOString().split('T')[0],
      session_time: '5:45 PM',
      condition: '1_hour_before',
      message: `Session starts in 1 hour: "Test Session" at ${formattedTime}`,
      created_at: new Date().toISOString(),
      read: false
    };

    const allNotifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
    allNotifications.push(testNotification);
    localStorage.setItem("studyconnect_notifications", JSON.stringify(allNotifications));
    
    // Trigger reload
    window.location.reload();
  };

  // Add test function to window for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.createTestNotification = createTestNotification;
      console.log('🔧 Debug function available: createTestNotification()');
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    // Load notifications from backend and local cache
    const loadNotifications = async () => {
      try {
        const backendData = await notificationsApi.getAll();
        if (Array.isArray(backendData)) {
          const formatted = backendData.map(n => ({
            ...n,
            id: n.id,
            type: (n.type || '').toLowerCase(),
            sender_email: n.senderEmail || n.sender_email,
            recipient_email: n.recipientEmail || n.recipient_email,
            group_id: n.groupId || n.group_id,
            group_name: n.groupName || n.group_name,
            read: n.isRead !== undefined ? n.isRead : (n.read !== undefined ? n.read : false),
            created_at: n.createdAt || n.created_at || new Date().toISOString()
          }));
          setNotifications(formatted);
          setUnreadCount(formatted.filter(n => !n.read).length);
          localStorage.setItem("studyconnect_notifications", JSON.stringify(formatted));
          return;
        }
      } catch (err) {
        // Fallback to local storage
      }

      const stored = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
      const userNotifications = stored.filter(n => n.recipient_email === user.email);
      setNotifications(userNotifications);
      const unread = userNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    };

    // Initial load
    loadNotifications();

    // Set up interval to check for new notifications every 4 seconds
    const interval = setInterval(loadNotifications, 4000);

    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      if (typeof notificationId === 'number' || !isNaN(Number(notificationId))) {
        await notificationsApi.markAsRead(notificationId);
      }
    } catch (err) {
      console.warn("Backend markAsRead error:", err.message);
    }

    const stored = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
    const updated = stored.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem("studyconnect_notifications", JSON.stringify(updated));
    
    // Update local state
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const deleteNotification = async (notificationId) => {
    try {
      if (typeof notificationId === 'number' || !isNaN(Number(notificationId))) {
        await notificationsApi.delete(notificationId);
      }
    } catch (err) {
      console.warn("Backend deleteNotification error:", err.message);
    }

    const stored = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
    const updated = stored.filter(n => n.id !== notificationId);
    localStorage.setItem("studyconnect_notifications", JSON.stringify(updated));
    
    // Update local state
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (!notification?.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'group_join_request':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'group_join_accepted':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'group_join_rejected':
        return <XIcon className="w-5 h-5 text-red-500" />;
      case 'chat_message':
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      case 'session_reminder':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'session_started':
        return <Clock className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'group_join_request':
        return 'Group Join Request';
      case 'group_join_accepted':
        return 'Request Accepted';
      case 'group_join_rejected':
        return 'Request Rejected';
      case 'chat_message':
        return 'New Message';
      case 'session_reminder':
        return 'Session Reminder';
      case 'session_started':
        return 'Session Starting Now';
      default:
        return 'Notification';
    }
  };

  const handleJoinRequestResponse = async (notificationId, groupId, requesterEmail, action) => {
    try {
      if (action === 'accept') {
        await groupsApi.acceptJoin(groupId, requesterEmail);
      } else {
        await groupsApi.rejectJoin(groupId, requesterEmail);
      }
    } catch (err) {
      console.warn("Backend join response error:", err.message);
    }

    // Get group details
    const groups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
    const group = groups.find(g => g.id === groupId);
    
    if (!group) return;

    // Get requester details
    const users = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    const requester = users.find(u => u.email === requesterEmail);

    if (action === 'accept') {
      // Add member to group
      const updatedGroup = {
        ...group,
        members: [
          ...(group.members || []),
          { 
            email: requesterEmail, 
            name: requester?.full_name || 'Unknown User',
            joined_at: new Date().toISOString(),
            role: 'Member'
          }
        ]
      };
      
      // Update group in localStorage
      const updatedGroups = groups.map(g => g.id === groupId ? updatedGroup : g);
      localStorage.setItem("studyconnect_groups", JSON.stringify(updatedGroups));

      // Send acceptance notification to requester
      const acceptanceNotification = {
        id: Date.now().toString(),
        type: 'group_join_accepted',
        sender_email: user.email,
        recipient_email: requesterEmail,
        group_id: groupId,
        group_name: group.name,
        message: `Your request to join "${group.name}" has been accepted! You are now a member of the group.`,
        created_at: new Date().toISOString(),
        read: false
      };

      const allNotifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
      allNotifications.push(acceptanceNotification);
      localStorage.setItem("studyconnect_notifications", JSON.stringify(allNotifications));

      // Show success message to owner
      alert(`${requester?.full_name || 'User'} has been added to "${group.name}" successfully!`);
      
    } else {
      // Send rejection notification to requester
      const rejectionNotification = {
        id: Date.now().toString(),
        type: 'group_join_rejected',
        sender_email: user.email,
        recipient_email: requesterEmail,
        group_id: groupId,
        group_name: group.name,
        message: `Your request to join "${group.name}" has been rejected by the group owner.`,
        created_at: new Date().toISOString(),
        read: false
      };

      const allNotifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
      allNotifications.push(rejectionNotification);
      localStorage.setItem("studyconnect_notifications", JSON.stringify(allNotifications));

      // Show confirmation to owner
      alert(`Request from ${requester?.full_name || 'User'} has been rejected.`);
    }

    // Remove the original request notification
    deleteNotification(notificationId);
    
    // Close dropdown
    setIsOpen(false);
  };

  const handleConnectionResponse = (notificationId, senderEmail, action) => {
    // Get sender details
    const users = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    const sender = users.find(u => u.email === senderEmail);

    // Update connection status
    const connections = JSON.parse(localStorage.getItem("studyconnect_connections") || "[]");
    const connectionIndex = connections.findIndex(
      c => c.user_email === senderEmail && c.peer_email === user.email && c.status === 'pending'
    );

    if (connectionIndex !== -1) {
      connections[connectionIndex].status = action;
      localStorage.setItem("studyconnect_connections", JSON.stringify(connections));

      if (action === 'accepted') {
        // Create mutual connection
        const mutualConnection = {
          id: Date.now().toString(),
          user_email: user.email,
          peer_email: senderEmail,
          peer_name: sender?.full_name || 'Unknown',
          peer_university: sender?.university || 'Unknown',
          connected_at: new Date().toISOString(),
          status: 'accepted'
        };
        connections.push(mutualConnection);
        localStorage.setItem("studyconnect_connections", JSON.stringify(connections));

        // Send acceptance notification to sender
        const acceptanceNotification = {
          id: Date.now().toString(),
          type: 'chat_message',
          sender_email: user.email,
          recipient_email: senderEmail,
          message: `${user.full_name} has accepted your connection request!`,
          created_at: new Date().toISOString(),
          read: false
        };

        const allNotifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
        allNotifications.push(acceptanceNotification);
        localStorage.setItem("studyconnect_notifications", JSON.stringify(allNotifications));

        alert(`You are now connected with ${sender?.full_name || 'User'}!`);
      } else {
        // Send rejection notification to sender
        const rejectionNotification = {
          id: Date.now().toString(),
          type: 'chat_message',
          sender_email: user.email,
          recipient_email: senderEmail,
          message: `${user.full_name} has declined your connection request.`,
          created_at: new Date().toISOString(),
          read: false
        };

        const allNotifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
        allNotifications.push(rejectionNotification);
        localStorage.setItem("studyconnect_notifications", JSON.stringify(allNotifications));

        alert(`Connection request from ${sender?.full_name || 'User'} has been declined.`);
      }
    }

    // Remove the original request notification
    deleteNotification(notificationId);
    
    // Close dropdown
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[9999]" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popup Container */}
          <div className="fixed top-20 right-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[10000] max-h-96 overflow-hidden transform transition-all duration-300 ease-out animate-in slide-in-from-top-2">
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-blue-50">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {unreadCount > 0 && (
                <p className="text-sm text-orange-600 font-medium mt-1">
                  {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 font-medium">No notifications</p>
                  <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
                </div>
              ) : (
                <>
                  {/* Session Reminders Section */}
                  {notifications.filter(n => n.type === 'session_reminder' || n.type === 'session_started').length > 0 && (
                    <div className="bg-orange-50 border-b border-orange-200">
                      <div className="px-4 py-3 border-b border-orange-200">
                        <h4 className="font-semibold text-orange-800 text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Upcoming Sessions
                        </h4>
                      </div>
                      {notifications.filter(n => n.type === 'session_reminder' || n.type === 'session_started').map(notification => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-orange-100 hover:bg-orange-100 transition-all duration-200 ${
                            !notification.read ? 'bg-orange-100 border-l-4 border-l-orange-500' : ''
                          }`}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-4">
                            <Clock className={`w-5 h-5 ${notification.type === 'session_started' ? 'text-red-500' : 'text-orange-500'} flex-shrink-0 mt-0.5`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-orange-900 text-sm">
                                  Session Reminder
                                </h4>
                                <span className="text-xs text-orange-500 font-medium">
                                  {new Date(notification.created_at).toLocaleString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <p className="text-orange-800 font-medium text-lg leading-relaxed mb-2">
                                {notification.session_title}
                              </p>
                              <p className="text-orange-600 font-medium text-sm leading-relaxed mb-2">
                                Session Starts Today at {convertTo12HourFormat(notification.session_time)}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-orange-600">
                                <span className="font-medium">
                                  {new Date(notification.session_date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short', 
                                    day: 'numeric'
                                  })}
                                </span>
                                <span className="font-medium">{convertTo12HourFormat(notification.session_time)}</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-orange-400 hover:text-red-500 transition-colors p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Other Notifications */}
                  {notifications.filter(n => n.type !== 'session_reminder' && n.type !== 'session_started').map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
                        !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-4">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {getNotificationTitle(notification.type)}
                            </h4>
                            {!notification.read && (
                              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-gray-800 font-medium text-sm leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2 font-medium">
                            {new Date(notification.created_at).toLocaleString('en-US', {
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          
                          {/* Action buttons for join requests */}
                          {notification.type === 'group_join_request' && (
                            <div className="flex gap-3 mt-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleJoinRequestResponse(
                                    notification.id,
                                    notification.group_id,
                                    notification.sender_email,
                                    'accept'
                                  );
                                }}
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                <Check className="w-4 h-4" />
                                Accept Request
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleJoinRequestResponse(
                                    notification.id,
                                    notification.group_id,
                                    notification.sender_email,
                                    'reject'
                                  );
                                }}
                                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                <XIcon className="w-4 h-4" />
                                Reject Request
                              </button>
                            </div>
                          )}

                          {/* Action buttons for connection requests */}
                          {notification.type === 'chat_message' && 
                           notification.message.includes('wants to connect with you') && (
                            <div className="flex gap-3 mt-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConnectionResponse(
                                    notification.id,
                                    notification.sender_email,
                                    'accepted'
                                  );
                                }}
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                <Check className="w-4 h-4" />
                                Accept Connection
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConnectionResponse(
                                    notification.id,
                                    notification.sender_email,
                                    'rejected'
                                  );
                                }}
                                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                <XIcon className="w-4 h-4" />
                                Decline Connection
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
