import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getMe as apiGetMe,
  initiateSignup as apiInitiateSignup,
  verifySignupOtp as apiVerifySignupOtp,
  initiateLogin as apiInitiateLogin,
  verifyLoginOtp as apiVerifyLoginOtp,
  resendOtp as apiResendOtp,
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
  updateProfile as apiUpdateProfile,
  logoutUser as apiLogoutUser,
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('adminToken') ||
      localStorage.getItem('dyc_token') ||
      null
    );
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user') || localStorage.getItem('adminUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Authoritative server-side verification of current authentication state
  const refreshUser = useCallback(async () => {
    const currentToken =
      localStorage.getItem('token') ||
      localStorage.getItem('adminToken') ||
      localStorage.getItem('dyc_token');

    if (!currentToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return null;
    }

    try {
      const userData = await apiGetMe();
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        // Keep adminUser in sync for existing admin layout
        if (userData.role === 'admin' || userData.role === 'editor') {
          localStorage.setItem('adminUser', JSON.stringify(userData));
        }
        return userData;
      }
    } catch (err) {
      console.warn('Authentication verification failed:', err?.message);
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('dyc_token');
        localStorage.removeItem('user');
        localStorage.removeItem('adminUser');
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  // Run authoritative verification on mount or token change
  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [token, refreshUser]);

  // Save session helper
  const setSession = (authToken, authUser) => {
    if (authToken) {
      localStorage.setItem('token', authToken);
      localStorage.setItem('dyc_token', authToken);
      if (authUser?.role === 'admin' || authUser?.role === 'editor') {
        localStorage.setItem('adminToken', authToken);
      }
      setToken(authToken);
    }
    if (authUser) {
      localStorage.setItem('user', JSON.stringify(authUser));
      if (authUser?.role === 'admin' || authUser?.role === 'editor') {
        localStorage.setItem('adminUser', JSON.stringify(authUser));
      }
      setUser(authUser);
    }
  };

  // 1. Initiate Signup
  const initiateSignup = async (formData) => {
    return await apiInitiateSignup(formData);
  };

  // 2. Verify Signup OTP
  const verifySignupOtp = async ({ email, otp }) => {
    const res = await apiVerifySignupOtp({ email, otp });
    const authToken = res?.data?.token || res?.token;
    const authUser = res?.data?.user || res?.user;
    if (authToken && authUser) {
      setSession(authToken, authUser);
    }
    return res;
  };

  // 3. Initiate Login
  const initiateLogin = async (credentials) => {
    return await apiInitiateLogin(credentials);
  };

  // 4. Verify Login OTP
  const verifyLoginOtp = async ({ email, otp }) => {
    const res = await apiVerifyLoginOtp({ email, otp });
    const authToken = res?.data?.token || res?.token;
    const authUser = res?.data?.user || res?.user;
    if (authToken && authUser) {
      setSession(authToken, authUser);
    }
    return res;
  };

  // 5. Backwards-compatible Login method (used by AdminLogin or direct calls)
  const login = async (credentials) => {
    const res = await apiInitiateLogin(credentials);
    // If backend directly returns token (e.g. if OTP was passed or bypassed)
    const authToken = res?.data?.token || res?.token;
    const authUser = res?.data?.user || res?.user;
    if (authToken && authUser) {
      setSession(authToken, authUser);
    }
    return res;
  };

  // 6. Resend OTP
  const resendOtp = async ({ email, purpose }) => {
    return await apiResendOtp({ email, purpose });
  };

  // 7. Forgot Password
  const forgotPassword = async ({ email }) => {
    return await apiForgotPassword({ email });
  };

  // 8. Reset Password
  const resetPassword = async ({ email, otp, newPassword }) => {
    return await apiResetPassword({ email, otp, newPassword });
  };

  // 9. Update Profile
  const updateProfile = async (profileData) => {
    const updated = await apiUpdateProfile(profileData);
    if (updated) {
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
    return updated;
  };

  // 10. Logout
  const logout = async () => {
    try {
      await apiLogoutUser();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('dyc_token');
      localStorage.removeItem('user');
      localStorage.removeItem('adminUser');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    isAdmin: Boolean(user && (user.role === 'admin' || user.role === 'editor')),
    loading,
    initiateSignup,
    verifySignupOtp,
    initiateLogin,
    verifyLoginOtp,
    login,
    resendOtp,
    forgotPassword,
    resetPassword,
    updateProfile,
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
