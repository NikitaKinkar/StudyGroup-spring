import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : 'http://localhost:8080/api') + '/chat';

class ChatService {
  getAuthHeaders() {
    const token = sessionStorage.getItem('studyconnect_token') || localStorage.getItem('studyconnect_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getChatHistory(groupId, userEmail) {
    try {
      // Try backend first
      const response = await axios.get(`${API_BASE_URL}/history/${groupId}`, {
        params: { userEmail },
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.log('Backend not available, using mock data');
      // Mock implementation for development
      const mockMessages = JSON.parse(localStorage.getItem(`chat_history_${groupId}`) || '[]');
      return mockMessages;
    }
  }

  async sendMessage(groupId, senderEmail, senderName, content) {
    try {
      const response = await axios.post(`${API_BASE_URL}/send`, {
        groupId,
        senderEmail,
        senderName,
        content
      }, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.log('Backend not available, using mock implementation');
      // Mock implementation for development
      const message = {
        id: Date.now(),
        groupId,
        senderEmail,
        senderName,
        content,
        timestamp: new Date().toISOString()
      };
      
      // Store in localStorage for persistence
      const existingMessages = JSON.parse(localStorage.getItem(`chat_history_${groupId}`) || '[]');
      existingMessages.push(message);
      localStorage.setItem(`chat_history_${groupId}`, JSON.stringify(existingMessages));
      
      return message;
    }
  }

  async getMessageCount(groupId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/count/${groupId}`);
      return response.data;
    } catch (error) {
      console.log('Backend not available, using mock data');
      // Mock implementation for development
      const messages = JSON.parse(localStorage.getItem(`chat_history_${groupId}`) || '[]');
      return { count: messages.length };
    }
  }
}

export default new ChatService();
