// src/context/AuthContext.jsx
// Production authentication context with JWT and API integration
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      const response = await apiClient.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.valid) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
  
      const { token, user: userData } = response.data;
      
      localStorage.setItem('auth_token', token);
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('Login successful, user role:', userData.role); // Debug log
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };
  
  const register = async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      
      const { token, user: newUser } = response.data;
      
      localStorage.setItem('auth_token', token);
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      isCustomer,
      isLoading,
      login,
      register,
      logout,
      checkAuthStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};