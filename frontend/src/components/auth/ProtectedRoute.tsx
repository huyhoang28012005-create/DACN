import { Navigate, Outlet } from 'react-router';
import { authService } from '../../services';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }
  if (user) {
    // If allowedRoles is provided, check if the user has permission
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Redirect to a default dashboard if they lack permission
      return user.role === 'ADMIN' ? (
        <Navigate to="/admin-dashboard" replace />
      ) : (
        <Navigate to="/student-dashboard" replace />
      );
    }
  }

  // If authenticated and authorized, render the child routes via Outlet
  return <Outlet />;
}
