import { useState, useEffect } from 'react';
import { Bell, Plus, X, Filter } from 'lucide-react';
import { getNotices, createNotice, deleteNotice } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'General', 'Dept', 'Placement', 'Event'];

export default function NoticePage() {
  const { role } = useAuth();
  const canPost = role === 'faculty' || role === 'admin';

  const [notices, setNotices] = useState([]);
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', category: 'General' });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, [filter, page]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const { data } = await getNotices({ category: filter === 'All' ? '' : filter, page, limit: 10 });
      setNotices(data.notices);
      setTotalPages(data.pages);
    } catch {
      toast.error('Failed to load notices.');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Title and body are required.');
      return;
    }
    setPosting(true);
    try {
      await createNotice(form);
      toast.success('Notice posted successfully!');
      setShowModal(false);
      setForm({ title: '', body: '', category: 'General' });
      fetchNotices();
    } catch {
      toast.error('Failed to post notice.');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Remove notice "${title}"?`)) return;
    try {
      await deleteNotice(id);
      setNotices((p) => p.filter((n) => n._id !== id));
      toast.success('Notice removed.');
    } catch {
      toast.error('Failed to remove notice.');
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: 28 }}>
        <div>
          <h1 style={{ fontWeight: 700, marginBottom: 4 }}>
            <Bell size={22} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: 'var(--color-primary)' }} />
            Notice Board
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Campus announcements, exam schedules, placement drives, and events
          </p>
        </div>
        {canPost && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="post-notice-btn">
            <Plus size={16} /> Post Notice
          </button>
        )}
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <Filter size={16} style={{ color: 'var(--color-text-muted)', alignSelf: 'center' }} />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setFilter(cat); setPage(1); }}
            className={`btn btn-sm${filter === cat ? ' btn-primary' : ' btn-secondary'}`}
            id={`filter-${cat.toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notices list */}
      {loading ? (
        <div className="flex-center" style={{ height: 200 }}>
          <div className="spinner" style={{ width: 28, height: 28, color: 'var(--color-primary)' }} />
        </div>
      ) : notices.length === 0 ? (
        <div className="card">
          <EmptyState icon="📢" title="No notices found" description="No notices in this category yet." />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notices.map((notice) => (
            <div key={notice._id} className="card fade-in" style={{ padding: '20px 24px' }}>
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{notice.title}</h3>
                  <StatusBadge value={notice.category} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(notice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  {role === 'admin' && (
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(notice._id, notice.title)}
                      aria-label="Delete notice"
                      style={{ color: 'var(--color-danger)' }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                {notice.body}
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 10 }}>
                Posted by {notice.postedBy?.name} ({notice.postedBy?.role})
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Previous
          </button>
          <span style={{ padding: '6px 14px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}

      {/* Post Notice Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            className="card fade-in"
            style={{ maxWidth: 520, width: '100%', padding: 36, boxShadow: 'var(--shadow-xl)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-modal-title"
          >
            <div className="flex-between" style={{ marginBottom: 24 }}>
              <h2 id="notice-modal-title" style={{ fontSize: '1.25rem' }}>Post a Notice</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={handlePost}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="notice-title">Title *</label>
                  <input id="notice-title" type="text" className="form-input"
                    placeholder="e.g. Mid-Semester Exam Schedule"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="notice-body">Body *</label>
                  <textarea id="notice-body" className="form-textarea" style={{ minHeight: 120 }}
                    placeholder="Full notice text…"
                    value={form.body}
                    onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="notice-category">Category</label>
                  <select id="notice-category" className="form-select"
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  >
                    {['General', 'Dept', 'Placement', 'Event'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={posting} id="notice-submit">
                    {posting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Bell size={14} />}
                    Post Notice
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
