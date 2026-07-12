import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Upload, Bookmark, Clock, BookOpen, Briefcase, Bot, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentDashboardStats, getNotices, getResources } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { dbUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [notices, setNotices] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, noticesRes, resourcesRes] = await Promise.all([
          getStudentDashboardStats(),
          getNotices({ limit: 3 }),
          getResources({
            semester: dbUser?.semester,
            branch: dbUser?.branch,
            limit: 5,
          }),
        ]);
        setStats(statsRes.data);
        setNotices(noticesRes.data.notices);
        setRecentResources(resourcesRes.data.resources);
      } catch {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [dbUser]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = dbUser?.name?.split(' ')[0] || 'Student';

  if (loading) {
    return (
      <div className="flex-center" style={{ height: 300 }}>
        <div className="spinner" style={{ width: 32, height: 32, color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Welcome header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontWeight: 700, marginBottom: 4 }}>
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {dbUser?.branch} · Semester {dbUser?.semester} · {dbUser?.enrollmentNo || 'ADIT Student'}
        </p>
      </div>

      {/* Stats row */}
      <section className="grid-4 section-gap">
        <StatCard icon={<Download size={18} />} label="Total Downloads" value={stats?.downloads ?? 0} color="primary" />
        <StatCard icon={<Upload size={18} />} label="Notes Uploaded" value={stats?.uploads ?? 0} color="success" />
        <StatCard icon={<Bookmark size={18} />} label="Bookmarks" value={stats?.bookmarks ?? 0} color="secondary" />
        <StatCard icon={<Clock size={18} />} label="Pending Uploads" value={stats?.pendingUploads ?? 0} color="warning" />
      </section>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24, marginBottom: 32 }}>

        {/* Recent Notices */}
        <section>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.125rem' }}>Recent Notices</h2>
            <Link to="/notices" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 500 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {notices.length === 0 ? (
              <EmptyState icon="📢" title="No notices yet" description="New notices will appear here." />
            ) : (
              notices.map((notice, i) => (
                <div
                  key={notice._id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: i < notices.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <div className="flex-between" style={{ marginBottom: 4 }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{notice.title}</h4>
                    <StatusBadge value={notice.category} />
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {notice.body}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 6 }}>
                    {new Date(notice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Resources */}
        <section>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.125rem' }}>New Resources</h2>
            <Link to="/academic" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 500 }}>
              Browse <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {recentResources.length === 0 ? (
              <EmptyState icon="📄" title="No resources yet" description={`No notes found for ${dbUser?.branch} Sem ${dbUser?.semester}.`} />
            ) : (
              recentResources.map((r, i) => (
                <div
                  key={r._id}
                  style={{ padding: '12px 16px', borderBottom: i < recentResources.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                >
                  <div style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: 2 }}>{r.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {r.subject} · <StatusBadge value={r.type} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Quick Links */}
      <section>
        <h2 style={{ fontSize: '1.125rem', marginBottom: 16 }}>Quick Links</h2>
        <div className="grid-3">
          {[
            { to: '/academic', icon: <BookOpen size={24} />, label: 'Academic Hub', desc: 'Browse notes, PYQs, PPTs', color: 'var(--color-primary)' },
            { to: '/placement', icon: <Briefcase size={24} />, label: 'Placement Hub', desc: 'Companies, packages, tips', color: '#7C3AED' },
            { to: '/upload', icon: <Upload size={24} />, label: 'Upload Notes', desc: 'Contribute to the community', color: 'var(--color-success)' },
          ].map(({ to, icon, label, desc, color }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div
                className="card"
                style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-lg)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{desc}</div>
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
