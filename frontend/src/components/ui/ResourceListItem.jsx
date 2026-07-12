import { FileText, Download, Bookmark, BookmarkCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

/** Resource list item used in Academic Hub and Profile bookmarks/uploads */
export default function ResourceListItem({ resource, onDownload, onBookmark, isBookmarked, loading }) {
  const uploadedBy = resource.uploadedBy?.name || 'Unknown';
  const date = new Date(resource.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div
      className="fade-in"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-border)',
        transition: 'background var(--transition-fast)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-alt)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Icon + info */}
      <div style={{ display: 'flex', gap: 14, flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: 40, height: 40, borderRadius: 8,
            background: 'var(--color-primary-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FileText size={18} color="var(--color-primary)" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9375rem' }}>
              {resource.title}
            </p>
            <StatusBadge value={resource.type} />
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Uploaded by <strong>{uploadedBy}</strong> · {date} ·{' '}
            <Download size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
            {resource.downloadCount ?? 0} downloads
          </p>
          {resource.description && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>
              {resource.description}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {onBookmark && (
          <button
            className="btn-icon"
            onClick={() => onBookmark(resource._id)}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {isBookmarked ? (
              <BookmarkCheck size={18} color="var(--color-primary)" />
            ) : (
              <Bookmark size={18} />
            )}
          </button>
        )}
        {onDownload && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onDownload(resource)}
            disabled={loading}
            aria-label={`Download ${resource.title}`}
            id={`download-${resource._id}`}
          >
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Download size={14} />}
            Download
          </button>
        )}
      </div>
    </div>
  );
}
