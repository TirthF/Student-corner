import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResources, downloadResource, toggleBookmark, getBookmarkStatus } from '../../services/api';
import ResourceListItem from '../../components/ui/ResourceListItem';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const TABS = [
  { value: 'note',      label: 'Notes' },
  { value: 'pyq',       label: 'PYQs' },
  { value: 'ppt',       label: 'PPTs' },
  { value: 'labmanual', label: 'Lab Manuals' },
];

export default function SubjectPage({ semester, branch, subject, breadcrumb }) {
  const [activeTab, setActiveTab] = useState('note');
  const [resources, setResources] = useState([]);
  const [bookmarks, setBookmarks] = useState({});  // resourceId → boolean
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    loadResources();
  }, [activeTab, semester, branch, subject]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const { data } = await getResources({
        semester, branch, type: activeTab, status: 'published',
        limit: 50,
      });
      // Filter by subject name (backend doesn't have subject field filter yet — do it client side)
      const filtered = data.resources.filter(
        (r) => r.subject.toLowerCase().includes(subject.toLowerCase()) ||
                subject.toLowerCase().includes(r.subject.toLowerCase())
      );
      setResources(filtered);

      // Load bookmark status for each resource
      const statuses = await Promise.all(
        filtered.map((r) => getBookmarkStatus(r._id).then(({ data: d }) => [r._id, d.bookmarked]))
      );
      setBookmarks(Object.fromEntries(statuses));
    } catch {
      toast.error('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource) => {
    setDownloadingId(resource._id);
    try {
      const { data } = await downloadResource(resource._id);

      // Extract extension from Cloudinary URL, or default to .pdf
      const urlPath = new URL(data.fileUrl).pathname;
      const urlExt = urlPath.includes('.') ? urlPath.substring(urlPath.lastIndexOf('.')) : '';
      const ext = urlExt || '.pdf'; // fallback — only PDFs are accepted on upload
      const filename = `${resource.title}${ext}`;

      const response = await fetch(data.fileUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Downloading "${filename}"`);
    } catch {
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleBookmark = async (resourceId) => {
    try {
      const { data } = await toggleBookmark(resourceId);
      setBookmarks((p) => ({ ...p, [resourceId]: data.bookmarked }));
      toast.success(data.bookmarked ? 'Bookmarked!' : 'Bookmark removed.');
    } catch {
      toast.error('Failed to update bookmark.');
    }
  };

  return (
    <div className="fade-in">
      {breadcrumb}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontWeight: 700, marginBottom: 4 }}>{subject}</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {branch} · Semester {semester}
        </p>
      </div>

      {/* Resource type tabs */}
      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`tab-btn${activeTab === tab.value ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
            id={`tab-${tab.value}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Resource list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
            <div className="spinner" style={{ width: 28, height: 28, color: 'var(--color-primary)' }} />
          </div>
        ) : resources.length === 0 ? (
          <EmptyState
            icon="📄"
            title={`No ${TABS.find((t) => t.value === activeTab)?.label} yet`}
            description={`No ${activeTab === 'note' ? 'notes' : activeTab === 'pyq' ? 'PYQs' : activeTab === 'ppt' ? 'PPTs' : 'lab manuals'} have been uploaded for ${subject} yet.`}
            action={
              <a href="/upload" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                Upload Now →
              </a>
            }
          />
        ) : (
          resources.map((resource) => (
            <ResourceListItem
              key={resource._id}
              resource={resource}
              onDownload={handleDownload}
              onBookmark={handleBookmark}
              isBookmarked={bookmarks[resource._id] || false}
              loading={downloadingId === resource._id}
            />
          ))
        )}
      </div>
    </div>
  );
}
