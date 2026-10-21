import axios from 'axios';

/**
 * Normalizes the API base URL.
 * Automatically ensures the URL points to /api/v1 regardless of how VITE_API_URL
 * was configured in Vercel or environment variables (e.g. with/without /api/v1 or trailing slashes).
 */
const normalizeApiUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1';
  }
  let clean = url.trim().replace(/\/+$/, '');
  if (!clean.endsWith('/api/v1')) {
    if (clean.endsWith('/api')) {
      clean = `${clean}/v1`;
    } else {
      clean = `${clean}/api/v1`;
    }
  }
  return clean;
};

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('adminToken') ||
      localStorage.getItem('dyc_token');

    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      } else if (pathname === '/my-enquiries' || pathname === '/profile') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ================= AUTH SERVICES =================

// Signup Initiation (validates details, sends OTP)
export const initiateSignup = async (userData) => {
  const response = await api.post('/auth/signup/initiate', userData);
  return response.data;
};

// Signup OTP Verification (verifies code, creates user & issues token)
export const verifySignupOtp = async (data) => {
  const response = await api.post('/auth/signup/verify', data);
  return response.data;
};

// Login Initiation (validates password, sends OTP)
export const initiateLogin = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Direct or verified login alias
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Login OTP Verification (verifies code, establishes session)
export const verifyLoginOtp = async (data) => {
  const response = await api.post('/auth/login/verify', data);
  return response.data;
};

// Resend OTP for signup, login, or password reset
export const resendOtp = async (data) => {
  const response = await api.post('/auth/resend-otp', data);
  return response.data;
};

// Forgot Password (sends password reset OTP)
export const forgotPassword = async (data) => {
  const response = await api.post('/auth/forgot-password', data);
  return response.data;
};

// Reset Password (verifies OTP & sets new password)
export const resetPassword = async (data) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

// Authoritative user profile fetch
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data?.data || response.data;
};

// Update Profile
export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data?.data || response.data;
};

// Logout
export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore network errors on logout
  }
};

// ================= INQUIRY SERVICES =================
export const submitInquiry = async (inquiryData) => {
  const response = await api.post('/inquiries', inquiryData);
  return response.data;
};

export const getMyInquiries = async () => {
  const response = await api.get('/inquiries/my');
  return response.data?.data || response.data || [];
};

export const getInquiries = async () => {
  const response = await api.get('/inquiries');
  return response.data?.data || response.data || [];
};

export const getInquiry = async (id) => {
  const response = await api.get(`/inquiries/${id}`);
  return response.data?.data || response.data;
};

export const updateInquiryStatus = async (id, status) => {
  const response = await api.put(`/inquiries/${id}/status`, { status });
  return response.data;
};

export const addInquiryNote = async (id, text) => {
  const response = await api.post(`/inquiries/${id}/notes`, { text });
  return response.data?.data || response.data;
};

export const deleteInquiry = async (id) => {
  const response = await api.delete(`/inquiries/${id}`);
  return response.data;
};

// ================= SETTINGS SERVICES =================
export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSettings = async (settingsData) => {
  const response = await api.put('/settings', settingsData);
  return response.data;
};

export default api;
