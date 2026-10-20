import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Global scroll reset on route change
import ScrollToTop from './components/common/ScrollToTop';

// Public Layout & Pages
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/public/HomePage';
import ContactPage from './pages/public/ContactPage';
import SAPCapabilitiesPage from './pages/public/SAPCapabilitiesPage';
import AboutPage from './pages/public/AboutPage';
import IndustriesPage from './pages/public/IndustriesPage';
import ServicePage from './pages/public/ServicePage';

// Authentication Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Customer Protected Pages
import MyEnquiriesPage from './pages/customer/MyEnquiriesPage';
import ProfilePage from './pages/customer/ProfilePage';

// Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInquiries from './pages/admin/AdminInquiries';
import AdminSettings from './pages/admin/AdminSettings';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/industries" element={<PublicLayout><IndustriesPage /></PublicLayout>} />
            <Route path="/sap-capabilities" element={<PublicLayout><SAPCapabilitiesPage /></PublicLayout>} />
            <Route path="/services/:serviceId" element={<PublicLayout><ServicePage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />

            {/* Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Customer Portal Protected Routes */}
            <Route
              path="/my-enquiries"
              element={
                <ProtectedRoute>
                  <MyEnquiriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes (Restricted to admin & editor roles) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin', 'editor']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inquiries"
              element={
                <ProtectedRoute roles={['admin', 'editor']}>
                  <AdminLayout>
                    <AdminInquiries />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute roles={['admin', 'editor']}>
                  <AdminLayout>
                    <AdminSettings />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
