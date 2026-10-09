import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token and User Email
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studyconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      const userStr = localStorage.getItem('studyconnect_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u && u.email) {
          config.headers['X-User-Email'] = u.email;
        }
      }
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized request');
      // If unauthorized on authenticated route, we can remove stale token
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/Auth') && !currentPath.includes('/login')) {
        localStorage.removeItem('studyconnect_token');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  signUp: async (formData) => {
    const payload = {
      fullName: formData.name || formData.fullName,
      email: formData.email,
      password: formData.password,
      university: formData.university || '',
      passingYear: formData.passing_year ? parseInt(formData.passing_year, 10) : (formData.passingYear ? parseInt(formData.passingYear, 10) : null),
      passingGpa: formData.passing_gpa ? parseFloat(formData.passing_gpa) : (formData.passingGpa ? parseFloat(formData.passingGpa) : null),
    };
    const response = await apiClient.post('/auth/signup', payload);
    return response.data;
  },

  signIn: async (credentials) => {
    const payload = {
      email: credentials.email,
      password: credentials.password,
    };
    const response = await apiClient.post('/auth/signin', payload);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};

// Groups Endpoints
export const groupsApi = {
  getAll: async () => {
    const response = await apiClient.get('/groups');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/groups/${id}`);
    return response.data;
  },

  create: async (groupData) => {
    const payload = {
      name: groupData.name,
      description: groupData.description || '',
      courseName: groupData.course || groupData.courseName,
      maxMembers: parseInt(groupData.max_members || groupData.maxMembers || 100, 10),
      visibility: groupData.visibility || 'Public',
    };
    const response = await apiClient.post('/groups', payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/groups/${id}`);
    return response.data;
  },

  requestJoin: async (id) => {
    const response = await apiClient.post(`/groups/${id}/join`);
    return response.data;
  },

  acceptJoin: async (id, requesterEmail) => {
    const response = await apiClient.post(`/groups/${id}/accept`, null, {
      params: { requesterEmail },
    });
    return response.data;
  },

  rejectJoin: async (id, requesterEmail) => {
    const response = await apiClient.post(`/groups/${id}/reject`, null, {
      params: { requesterEmail },
    });
    return response.data;
  },

  getMyGroups: async () => {
    const response = await apiClient.get('/groups/my-groups');
    return response.data;
  },

  getOwnedGroups: async () => {
    const response = await apiClient.get('/groups/owned');
    return response.data;
  },
};

// Courses Endpoints
export const coursesApi = {
  getAll: async () => {
    const response = await apiClient.get('/courses');
    return response.data;
  },

  getPredefined: async () => {
    const response = await apiClient.get('/courses/predefined');
    return response.data;
  },

  getCustom: async () => {
    const response = await apiClient.get('/courses/custom');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data;
  },

  create: async (courseData) => {
    const response = await apiClient.post('/courses', courseData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/courses/${id}`);
    return response.data;
  },

  search: async (keyword) => {
    const response = await apiClient.get('/courses/search', {
      params: { keyword },
    });
    return response.data;
  },
};

// Notifications Endpoints
export const notificationsApi = {
  getAll: async () => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  getUnread: async () => {
    const response = await apiClient.get('/notifications/unread');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await apiClient.post(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/mark-all-read');
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },
};

// Study Sessions Endpoints
export const sessionsApi = {
  create: async (sessionData) => {
    const response = await apiClient.post('/sessions', sessionData);
    return response.data;
  },

  update: async (sessionId, sessionData, userEmail) => {
    const response = await apiClient.put(`/sessions/${sessionId}`, sessionData, {
      headers: { 'X-User-Email': userEmail },
    });
    return response.data;
  },

  delete: async (sessionId, userEmail) => {
    const response = await apiClient.delete(`/sessions/${sessionId}`, {
      headers: { 'X-User-Email': userEmail },
    });
    return response.data;
  },

  getById: async (sessionId) => {
    const response = await apiClient.get(`/sessions/${sessionId}`);
    return response.data;
  },

  getByGroup: async (groupId) => {
    const response = await apiClient.get(`/sessions/group/${groupId}`);
    return response.data;
  },

  getUpcoming: async () => {
    const response = await apiClient.get('/sessions/upcoming');
    return response.data;
  },

  getCalendar: async (params = {}) => {
    const today = new Date();
    const defaultStart = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
    const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 2, 28).toISOString().split('T')[0];
    const queryParams = {
      startDate: params.startDate || defaultStart,
      endDate: params.endDate || defaultEnd,
      ...params,
    };
    const response = await apiClient.get('/sessions/calendar', { params: queryParams });
    return response.data;
  },

  join: async (sessionId, userEmail) => {
    let email = userEmail;
    if (!email) {
      try {
        const u = JSON.parse(localStorage.getItem('studyconnect_user') || '{}');
        email = u.email;
      } catch (e) {}
    }
    const response = await apiClient.post(`/sessions/${sessionId}/join`, null, {
      params: email ? { userEmail: email } : {},
    });
    return response.data;
  },
};

// Chat Endpoints
export const chatApi = {
  getHistory: async (groupId, userEmail) => {
    const response = await apiClient.get(`/chat/history/${groupId}`, {
      params: { userEmail },
    });
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await apiClient.post('/chat/send', messageData);
    return response.data;
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getCount: async (groupId) => {
    const response = await apiClient.get(`/chat/count/${groupId}`);
    return response.data;
  },
};

export default apiClient;
