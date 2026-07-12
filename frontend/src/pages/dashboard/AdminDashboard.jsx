import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, BookMarked, Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import { getAdminStats } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Failed to load admin stats.'))
      .finally(() => setLoading(false));
  }, []);

  const links = [
    { to: '/admin?tab=users',       label: 'User Management',       icon: <Users size={20} />,       desc: 'Create faculty/admin accounts, deactivate users', color: 'var(--color-primary)' },
    { to: '/faculty/approvals',     label: 'Resource Moderation',   icon: <BookMarked size={20} />,  desc: 'Approve or reject student-uploaded resources', color: 'var(--color-warning)' },
    { to: '/admin?tab=notices',     label: 'Post Notice',           icon: <FileText size={20} />,   desc: 'Send platform-wide announcements', color: '#7C3AED' },
    { to: '/admin?tab=analytics',   label: 'Analytics',             icon: <Activity size={20} />,   desc: 'Download trends and active users', color: 'var(--color-success)' },
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <ShieldCheck size={22} color="var(--color-primary)" />
          <h1 style={{ fontWeight: 700 }}>Admin Dashboard</h1>
        </div>
        <p style={{ color: 'var(--color-text-secondary)' }}>Platform overview and moderation tools</p>
      </div>

      {/* Stats */}
      <section className="grid-4 section-gap">
        <StatCard icon={<Users size={18} />}     label="Total Users"          value={loading ? '…' : stats?.totalUsers}         color="primary" />
        <StatCard icon={<FileText size={18} />}  label="Published Resources"  value={loading ? '…' : stats?.totalResources}     color="success" />
        <StatCard icon={<BookMarked size={18} />}label="Pending Approvals"    value={loading ? '…' : stats?.pendingApprovals}   color="warning" />
        <StatCard icon={<Activity size={18} />}  label="Active Today"         value={loading ? '…' : stats?.activeToday}        color="secondary" />
      </section>

      {/* Quick action cards */}
      <section>
        <h2 style={{ fontSize: '1.125rem', marginBottom: 16 }}>Admin Tools</h2>
        <div className="grid-2">
          {links.map(({ to, label, icon, desc, color }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div
                className="card"
                style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-lg)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
              >
                <div style={{ width: 46, height: 46, borderRadius: 10, background: color + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', marginBottom: 2 }}>{label}</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{desc}</p>
                </div>
                <ArrowRight size={16} color="var(--color-text-muted)" style={{ marginLeft: 'auto' }} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
