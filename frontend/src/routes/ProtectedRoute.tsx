import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader fullScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
