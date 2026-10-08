import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '@/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      
      const token = localStorage.getItem('studyconnect_token');
      const savedUserStr = localStorage.getItem('studyconnect_user');
      
      if (token) {
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
            localStorage.setItem('studyconnect_user', JSON.stringify(userData));
            setIsLoadingAuth(false);
            return;
          }
        } catch (apiErr) {
          console.warn('Backend token verification failed, using stored session:', apiErr.message);
        }
      }

      if (savedUserStr) {
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
    localStorage.setItem('studyconnect_token', token);
    localStorage.setItem('studyconnect_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return data;
  };

  const signup = async (formData) => {
    const data = await authApi.signUp(formData);
    return data;
  };

  const logout = (shouldRedirect = true) => {
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
