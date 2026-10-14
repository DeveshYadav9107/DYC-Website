import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, getMe as apiGetMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken'));
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('adminUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(token && !user));

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('adminToken');
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const userData = await apiGetMe();
      if (userData) {
        setUser(userData);
        localStorage.setItem('adminUser', JSON.stringify(userData));
        return userData;
      }
    } catch (err) {
      console.warn('Failed to verify admin authentication:', err?.message);
      if (err?.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [token, refreshUser]);

  const login = async (credentials) => {
    const res = await apiLogin(credentials);
    const authToken = res?.data?.token || res?.token;
    const authUser = res?.data?.user || res?.user;

    if (authToken) {
      localStorage.setItem('adminToken', authToken);
      setToken(authToken);
      if (authUser) {
        localStorage.setItem('adminUser', JSON.stringify(authUser));
        setUser(authUser);
      } else {
        // Fetch fresh user data if not in login response
        await refreshUser();
      }
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    loading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
