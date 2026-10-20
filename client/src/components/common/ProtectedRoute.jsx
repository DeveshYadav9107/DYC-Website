import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-[#64748B] font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    const isAccessingAdmin = location.pathname.startsWith('/admin');
    const redirectUrl = isAccessingAdmin ? '/admin/login' : `/login?returnTo=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectUrl} replace />;
  }

  // Role authorization check
  const allowedRoles = roles || (requiredRole ? [requiredRole] : null);
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || 'customer';
    const isAllowed = allowedRoles.includes(userRole);

    if (!isAllowed) {
      // If customer attempts to access admin route, redirect to home
      if (location.pathname.startsWith('/admin')) {
        return <Navigate to="/" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
