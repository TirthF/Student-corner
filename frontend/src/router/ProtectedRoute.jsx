import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, dbUser, role, loading } = useAuth();
  const location = useLocation();

  // Show spinner while Firebase auth OR MongoDB profile is loading
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        gap: 12,
      }}>
        <div style={{
          width: 40, height: 40,
          border: '4px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Loading CampusOS…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in at all → go to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but MongoDB profile failed to load → send back to login
  if (!dbUser) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access check
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <Navigate
        to="/dashboard"
        state={{ unauthorized: true, from: location.pathname }}
        replace
      />
    );
  }

  return children;
}
