import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Public Layout & Pages
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/public/HomePage';
import ContactPage from './pages/public/ContactPage';
import SAPCapabilitiesPage from './pages/public/SAPCapabilitiesPage';
import AboutPage from './pages/public/AboutPage';
import IndustriesPage from './pages/public/IndustriesPage';
import ServicePage from './pages/public/ServicePage';

// Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInquiries from './pages/admin/AdminInquiries';
import AdminSettings from './pages/admin/AdminSettings';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/industries" element={<PublicLayout><IndustriesPage /></PublicLayout>} />
          <Route path="/sap-capabilities" element={<PublicLayout><SAPCapabilitiesPage /></PublicLayout>} />
          <Route path="/services/:serviceId" element={<PublicLayout><ServicePage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/inquiries" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminInquiries />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
