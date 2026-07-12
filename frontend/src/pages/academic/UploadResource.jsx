import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { uploadResourceFile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const BRANCHES = ['CE', 'IT', 'EC', 'ME', 'Civil'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const RESOURCE_TYPES = [
  { value: 'note',       label: 'Notes' },
  { value: 'pyq',        label: 'Previous Year Question (PYQ)' },
  { value: 'ppt',        label: 'Presentation (PPT)' },
  { value: 'labmanual',  label: 'Lab Manual' },
  { value: 'project',    label: 'Project Report' },
];

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export default function UploadResource() {
  const { dbUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    subject: '',
    subjectCode: '',
    semester: String(dbUser?.semester || 3),
    branch: dbUser?.branch || 'CE',
    type: 'note',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const handleFileChange = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setErrors((p) => ({ ...p, file: 'Only PDF files are allowed.' }));
      return;
    }
    if (f.size > MAX_SIZE_BYTES) {
      setErrors((p) => ({ ...p, file: 'File must be under 10 MB.' }));
      return;
    }
    setFile(f);
    setErrors((p) => ({ ...p, file: '' }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileChange(f);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.subject.trim()) e.subject = 'Subject is required.';
    if (!file) e.file = 'Please select a PDF file.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));

      await uploadResourceFile(formData);

      toast.success(
        dbUser?.role === 'student'
          ? '📤 Upload submitted! Awaiting faculty approval.'
          : '✅ Resource published successfully!'
      );
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFaculty = dbUser?.role !== 'student';

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontWeight: 700, marginBottom: 6 }}>
          <Upload size={22} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: 'var(--color-primary)' }} />
          Upload Resource
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {isFaculty
            ? 'As faculty, your uploads are auto-published.'
            : 'Student uploads are reviewed by faculty before being published.'}
        </p>
      </div>

      {!isFaculty && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--color-warning-bg)',
            border: '1px solid var(--color-warning)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 18px',
            marginBottom: 24,
            fontSize: '0.875rem',
            color: '#92400E',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>
            Your upload will be in <strong>Pending</strong> status until a faculty member reviews it.
            You can track its status in your <strong>Profile → My Uploads</strong>.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

          {/* Left: Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="up-title">Resource title *</label>
              <input id="up-title" name="title" type="text" className={`form-input${errors.title ? ' error' : ''}`}
                placeholder="e.g. Unit 3 - Trees and Graphs Notes" value={form.title} onChange={handleChange} />
              {errors.title && <span className="form-error"><AlertCircle size={12} />{errors.title}</span>}
            </div>

            {/* Subject */}
            <div className="form-group">
              <label className="form-label" htmlFor="up-subject">Subject *</label>
              <input id="up-subject" name="subject" type="text" className={`form-input${errors.subject ? ' error' : ''}`}
                placeholder="e.g. Data Structures" value={form.subject} onChange={handleChange} />
              {errors.subject && <span className="form-error"><AlertCircle size={12} />{errors.subject}</span>}
            </div>

            {/* Subject code (optional) */}
            <div className="form-group">
              <label className="form-label" htmlFor="up-subjectCode">Subject code (optional)</label>
              <input id="up-subjectCode" name="subjectCode" type="text" className="form-input"
                placeholder="e.g. CE301" value={form.subjectCode} onChange={handleChange} />
            </div>

            {/* Branch + Semester + Type row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="up-branch">Branch *</label>
                <select id="up-branch" name="branch" className="form-select" value={form.branch} onChange={handleChange}>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="up-semester">Semester *</label>
                <select id="up-semester" name="semester" className="form-select" value={form.semester} onChange={handleChange}>
                  {SEMESTERS.map((s) => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="up-type">Resource type *</label>
                <select id="up-type" name="type" className="form-select" value={form.type} onChange={handleChange}>
                  {RESOURCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="up-description">Description (optional)</label>
              <textarea id="up-description" name="description" className="form-textarea"
                placeholder="Brief description — topics covered, source, etc."
                value={form.description} onChange={handleChange} style={{ minHeight: 80 }} />
            </div>
          </div>

          {/* Right: File dropzone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p className="form-label" style={{ marginBottom: 6 }}>PDF file *</p>
              <div
                className={`dropzone${dragActive ? ' active' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Upload PDF"
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                id="file-dropzone"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  id="file-input"
                />

                {file ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <FileText size={32} color="var(--color-primary)" />
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary)', wordBreak: 'break-all', textAlign: 'center' }}>
                      {file.name}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      style={{ color: 'var(--color-danger)' }}
                    >
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Upload size={32} color="var(--color-text-muted)" />
                    <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      Drop your PDF here
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      or click to browse
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                      PDF only · Max 10 MB
                    </p>
                  </div>
                )}
              </div>
              {errors.file && <p className="form-error" style={{ marginTop: 6 }}><AlertCircle size={12} />{errors.file}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              id="upload-submit"
            >
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Upload size={16} />}
              {loading ? 'Uploading…' : isFaculty ? 'Publish Resource' : 'Submit for Approval'}
            </button>

            {file && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--color-success)' }}>
                <CheckCircle size={14} />
                File ready to upload
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
