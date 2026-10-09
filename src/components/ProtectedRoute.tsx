import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../hooks/useAppContext';
import { homeFor, type Role } from '../services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles = ['CUSTOMER'] }: ProtectedRouteProps) {
  const { user, isLoadingAuth } = useApp();
  const location = useLocation();

  if (isLoadingAuth) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-brand-dark text-text-secondary">
        <div className="w-10 h-10 border-4 border-accent-green border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold">Checking your session…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={homeFor(user.role)} replace />;
  }

  return <>{children}</>;
}
