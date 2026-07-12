import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../ui/NotificationBell';
import {
  LayoutDashboard, BookOpen, Upload, Briefcase, Bell,
  User, LogOut, ChevronDown, Menu, X, BookMarked,
  ShieldCheck, UserCog, GraduationCap,
} from 'lucide-react';

const STUDENT_NAV = [
  { to: '/dashboard',   label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/academic',    label: 'Academic Hub',   icon: BookOpen },
  { to: '/upload',      label: 'Upload Resource',icon: Upload },
  { to: '/placement',   label: 'Placement Hub',  icon: Briefcase },
  { to: '/notices',     label: 'Notices',        icon: Bell },
  { to: '/profile',     label: 'Profile',        icon: User },
];

const FACULTY_NAV = [
  { to: '/dashboard',   label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/academic',    label: 'Academic Hub',    icon: BookOpen },
  { to: '/upload',      label: 'Upload Resource', icon: Upload },
  { to: '/faculty/approvals', label: 'Approvals', icon: BookMarked },
  { to: '/notices',     label: 'Notices',         icon: Bell },
  { to: '/profile',     label: 'Profile',         icon: User },
];

const ADMIN_NAV = [
  { to: '/dashboard',   label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/academic',    label: 'Academic Hub',  icon: BookOpen },
  { to: '/upload',      label: 'Upload Resource',icon: Upload },
  { to: '/admin',       label: 'Admin Panel',   icon: ShieldCheck },
  { to: '/notices',     label: 'Notices',       icon: Bell },
  { to: '/profile',     label: 'Profile',       icon: User },
];

const NAV_BY_ROLE = { student: STUDENT_NAV, faculty: FACULTY_NAV, admin: ADMIN_NAV };

export default function AppShell({ children }) {
  const { dbUser, role, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const nav = NAV_BY_ROLE[role] || STUDENT_NAV;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLabel = { student: 'Student', faculty: 'Faculty', admin: 'Admin' }[role] || role;
  const roleBadgeClass = { student: 'badge badge-student', faculty: 'badge badge-faculty', admin: 'badge badge-admin' }[role] || 'badge badge-student';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-alt)' }}>

      {/* ─── Mobile overlay ─────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ────────────────────────────────────────────────── */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--color-bg)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          boxShadow: sidebarOpen ? 'var(--shadow-xl)' : 'none',
        }}
        className="sidebar"
      >
        {/* Sidebar logo */}
        <div
          style={{
            height: 'var(--navbar-height)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 20px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)', lineHeight: 1 }}>CampusOS</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>ADIT Portal</div>
          </div>
          <button
            className="btn-icon"
            style={{ marginLeft: 'auto' }}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                marginBottom: 4,
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.9rem',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: isActive ? 'var(--color-primary-subtle)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              })}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info at bottom */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: '#fff', fontSize: '0.875rem',
              flexShrink: 0,
            }}
          >
            {dbUser?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {dbUser?.name || 'User'}
            </div>
            <span className={roleBadgeClass} style={{ fontSize: '0.6875rem', padding: '1px 6px' }}>{roleLabel}</span>
          </div>
          <button className="btn-icon" onClick={handleLogout} title="Logout" aria-label="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ─── Desktop sidebar (always visible ≥1024px) ──────────────── */}
      <style>{`
        @media (min-width: 1024px) {
          .sidebar {
            transform: translateX(0) !important;
            box-shadow: none !important;
          }
          .main-content {
            margin-left: var(--sidebar-width);
          }
        }
      `}</style>

      {/* ─── Main area ──────────────────────────────────────────────── */}
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top Navbar */}
        <header
          style={{
            height: 'var(--navbar-height)',
            background: 'var(--color-bg)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Mobile menu toggle */}
          <button
            className="btn-icon"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            style={{ display: 'flex' }}
            id="sidebar-toggle"
          >
            <Menu size={20} />
          </button>

          {/* Mobile logo */}
          <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1rem' }}>CampusOS</span>

          <div style={{ flex: 1 }} />

          {/* Notifications */}
          <NotificationBell />

          {/* User avatar dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                cursor: 'pointer',
                fontSize: '0.875rem', fontWeight: 500,
              }}
              onClick={() => setUserMenuOpen((p) => !p)}
              id="user-menu-toggle"
              aria-label="User menu"
            >
              <div
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.75rem',
                }}
              >
                {dbUser?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <span style={{ color: 'var(--color-text-primary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {dbUser?.name?.split(' ')[0] || 'User'}
              </span>
              <ChevronDown size={14} color="var(--color-text-muted)" />
            </button>

            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute', top: 44, right: 0,
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  minWidth: 180, zIndex: 100,
                  overflow: 'hidden',
                }}
                className="fade-in"
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{dbUser?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{dbUser?.email}</div>
                </div>
                <NavLink
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', fontSize: '0.875rem', color: 'var(--color-text-primary)', textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-alt)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <User size={15} /> Profile
                </NavLink>
                <button
                  onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '11px 16px', fontSize: '0.875rem', color: 'var(--color-danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-danger-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px', maxWidth: 'var(--content-max-width)', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
