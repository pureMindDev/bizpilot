import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function AdminProtectedRoute({ children }) {
  const { isAdminAuthenticated, loading } = useAdminAuth();

  if (loading) return null;
  if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}
