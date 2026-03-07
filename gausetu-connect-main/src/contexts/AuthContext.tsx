import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { authAPI } from '../lib/api';

interface User {
  id: number;
  email: string;
  farmName?: string;
  name?: string;
  clinicName?: string;
  region?: string;
  accessLevel?: string;
  role: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, role?: string) => Promise<any>;
  loginOTP: (phone: string, otp: string) => Promise<any>;
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

  const saveAuth = (token: string, user: any, role: string) => {
    const u = { ...user, role };
    localStorage.setItem('token', token);
    localStorage.setItem('userType', role);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(token);
    setUser(u);
  };

  const login = useCallback(async (email: string, password: string, role: string = 'farmer') => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (role === 'vet') {
        response = await authAPI.vetLogin({ email, password });
      } else if (role === 'government') {
        response = await authAPI.govLogin({ email, password });
      } else {
        response = await authAPI.farmerLogin({ email, password });
      }
      saveAuth(response.data.token, response.data.user, role);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginOTP = useCallback(async (phone: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.otpVerify(phone, otp);
      saveAuth(response.data.token, response.data.user, 'farmer');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'OTP verification failed';
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
        saveAuth(response.data.token, response.data.user, 'farmer');
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
    loginOTP,
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
