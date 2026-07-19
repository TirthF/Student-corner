import { useState, useEffect } from 'react';
import { ShieldCheck, Users, BookMarked, Bell, Plus, X, AlertCircle, Search, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  getUsers, createUser, deactivateUser, reactivateUser,
  getPendingResources, approveResource, rejectResource,
  updateUserRole,
} from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const BRANCHES = ['CE', 'IT', 'EC', 'ME', 'Civil'];

export default function AdminPanel() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'users';
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <ShieldCheck size={22} color="var(--color-primary)" />
          <h1 style={{ fontWeight: 700 }}>Admin Panel</h1>
        </div>
        <p style={{ color: 'var(--color-text-secondary)' }}>User management, resource moderation, and platform controls</p>
      </div>

      <div className="tabs">
        {[
          { value: 'users',      label: 'User Management', icon: Users },
          { value: 'moderation', label: 'Resource Moderation', icon: BookMarked },
          { value: 'notices',    label: 'Notices', icon: Bell },
        ].map(({ value, label, icon: Icon }) => (
          <button key={value} className={`tab-btn${activeTab === value ? ' active' : ''}`}
            onClick={() => setActiveTab(value)} id={`admin-tab-${value}`}>
            <Icon size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'users'      && <UserManagementTab />}
      {activeTab === 'moderation' && <ModerationTab />}
      {activeTab === 'notices'    && <NoticesTab />}
    </div>
  );
}

// ─── User Management ──────────────────────────────────────────────────────────
function UserManagementTab() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchUsers(); }, [search, roleFilter, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await getUsers({ search, role: roleFilter, page, limit: 20 });
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.pages);
    } catch { toast.error('Failed to load users.'); }
    finally { setLoading(false); }
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Deactivate ${name}'s account?`)) return;
    setActionLoading(id);
    try {
      await deactivateUser(id);
      setUsers((p) => p.map((u) => u._id === id ? { ...u, isDeactivated: true } : u));
      toast.success(`${name}'s account deactivated.`);
    } catch { toast.error('Failed to deactivate user.'); }
    finally { setActionLoading(null); }
  };

  const handleReactivate = async (id, name) => {
    setActionLoading(id);
    try {
      await reactivateUser(id);
      setUsers((p) => p.map((u) => u._id === id ? { ...u, isDeactivated: false } : u));
      toast.success(`${name}'s account reactivated.`);
    } catch { toast.error('Failed to reactivate user.'); }
    finally { setActionLoading(null); }
  };

  const handleRoleChange = async (id, name, newRole) => {
    if (!window.confirm(`Change ${name}'s role to "${newRole}"?`)) return;
    setActionLoading(id + '-role');
    try {
      await updateUserRole(id, newRole);
      setUsers((p) => p.map((u) => u._id === id ? { ...u, role: newRole } : u));
      toast.success(`${name}'s role updated to ${newRole}.`);
    } catch { toast.error('Failed to update role.'); }
    finally { setActionLoading(null); }
  };

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="search" className="form-input" placeholder="Search by name, email or enrollment…"
            style={{ paddingLeft: 36 }} value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="form-select" style={{ width: 140 }} value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} id="create-user-btn">
          <Plus size={16} /> Create Account
        </button>
        <button className="btn btn-ghost" onClick={fetchUsers} aria-label="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
        {total} user{total !== 1 ? 's' : ''} found
      </p>

      {loading ? (
        <div className="flex-center" style={{ height: 200 }}>
          <div className="spinner" style={{ width: 24, height: 24, color: 'var(--color-primary)' }} />
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon="👥" title="No users found" description="Try adjusting your filters." />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Branch / Sem</th>
                <th>Enrollment No.</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ opacity: u.isDeactivated ? 0.55 : 1 }}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{u.email}</div>
                  </td>
                  <td><StatusBadge value={u.role} /></td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{u.branch} · Sem {u.semester}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{u.enrollmentNo || '—'}</td>
                  <td>
                    {u.isDeactivated
                      ? <span className="badge badge-rejected">Deactivated</span>
                      : <span className="badge badge-published">Active</span>}
                  </td>
                  <td style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Role changer */}
                    <select
                      className="form-select"
                      style={{ fontSize: '0.8rem', padding: '3px 6px', width: 'auto', minWidth: 90 }}
                      value={u.role}
                      disabled={actionLoading === u._id + '-role'}
                      onChange={(e) => handleRoleChange(u._id, u.name, e.target.value)}
                      id={`role-select-${u._id}`}
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>

                    {u.isDeactivated ? (
                      <button className="btn btn-success btn-sm" onClick={() => handleReactivate(u._id, u.name)}
                        disabled={actionLoading === u._id} id={`reactivate-${u._id}`}>
                        {actionLoading === u._id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Reactivate'}
                      </button>
                    ) : (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(u._id, u.name)}
                        disabled={actionLoading === u._id || u.role === 'admin'} id={`deactivate-${u._id}`}
                        title={u.role === 'admin' ? 'Cannot deactivate admin accounts here' : ''}>
                        {actionLoading === u._id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Deactivate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span style={{ padding: '6px 14px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {page} / {totalPages}
          </span>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); fetchUsers(); }}
        />
      )}
    </div>
  );
}

function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'faculty', department: '', branch: 'CE', semester: '1' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await createUser(form);
      toast.success(`${form.role} account created for ${form.name}.`);
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account.');
    } finally { setLoading(false); }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card fade-in" style={{ maxWidth: 480, width: '100%', padding: 36, boxShadow: 'var(--shadow-xl)' }}
        role="dialog" aria-modal="true" aria-labelledby="create-user-title">
        <div className="flex-between" style={{ marginBottom: 24 }}>
          <h2 id="create-user-title" style={{ fontSize: '1.25rem' }}>Create Account</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="cu-name">Full name *</label>
              <input id="cu-name" name="name" type="text" className={`form-input${errors.name ? ' error' : ''}`}
                placeholder="Dr. Jane Smith" value={form.name} onChange={handleChange} />
              {errors.name && <span className="form-error"><AlertCircle size={12} />{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cu-email">Email *</label>
              <input id="cu-email" name="email" type="email" className={`form-input${errors.email ? ' error' : ''}`}
                placeholder="faculty@adit.ac.in" value={form.email} onChange={handleChange} />
              {errors.email && <span className="form-error"><AlertCircle size={12} />{errors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cu-password">Temporary password *</label>
              <input id="cu-password" name="password" type="password" className={`form-input${errors.password ? ' error' : ''}`}
                placeholder="At least 8 characters" value={form.password} onChange={handleChange} autoComplete="new-password" />
              {errors.password && <span className="form-error"><AlertCircle size={12} />{errors.password}</span>}
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="cu-role">Role *</label>
                <select id="cu-role" name="role" className="form-select" value={form.role} onChange={handleChange}>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cu-department">Department</label>
                <select id="cu-department" name="department" className="form-select" value={form.department} onChange={handleChange}>
                  <option value="">All Departments</option>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading} id="create-user-submit">
                {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Plus size={14} />}
                Create Account
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Moderation Tab (reuses approval flow) ─────────────────────────────────
function ModerationTab() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await getPendingResources();
      setResources(data);
    } catch { toast.error('Failed to load pending resources.'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id, title) => {
    setActionLoading(id);
    try {
      await approveResource(id);
      setResources((p) => p.filter((r) => r._id !== id));
      toast.success(`✅ "${title}" approved.`);
    } catch { toast.error('Approval failed.'); }
    finally { setActionLoading(null); }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal) return;
    const r = resources.find((r) => r._id === rejectModal);
    setActionLoading(rejectModal);
    try {
      await rejectResource(rejectModal, rejectReason);
      setResources((p) => p.filter((r) => r._id !== rejectModal));
      toast.success(`Rejected "${r?.title}".`);
      setRejectModal(null);
      setRejectReason('');
    } catch { toast.error('Rejection failed.'); }
    finally { setActionLoading(null); }
  };

  if (loading) return <div className="flex-center" style={{ height: 200 }}><div className="spinner" style={{ width: 24, height: 24, color: 'var(--color-primary)' }} /></div>;

  if (resources.length === 0) return <EmptyState icon="✅" title="All caught up!" description="No pending resources to moderate." />;

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
        {resources.length} resource{resources.length !== 1 ? 's' : ''} pending across all departments
      </p>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Uploader</th>
              <th>Branch / Sem</th>
              <th>Type</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => (
              <tr key={r._id}>
                <td style={{ fontWeight: 600 }}>{r.title}</td>
                <td>
                  <div>{r.uploadedBy?.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{r.uploadedBy?.enrollmentNo || r.uploadedBy?.email}</div>
                </td>
                <td>{r.branch} · Sem {r.semester}<br /><span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{r.subject}</span></td>
                <td><StatusBadge value={r.type} /></td>
                <td style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Preview</a>
                    <button className="btn btn-success btn-sm" onClick={() => handleApprove(r._id, r.title)} disabled={actionLoading === r._id}>Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => { setRejectModal(r._id); setRejectReason(''); }} disabled={actionLoading === r._id}>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}
          onClick={(e) => { if (e.target === e.currentTarget) setRejectModal(null); }}>
          <div className="card fade-in" style={{ maxWidth: 440, width: '100%', padding: 32, boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ marginBottom: 16 }}>Reject Resource</h3>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="admin-reject-reason">Reason (optional)</label>
              <textarea id="admin-reject-reason" className="form-textarea" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleRejectSubmit} disabled={actionLoading === rejectModal}>
                {actionLoading === rejectModal ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Notices Tab ──────────────────────────────────────────────────────────────
function NoticesTab() {
  return (
    <div>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>
        Use the main Notices page to post and manage notices. The link below opens it.
      </p>
      <a href="/notices" className="btn btn-primary" style={{ textDecoration: 'none' }}>
        <Bell size={16} /> Go to Notice Board
      </a>
    </div>
  );
}
