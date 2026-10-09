import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '@/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      // Purge any stale persistent session from localStorage to honor requirement
      localStorage.removeItem('studyconnect_user');
      localStorage.removeItem('studyconnect_token');
      return JSON.parse(sessionStorage.getItem('studyconnect_user') || 'null');
    } catch (e) {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('studyconnect_user') && !!sessionStorage.getItem('studyconnect_token');
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      
      // Clean legacy localStorage credentials
      localStorage.removeItem('studyconnect_user');
      localStorage.removeItem('studyconnect_token');

      const token = sessionStorage.getItem('studyconnect_token');
      const savedUserStr = sessionStorage.getItem('studyconnect_user');
      
      if (token && savedUserStr) {
        try {
          const profileData = await authApi.getProfile();
          if (profileData && profileData.user) {
            const userData = {
              ...profileData.user,
              name: profileData.user.fullName || profileData.user.full_name,
              full_name: profileData.user.fullName || profileData.user.full_name,
            };
            setUser(userData);
            setIsAuthenticated(true);
            sessionStorage.setItem('studyconnect_user', JSON.stringify(userData));
            setIsLoadingAuth(false);
            return;
          }
        } catch (apiErr) {
          console.warn('Backend token verification failed, using stored session:', apiErr.message);
        }

        try {
          const parsed = JSON.parse(savedUserStr);
          setUser(parsed);
          setIsAuthenticated(true);
          setIsLoadingAuth(false);
          return;
        } catch (e) {}
      }

      // Default unauthenticated
      setUser(null);
      setIsAuthenticated(false);
      sessionStorage.removeItem('studyconnect_user');
      sessionStorage.removeItem('studyconnect_token');
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('App state check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
    }
  };

  const login = async (credentials) => {
    const data = await authApi.signIn(credentials);
    const token = data.token;
    const userData = {
      ...data.user,
      name: data.user.fullName || data.user.full_name,
      full_name: data.user.fullName || data.user.full_name,
    };
    sessionStorage.setItem('studyconnect_token', token);
    sessionStorage.setItem('studyconnect_user', JSON.stringify(userData));
    localStorage.removeItem('studyconnect_token');
    localStorage.removeItem('studyconnect_user');
    setUser(userData);
    setIsAuthenticated(true);
    return data;
  };

  const signup = async (formData) => {
    const data = await authApi.signUp(formData);
    if (data && data.token && data.user) {
      const userData = {
        ...data.user,
        name: data.user.fullName || data.user.full_name,
        full_name: data.user.fullName || data.user.full_name,
      };
      sessionStorage.setItem('studyconnect_token', data.token);
      sessionStorage.setItem('studyconnect_user', JSON.stringify(userData));
      localStorage.removeItem('studyconnect_token');
      localStorage.removeItem('studyconnect_user');
      setUser(userData);
      setIsAuthenticated(true);
    }
    return data;
  };

  const logout = (shouldRedirect = true) => {
    sessionStorage.removeItem('studyconnect_token');
    sessionStorage.removeItem('studyconnect_user');
    localStorage.removeItem('studyconnect_token');
    localStorage.removeItem('studyconnect_user');
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      window.location.href = '/Auth';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/Auth';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      logout,
      navigateToLogin,
      checkAppState,
      login,
      signup
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
