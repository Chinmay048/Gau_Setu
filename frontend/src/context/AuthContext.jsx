import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Restore user and token from localStorage on initialization
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password, userType = 'farmer') => {
    setLoading(true);
    setError(null);
    try {
      const response = userType === 'farmer' 
        ? await authAPI.farmerLogin({ email, password })
        : await authAPI.vetLogin({ email, password });

      const { token, user } = response.data;
      const userWithType = { ...user, type: userType };
      
      localStorage.setItem('token', token);
      localStorage.setItem('userType', userType);
      localStorage.setItem('user', JSON.stringify(userWithType)); // Save user data
      
      setToken(token);
      setUser(userWithType);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data, userType = 'farmer') => {
    setLoading(true);
    setError(null);
    try {
      const response = userType === 'farmer'
        ? await authAPI.farmerRegister(data)
        : await authAPI.vetRegister(data);

      if (response.data.token) {
        const { token, user } = response.data;
        const userWithType = { ...user, type: userType };
        
        localStorage.setItem('token', token);
        localStorage.setItem('userType', userType);
        localStorage.setItem('user', JSON.stringify(userWithType)); // Save user data
        
        setToken(token);
        setUser(userWithType);
      }
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
