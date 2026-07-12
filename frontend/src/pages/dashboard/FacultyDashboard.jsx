import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Upload, Bell, ArrowRight, CheckCircle } from 'lucide-react';
import { getPendingResources } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/ui/StatCard';
import toast from 'react-hot-toast';

export default function FacultyDashboard() {
  const { dbUser } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPendingResources()
      .then(({ data }) => setPendingCount(data.length))
      .catch(() => toast.error('Failed to load pending count.'))
      .finally(() => setLoading(false));
  }, []);

  const name = dbUser?.name?.split(' ')[0] || 'Faculty';

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontWeight: 700, marginBottom: 4 }}>Welcome, Dr. {name} 👋</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {dbUser?.department ? `${dbUser.department} Department` : 'All Departments'} · Faculty
        </p>
      </div>

      <div className="grid-3 section-gap">
        <StatCard
          icon={<BookMarked size={18} />}
          label="Pending Approvals"
          value={loading ? '…' : pendingCount}
          color={pendingCount > 0 ? 'warning' : 'success'}
          onClick={() => {}}
        />
        <StatCard icon={<Upload size={18} />} label="Upload Resource" value="+" color="primary" onClick={() => {}} />
        <StatCard icon={<Bell size={18} />} label="Post Notice" value="+" color="secondary" onClick={() => {}} />
      </div>

      <div className="grid-2">
        <Link to="/faculty/approvals" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-lg)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookMarked size={22} color="var(--color-warning)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Review Pending Uploads</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                {loading ? 'Loading…' : `${pendingCount} resource${pendingCount !== 1 ? 's' : ''} waiting for your review`}
              </p>
            </div>
            <ArrowRight size={18} color="var(--color-text-muted)" style={{ marginLeft: 'auto' }} />
          </div>
        </Link>

        <Link to="/upload" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-lg)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Upload size={22} color="var(--color-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Upload Verified Resource</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Faculty uploads are auto-published without approval
              </p>
            </div>
            <ArrowRight size={18} color="var(--color-text-muted)" style={{ marginLeft: 'auto' }} />
          </div>
        </Link>
      </div>

      <div style={{ marginTop: 24 }}>
        <div className="card" style={{ background: 'var(--color-primary)', color: '#fff', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle size={20} />
            <div>
              <h4 style={{ marginBottom: 2 }}>Your uploads are auto-approved</h4>
              <p style={{ fontSize: '0.875rem', opacity: 0.85 }}>
                Resources you upload as faculty are immediately published and visible to all students.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
