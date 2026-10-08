import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.mockMode = false;
    this.onMessageCallback = null;
    this.currentGroupId = null;
  }

  connect(groupId, userEmail, userName, onMessageReceived) {
    if (this.connected) {
      return;
    }

    this.currentGroupId = groupId;
    this.onMessageCallback = onMessageReceived;

    // Try real WebSocket first
    try {
      // Create WebSocket connection
      const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
      const socket = new SockJS(wsUrl);
      const token = localStorage.getItem('studyconnect_token');
      
      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: token ? {
          Authorization: `Bearer ${token}`
        } : {},
        debug: (str) => {
          console.log('STOMP Debug: ', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = (frame) => {
        console.log('Connected to WebSocket: ' + frame);
        this.connected = true;
        this.mockMode = false;

        // Subscribe to group chat topic
        this.client.subscribe(`/topic/group/${groupId}`, (message) => {
          const chatMessage = JSON.parse(message.body);
          onMessageReceived(chatMessage);
        });

        // Send user joined message
        this.sendUserJoinedMessage(groupId, userEmail, userName);
      };

      this.client.onStompError = (frame) => {
        console.error('STOMP Error: ', frame);
        console.log('Switching to mock WebSocket mode');
        this.switchToMockMode();
      };

      this.client.activate();

      // Set timeout to switch to mock mode if connection fails
      setTimeout(() => {
        if (!this.connected) {
          console.log('WebSocket connection timeout, switching to mock mode');
          this.switchToMockMode();
        }
      }, 3000);

    } catch (error) {
      console.error('WebSocket connection failed, using mock mode:', error);
      this.switchToMockMode();
    }
  }

  switchToMockMode() {
    this.mockMode = true;
    this.connected = true;
    console.log('Using mock WebSocket mode');
    
    // Simulate connection established
    if (this.onMessageCallback) {
      setTimeout(() => {
        this.onMessageCallback({
          type: 'system',
          content: 'Connected to group chat (offline mode)',
          timestamp: new Date().toISOString(),
          senderName: 'System'
        });
      }, 500);
    }
  }

  disconnect() {
    if (this.client && this.connected && !this.mockMode) {
      this.client.deactivate();
    }
    this.connected = false;
    this.mockMode = false;
    this.onMessageCallback = null;
    this.currentGroupId = null;
  }

  sendMessage(groupId, userEmail, userName, content) {
    const message = {
      groupId: groupId.toString(),
      senderEmail: userEmail,
      senderName: userName,
      content: content,
      timestamp: new Date().toISOString()
    };

    if (this.mockMode) {
      // Mock message sending - store in localStorage and simulate receiving
      console.log('Mock WebSocket: Sending message', message);
      
      // Store in localStorage for persistence
      const existingMessages = JSON.parse(localStorage.getItem(`chat_history_${groupId}`) || '[]');
      existingMessages.push(message);
      localStorage.setItem(`chat_history_${groupId}`, JSON.stringify(existingMessages));
      
      // Simulate receiving the message
      if (this.onMessageCallback) {
        setTimeout(() => {
          this.onMessageCallback(message);
        }, 100);
      }
    } else if (this.connected && this.client) {
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(message)
      });
    } else {
      console.error('WebSocket not connected');
    }
  }

  sendUserJoinedMessage(groupId, userEmail, userName) {
    const message = {
      groupId: groupId.toString(),
      senderEmail: userEmail,
      senderName: userName,
      timestamp: new Date().toISOString()
    };

    if (this.mockMode) {
      console.log('Mock WebSocket: User joined', message);
      // In mock mode, we don't send join messages to avoid clutter
    } else if (this.connected && this.client) {
      this.client.publish({
        destination: '/app/chat.addUser',
        body: JSON.stringify(message)
      });
    }
  }

  isConnected() {
    return this.connected;
  }
}

export default new WebSocketService();
