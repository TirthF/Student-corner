import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Clock, AlertCircle } from 'lucide-react';
import { getPendingResources, approveResource, rejectResource } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function ApprovalQueue() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // resourceId or null
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await getPendingResources();
      setResources(data);
    } catch {
      toast.error('Failed to load pending resources.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, title) => {
    setActionLoading(id);
    try {
      await approveResource(id);
      setResources((p) => p.filter((r) => r._id !== id));
      toast.success(`✅ "${title}" approved and published.`);
    } catch {
      toast.error('Approval failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal) return;
    const resource = resources.find((r) => r._id === rejectModal);
    setActionLoading(rejectModal);
    try {
      await rejectResource(rejectModal, rejectReason);
      setResources((p) => p.filter((r) => r._id !== rejectModal));
      toast.success(`Rejected "${resource?.title}".`);
      setRejectModal(null);
      setRejectReason('');
    } catch {
      toast.error('Rejection failed.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontWeight: 700, marginBottom: 6 }}>
          <Clock size={22} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: 'var(--color-warning)' }} />
          Pending Approvals
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {loading ? 'Loading…' : `${resources.length} resource${resources.length !== 1 ? 's' : ''} waiting for review`}
        </p>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: 300 }}>
          <div className="spinner" style={{ width: 28, height: 28, color: 'var(--color-primary)' }} />
        </div>
      ) : resources.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="✅"
            title="All caught up!"
            description="No pending resources to review right now."
          />
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Resource</th>
                <th>Uploaded by</th>
                <th>Branch / Sem</th>
                <th>Type</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{r.title}</div>
                    {r.description && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.uploadedBy?.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{r.uploadedBy?.email}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{r.branch}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}> · Sem {r.semester}</span>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{r.subject}</div>
                  </td>
                  <td><StatusBadge value={r.type} /></td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                        title="Preview PDF"
                      >
                        <Eye size={14} /> Preview
                      </a>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApprove(r._id, r.title)}
                        disabled={actionLoading === r._id}
                        id={`approve-${r._id}`}
                      >
                        {actionLoading === r._id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <CheckCircle size={14} />}
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => { setRejectModal(r._id); setRejectReason(''); }}
                        disabled={actionLoading === r._id}
                        id={`reject-${r._id}`}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}
          onClick={(e) => { if (e.target === e.currentTarget) setRejectModal(null); }}
        >
          <div
            className="card fade-in"
            style={{ maxWidth: 440, width: '100%', padding: 32, boxShadow: 'var(--shadow-xl)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-dialog-title"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <AlertCircle size={20} color="var(--color-danger)" />
              <h3 id="reject-dialog-title" style={{ fontSize: '1.0625rem' }}>Reject Resource</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              Provide an optional reason to help the student improve their upload.
            </p>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="reject-reason">Reason (optional)</label>
              <textarea
                id="reject-reason"
                className="form-textarea"
                placeholder="e.g. Duplicate upload, poor quality scan, wrong subject…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setRejectModal(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={handleRejectSubmit}
                disabled={actionLoading === rejectModal}
                id="reject-confirm"
              >
                {actionLoading === rejectModal ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <XCircle size={14} />}
                Reject Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
