import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { authAPI } from '../lib/api';

interface User {
  id: number;
  email: string;
  farmName: string;
  role: string;
  type: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔑 Attempting login for:', email);
      const response = await authAPI.farmerLogin({ email, password });
      console.log('✅ Login response received:', response.data);

      const { token, user } = response.data;
      const userWithType = { ...user, type: 'farmer' };
      
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'farmer');
      localStorage.setItem('user', JSON.stringify(userWithType));
      
      setToken(token);
      setUser(userWithType);
      console.log('✅ Login successful, token saved');
      return response.data;
    } catch (err: any) {
      console.error('❌ Login error:', err);
      console.error('❌ Error response:', err.response?.data);
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.farmerRegister(data);

      if (response.data.token) {
        const { token, user } = response.data;
        const userWithType = { ...user, type: 'farmer' };
        
        localStorage.setItem('token', token);
        localStorage.setItem('userType', 'farmer');
        localStorage.setItem('user', JSON.stringify(userWithType));
        
        setToken(token);
        setUser(userWithType);
      }
      return response.data;
    } catch (err: any) {
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

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
