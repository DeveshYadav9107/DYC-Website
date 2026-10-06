import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // In a real application, you would validate the JWT token here
  // For now, we just check if it exists in localStorage
  const isAuthenticated = !!localStorage.getItem('adminToken');

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
