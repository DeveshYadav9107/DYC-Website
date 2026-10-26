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

// Direct Signup (creates user in MongoDB and issues token directly)
export const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

// Signup alias for backwards compatibility
export const initiateSignup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

// Signup OTP verification (deprecated backwards compatibility)
export const verifySignupOtp = async (data) => {
  const response = await api.post('/auth/signup/verify', data);
  return response.data;
};

// Direct Login (verifies password and issues token directly)
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Login alias for backwards compatibility
export const initiateLogin = login;

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

// ================= INQUIRY & LEAD SERVICES =================
export const submitInquiry = async (inquiryData) => {
  const response = await api.post('/inquiries', inquiryData);
  return response.data;
};

export const getMyInquiries = async () => {
  const response = await api.get('/inquiries/my');
  return response.data?.data || response.data || [];
};

export const getInquiryStats = async () => {
  const response = await api.get('/inquiries/stats');
  return response.data?.data || response.data;
};

export const getAssignableTeam = async () => {
  const response = await api.get('/inquiries/team');
  return response.data?.data || response.data || [];
};

export const getInquiries = async (params = {}) => {
  const response = await api.get('/inquiries', { params });
  return response.data?.data || response.data || [];
};

export const getInquiry = async (id) => {
  const response = await api.get(`/inquiries/${id}`);
  return response.data?.data || response.data;
};

// Flexible status & lead stage updater (supports string status or object { status, leadStage, priority, reason })
export const updateInquiryStatus = async (id, payload) => {
  const body = typeof payload === 'string' ? { status: payload } : payload;
  const response = await api.put(`/inquiries/${id}/status`, body);
  return response.data?.data || response.data;
};

export const assignInquiry = async (id, assignedTo) => {
  const response = await api.post(`/inquiries/${id}/assign`, { assignedTo });
  return response.data?.data || response.data;
};

export const manageFollowUp = async (id, followUpData) => {
  const response = await api.post(`/inquiries/${id}/follow-up`, followUpData);
  return response.data?.data || response.data;
};

export const addInquiryNote = async (id, text) => {
  const response = await api.post(`/inquiries/${id}/notes`, { text });
  return response.data?.data || response.data;
};

export const deleteInquiry = async (id) => {
  const response = await api.delete(`/inquiries/${id}`);
  return response.data;
};

export const exportInquiriesCsv = async (params = {}) => {
  const response = await api.get('/inquiries/export', {
    params,
    responseType: 'blob',
  });
  return response.data;
};

// ================= PROPOSAL SERVICES =================
export const getProposals = async (params = {}) => {
  const response = await api.get('/proposals', { params });
  return response.data?.data || response.data;
};

export const getProposal = async (id) => {
  const response = await api.get(`/proposals/${id}`);
  return response.data?.data || response.data;
};

export const getInquiryProposals = async (inquiryId) => {
  const response = await api.get(`/inquiries/${inquiryId}/proposals`);
  return response.data?.data?.proposals || response.data?.data || response.data || [];
};

export const createProposal = async (proposalData) => {
  const response = await api.post('/proposals', proposalData);
  return response.data?.data || response.data;
};

export const updateProposal = async (id, proposalData) => {
  const response = await api.put(`/proposals/${id}`, proposalData);
  return response.data?.data || response.data;
};

export const reviseProposal = async (id, data = {}) => {
  const response = await api.post(`/proposals/${id}/revise`, data);
  return response.data?.data || response.data;
};

export const updateProposalStatus = async (id, payload) => {
  const body = typeof payload === 'string' ? { status: payload } : payload;
  const response = await api.patch(`/proposals/${id}/status`, body);
  return response.data?.data || response.data;
};

export const downloadProposalPdf = async (id, proposalNumber = 'proposal') => {
  const response = await api.get(`/proposals/${id}/pdf`, {
    responseType: 'blob',
  });
  
  // Trigger browser download of PDF
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `${proposalNumber}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
  return true;
};

export const deleteProposal = async (id) => {
  const response = await api.delete(`/proposals/${id}`);
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

// ================= PHASE 3: JOBS & CAREERS SERVICES =================
export const getJobs = async (params = {}) => {
  const response = await api.get('/jobs', { params });
  return response.data?.data || response.data;
};

export const getJobBySlug = async (idOrSlug) => {
  const response = await api.get(`/jobs/${idOrSlug}`);
  return response.data?.data || response.data;
};

export const getAdminJobs = async (params = {}) => {
  const response = await api.get('/jobs/admin/all', { params });
  return response.data?.data || response.data;
};

export const createJob = async (jobData) => {
  const response = await api.post('/jobs', jobData);
  return response.data?.data || response.data;
};

export const updateJob = async (id, jobData) => {
  const response = await api.put(`/jobs/${id}`, jobData);
  return response.data?.data || response.data;
};

export const deleteJob = async (id) => {
  const response = await api.delete(`/jobs/${id}`);
  return response.data;
};

// ================= PHASE 3: CANDIDATE & APPLICATIONS SERVICES =================
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await api.post('/applications/upload-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data?.data || response.data;
};

export const submitJobApplication = async (applicationData) => {
  const response = await api.post('/applications', applicationData);
  return response.data?.data || response.data;
};

export const getMyApplications = async () => {
  const response = await api.get('/applications/my');
  return response.data?.data || response.data || [];
};

export const getAdminApplications = async (params = {}) => {
  const response = await api.get('/applications', { params });
  return response.data?.data || response.data;
};

export const getRecruitmentStats = async () => {
  const response = await api.get('/applications/stats');
  return response.data?.data || response.data;
};

export const getApplicationDetails = async (id) => {
  const response = await api.get(`/applications/${id}`);
  return response.data?.data || response.data;
};

export const updateApplicationStatus = async (id, payload) => {
  const response = await api.patch(`/applications/${id}/status`, payload);
  return response.data?.data || response.data;
};

export const scheduleInterviewRound = async (id, interviewData) => {
  const response = await api.post(`/applications/${id}/interviews`, interviewData);
  return response.data?.data || response.data;
};

export const updateInterviewRound = async (id, interviewId, data) => {
  const response = await api.patch(`/applications/${id}/interviews/${interviewId}`, data);
  return response.data?.data || response.data;
};

export const addApplicationNote = async (id, note) => {
  const response = await api.post(`/applications/${id}/notes`, { note });
  return response.data?.data || response.data;
};

// ================= PHASE 3: CLIENT MANPOWER & STAFFING SERVICES =================
export const submitStaffingRequest = async (requestData) => {
  const response = await api.post('/staffing-requests', requestData);
  return response.data?.data || response.data;
};

export const getMyStaffingRequests = async () => {
  const response = await api.get('/staffing-requests/my');
  return response.data?.data || response.data || [];
};

export const getAdminStaffingRequests = async (params = {}) => {
  const response = await api.get('/staffing-requests', { params });
  return response.data?.data || response.data;
};

export const getStaffingRequestDetails = async (id) => {
  const response = await api.get(`/staffing-requests/${id}`);
  return response.data?.data || response.data;
};

export const updateStaffingRequestStatus = async (id, payload) => {
  const response = await api.patch(`/staffing-requests/${id}/status`, payload);
  return response.data?.data || response.data;
};

export const updateStaffingProgress = async (id, progressData) => {
  const response = await api.patch(`/staffing-requests/${id}/progress`, progressData);
  return response.data?.data || response.data;
};

export const addStaffingNote = async (id, note) => {
  const response = await api.post(`/staffing-requests/${id}/notes`, { note });
  return response.data?.data || response.data;
};

export default api;

