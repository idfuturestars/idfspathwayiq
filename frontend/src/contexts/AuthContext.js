import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on mount with aggressive error handling and debugging
  useEffect(() => {
    const loadUser = async () => {
      console.log('🔍 AuthContext: Starting loadUser, token:', token ? 'present' : 'missing');
      
      if (token) {
        try {
          console.log('🔑 AuthContext: Making request to /api/auth/me');
          const response = await axios.get(`${API_URL}/api/auth/me`);
          console.log('✅ AuthContext: User data received:', response.data);
          setUser(response.data);
        } catch (error) {
          console.error('❌ AuthContext: Failed to load user:', error);
          console.log('🧹 AuthContext: Clearing invalid token');
          localStorage.removeItem('token');
          setToken(null);
        }
      } else {
        console.log('⏭️ AuthContext: No token, skipping user load');
      }
      
      console.log('✅ AuthContext: Setting loading to false');
      setLoading(false);
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('⚠️ AuthContext: LoadUser timeout, forcing loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout

    loadUser().finally(() => {
      clearTimeout(timeoutId);
    });
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      
      toast.success(`Welcome back, ${userData.username}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, userData);
      
      const { access_token, user: newUser } = response.data;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(newUser);
      
      toast.success(`Welcome to StarGuide, ${newUser.username}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};