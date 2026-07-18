import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './router/ProtectedRoute';
import AppShell from './components/layout/AppShell';

// Auth pages (no shell)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Protected pages (with shell)
import Dashboard from './pages/dashboard/Dashboard';
import AcademicHub from './pages/academic/AcademicHub';
import UploadResource from './pages/academic/UploadResource';
import PlacementHub from './pages/placement/PlacementHub';
import NoticePage from './pages/notices/NoticePage';
import ProfilePage from './pages/profile/ProfilePage';
import ApprovalQueue from './pages/faculty/ApprovalQueue';
import AdminPanel from './pages/admin/AdminPanel';

function AuthLayout({ children }) {
  return children;
}

function AppLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
            },
            success: { iconTheme: { primary: '#16A34A', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* ─── Public Routes ──────────────────────────────────────── */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ─── Protected Routes ─────────────────────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/academic"
            element={
              <ProtectedRoute>
                <AppLayout><AcademicHub /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <AppLayout><UploadResource /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/placement"
            element={
              <ProtectedRoute>
                <AppLayout><PlacementHub /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notices"
            element={
              <ProtectedRoute>
                <AppLayout><NoticePage /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout><ProfilePage /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ─── Faculty Routes ───────────────────────────────────── */}
          <Route
            path="/faculty/approvals"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <AppLayout><ApprovalQueue /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ─── Admin Routes ─────────────────────────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout><AdminPanel /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ─── Default redirect ─────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
