import { useState, useEffect } from 'react';
import { User, Upload, Bookmark, Settings, Camera, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMyUploads, getBookmarks, downloadResource, updateProfile } from '../../services/api';
import ResourceListItem from '../../components/ui/ResourceListItem';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const TABS = [
  { value: 'overview', label: 'Overview', icon: User },
  { value: 'uploads',  label: 'My Uploads', icon: Upload },
  { value: 'bookmarks',label: 'Bookmarks', icon: Bookmark },
  { value: 'settings', label: 'Settings', icon: Settings },
];

export default function ProfilePage() {
  const { dbUser, refreshProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [uploads, setUploads] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Settings state
  const [pwForm, setPwForm] = useState({ newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (activeTab === 'uploads' && uploads.length === 0) loadUploads();
    if (activeTab === 'bookmarks' && bookmarks.length === 0) loadBookmarks();
  }, [activeTab]);

  const loadUploads = async () => {
    setLoading(true);
    try {
      const { data } = await getMyUploads();
      setUploads(data);
    } catch { toast.error('Failed to load uploads.'); }
    finally { setLoading(false); }
  };

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const { data } = await getBookmarks();
      setBookmarks(data);
    } catch { toast.error('Failed to load bookmarks.'); }
    finally { setLoading(false); }
  };

  const handleDownload = async (resource) => {
    setDownloadingId(resource._id);
    try {
      const { data } = await downloadResource(resource._id);
      window.open(data.fileUrl, '_blank');
      toast.success(`Downloading "${resource.title}"`);
    } catch { toast.error('Download failed.'); }
    finally { setDownloadingId(null); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('Passwords do not match.');
      return;
    }
    setPwLoading(true);
    setPwError('');
    try {
      await changePassword(pwForm.newPassword);
      toast.success('Password changed successfully!');
      setPwForm({ newPassword: '', confirm: '' });
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        setPwError('For security, please log out and log back in before changing your password.');
      } else {
        setPwError('Failed to change password. Please try again.');
      }
    } finally { setPwLoading(false); }
  };

  const avatarLetter = dbUser?.name?.[0]?.toUpperCase() || '?';

  return (
    <div className="fade-in">
      {/* Profile header */}
      <div
        className="card"
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
          border: 'none',
          color: '#fff',
          padding: '32px 28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem', fontWeight: 700, color: '#fff',
                border: '3px solid rgba(255,255,255,0.4)',
              }}
            >
              {dbUser?.profilePhoto
                ? <img src={dbUser.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : avatarLetter
              }
            </div>
          </div>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 4, color: '#fff' }}>
              {dbUser?.name}
            </h1>
            <p style={{ opacity: 0.85, fontSize: '0.9rem', marginBottom: 6 }}>{dbUser?.email}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '3px 12px', fontSize: '0.8125rem' }}>
                {dbUser?.branch}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '3px 12px', fontSize: '0.8125rem' }}>
                Semester {dbUser?.semester}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '3px 12px', fontSize: '0.8125rem', textTransform: 'capitalize' }}>
                {dbUser?.role}
              </span>
              {dbUser?.enrollmentNo && (
                <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '3px 12px', fontSize: '0.8125rem' }}>
                  {dbUser.enrollmentNo}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            className={`tab-btn${activeTab === value ? ' active' : ''}`}
            onClick={() => setActiveTab(value)}
            id={`profile-tab-${value}`}
          >
            <Icon size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            {label}
          </button>
        ))}
      </div>

      {/* ─── Overview ─── */}
      {activeTab === 'overview' && (
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Profile Information</h3>
          <div className="grid-2" style={{ gap: 24 }}>
            {[
              ['Full Name', dbUser?.name],
              ['Email', dbUser?.email],
              ['Enrollment No.', dbUser?.enrollmentNo || '—'],
              ['Branch', dbUser?.branch],
              ['Semester', `Semester ${dbUser?.semester}`],
              ['Role', dbUser?.role],
              ['Joined', dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                  {label}
                </p>
                <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── My Uploads ─── */}
      {activeTab === 'uploads' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3>My Uploaded Resources</h3>
            <a href="/upload" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
              + Upload New
            </a>
          </div>
          {loading ? (
            <div className="flex-center" style={{ height: 200 }}>
              <div className="spinner" style={{ width: 24, height: 24, color: 'var(--color-primary)' }} />
            </div>
          ) : uploads.length === 0 ? (
            <div className="card">
              <EmptyState icon="📄" title="No uploads yet" description="Share your notes with ADIT students."
                action={<a href="/upload" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Upload Now →</a>}
              />
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Downloads</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads.map((r) => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 500, maxWidth: 220 }}>{r.title}</td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{r.subject}</td>
                      <td><StatusBadge value={r.type} /></td>
                      <td>
                        <StatusBadge value={r.status} />
                        {r.status === 'rejected' && r.rejectionReason && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: 4, maxWidth: 200 }}>
                            Reason: {r.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>{r.downloadCount}</td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Bookmarks ─── */}
      {activeTab === 'bookmarks' && (
        <div>
          <h3 style={{ marginBottom: 16 }}>Saved Resources</h3>
          {loading ? (
            <div className="flex-center" style={{ height: 200 }}>
              <div className="spinner" style={{ width: 24, height: 24, color: 'var(--color-primary)' }} />
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="card">
              <EmptyState icon="🔖" title="No bookmarks yet" description="Bookmark resources in the Academic Hub for quick access." />
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {bookmarks.map((r) => (
                <ResourceListItem
                  key={r._id}
                  resource={r}
                  onDownload={handleDownload}
                  loading={downloadingId === r._id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Settings ─── */}
      {activeTab === 'settings' && (
        <div className="card" style={{ maxWidth: 480 }}>
          <h3 style={{ marginBottom: 24 }}>Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">New password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="new-password"
                    type={showPw ? 'text' : 'password'}
                    className={`form-input${pwError ? ' error' : ''}`}
                    placeholder="At least 8 characters"
                    value={pwForm.newPassword}
                    onChange={(e) => { setPwForm((p) => ({ ...p, newPassword: e.target.value })); setPwError(''); }}
                    style={{ paddingRight: 44 }}
                    autoComplete="new-password"
                  />
                  <button type="button" className="btn-icon" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                    onClick={() => setShowPw((p) => !p)} aria-label="Toggle password visibility">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">Confirm new password</label>
                <input
                  id="confirm-password"
                  type="password"
                  className={`form-input${pwError ? ' error' : ''}`}
                  placeholder="Re-enter new password"
                  value={pwForm.confirm}
                  onChange={(e) => { setPwForm((p) => ({ ...p, confirm: e.target.value })); setPwError(''); }}
                  autoComplete="new-password"
                />
                {pwError && <span className="form-error"><AlertCircle size={12} />{pwError}</span>}
              </div>
              <button type="submit" className="btn btn-primary" disabled={pwLoading} id="change-password-submit">
                {pwLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
