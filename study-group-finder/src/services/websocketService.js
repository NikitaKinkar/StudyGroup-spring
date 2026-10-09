import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.mockMode = false;
    this.onMessageCallback = null;
    this.currentGroupId = null;
    this.currentSubscription = null;
    this.userEmail = null;
    this.userName = null;
  }

  getWsUrl() {
    if (import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL;
    }
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') + '/ws';
    }
    // If backend is on standard localhost:8080
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'http://localhost:8080/ws';
    }
    return '/ws';
  }

  connect(groupId, userEmail, userName, onMessageReceived) {
    this.currentGroupId = groupId;
    this.onMessageCallback = onMessageReceived;
    this.userEmail = userEmail;
    this.userName = userName;

    // If already connected, re-subscribe to the new group
    if (this.client && this.connected && !this.mockMode) {
      this.subscribeToGroup(groupId);
      return;
    }

    try {
      const wsUrl = this.getWsUrl();
      console.log('Connecting WebSocket via SockJS to:', wsUrl);
      const socket = new SockJS(wsUrl);
      const token = localStorage.getItem('studyconnect_token');

      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: token ? {
          Authorization: `Bearer ${token}`
        } : {},
        debug: (str) => {
          // console.log('STOMP: ', str);
        },
        reconnectDelay: 4000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = (frame) => {
        console.log('Connected to WebSocket successfully');
        this.connected = true;
        this.mockMode = false;

        this.subscribeToGroup(this.currentGroupId);
        if (this.userEmail) {
          this.sendUserJoinedMessage(this.currentGroupId, this.userEmail, this.userName || 'User');
        }
      };

      this.client.onStompError = (frame) => {
        console.warn('STOMP protocol error:', frame);
        this.switchToMockMode();
      };

      this.client.onWebSocketError = (err) => {
        console.warn('WebSocket connection error:', err);
      };

      this.client.activate();

      // Graceful fallback to mock mode after 4s if server is unreachable
      setTimeout(() => {
        if (!this.connected) {
          console.log('WebSocket connection timed out, running in local sync mode');
          this.switchToMockMode();
        }
      }, 4000);

    } catch (error) {
      console.warn('WebSocket initialization failed, running in local sync mode:', error);
      this.switchToMockMode();
    }
  }

  subscribeToGroup(groupId) {
    if (!this.client || !this.connected || !groupId) return;

    if (this.currentSubscription) {
      try {
        this.currentSubscription.unsubscribe();
      } catch (e) {
        console.warn('Error unsubscribing previous topic:', e);
      }
      this.currentSubscription = null;
    }

    try {
      this.currentSubscription = this.client.subscribe(`/topic/group/${groupId}`, (message) => {
        try {
          const chatMessage = JSON.parse(message.body);
          if (this.onMessageCallback) {
            this.onMessageCallback(chatMessage);
          }
        } catch (e) {
          console.error('Failed to parse STOMP message body:', e);
        }
      });
      console.log(`Subscribed to /topic/group/${groupId}`);
    } catch (err) {
      console.error('Failed to subscribe to group topic:', err);
    }
  }

  switchToMockMode() {
    this.mockMode = true;
    this.connected = true;
    console.log('Running WebSocket in fallback mode');
  }

  disconnect() {
    if (this.currentSubscription) {
      try { this.currentSubscription.unsubscribe(); } catch (e) {}
      this.currentSubscription = null;
    }
    if (this.client && this.connected && !this.mockMode) {
      try { this.client.deactivate(); } catch (e) {}
    }
    this.connected = false;
    this.mockMode = false;
    this.onMessageCallback = null;
    this.currentGroupId = null;
  }

  sendMessage(arg1, arg2, arg3, arg4) {
    let payload = {};

    if (typeof arg1 === 'object' && arg1 !== null) {
      const obj = arg1.data || arg1;
      payload = {
        groupId: String(obj.groupId || obj.group_id || this.currentGroupId || ''),
        senderEmail: obj.senderEmail || obj.sender_email || this.userEmail || '',
        senderName: obj.senderName || obj.sender_name || this.userName || 'User',
        content: obj.content || obj.message || '',
        messageType: obj.messageType || obj.type || 'TEXT',
        fileUrl: obj.fileUrl || obj.file_url || null,
        fileName: obj.fileName || obj.file_name || null,
        fileType: obj.fileType || obj.file_type || null,
        fileSize: obj.fileSize || obj.file_size || null,
        timestamp: obj.timestamp || new Date().toISOString()
      };
    } else {
      payload = {
        groupId: String(arg1 || this.currentGroupId || ''),
        senderEmail: arg2 || this.userEmail || '',
        senderName: arg3 || this.userName || 'User',
        content: arg4 || '',
        messageType: 'TEXT',
        timestamp: new Date().toISOString()
      };
    }

    if (!payload.groupId) {
      payload.groupId = String(this.currentGroupId || '');
    }

    // Always sync locally so message displays immediately and offline
    try {
      const allMessages = JSON.parse(localStorage.getItem('studyconnect_messages') || '[]');
      const msgToStore = {
        ...payload,
        id: payload.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        group_id: payload.groupId,
      };
      // Prevent duplicate storage
      if (!allMessages.some(m => String(m.id) === String(msgToStore.id))) {
        allMessages.push(msgToStore);
        localStorage.setItem('studyconnect_messages', JSON.stringify(allMessages));
      }
    } catch (e) {}

    if (this.mockMode) {
      if (this.onMessageCallback) {
        setTimeout(() => {
          this.onMessageCallback(payload);
        }, 80);
      }
    } else if (this.connected && this.client) {
      try {
        this.client.publish({
          destination: '/app/chat.sendMessage',
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('Failed to publish STOMP message:', err);
      }
    }
  }

  sendUserJoinedMessage(groupId, userEmail, userName) {
    if (!groupId) return;
    const message = {
      groupId: String(groupId),
      senderEmail: userEmail || 'user@example.com',
      senderName: userName || 'User',
      timestamp: new Date().toISOString()
    };

    if (this.connected && this.client && !this.mockMode) {
      try {
        this.client.publish({
          destination: '/app/chat.addUser',
          body: JSON.stringify(message)
        });
      } catch (e) {}
    }
  }

  isConnected() {
    return this.connected;
  }
}

export default new WebSocketService();
