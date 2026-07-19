import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BRANCHES = ['CE', 'IT', 'EC', 'ME', 'Civil'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const ALLOWED_DOMAIN = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN || '@adit.ac.in';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', enrollmentNo: '', email: '',
    branch: 'CE', semester: '3',
    password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email) {
      e.email = 'Email is required.';
    } else if (!form.email.endsWith(ALLOWED_DOMAIN)) {
      e.email = `Email must end with ${ALLOWED_DOMAIN} (use your college email).`;
    }
    if (!form.password) {
      e.password = 'Password is required.';
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters.';
    }
    if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match.';
    }
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
    setServerError('');

    try {
      await register({
        name: form.name,
        enrollmentNo: form.enrollmentNo,
        email: form.email.toLowerCase(),
        branch: form.branch,
        semester: parseInt(form.semester),
        password: form.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const code = err.code;
      if (code === 'auth/weak-password') {
        setErrors({ password: 'Password is too weak. Use at least 8 characters with letters and numbers.' });
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        // Firebase account exists but the password entered is wrong
        setErrors({ email: 'An account with this email already exists but the password is incorrect. Please sign in instead.' });
      } else if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label" htmlFor={`reg-${name}`}>{label}</label>
      <input
        id={`reg-${name}`}
        name={name}
        type={type}
        className={`form-input${errors[name] ? ' error' : ''}`}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
        autoComplete={name}
      />
      {errors[name] && <span className="form-error"><AlertCircle size={12} />{errors[name]}</span>}
    </div>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0B3D91 0%, #1E5AA8 50%, #0B3D91 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-2xl)',
          padding: '40px 36px',
          width: '100%',
          maxWidth: 480,
          boxShadow: 'var(--shadow-xl)',
        }}
        className="fade-in"
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}
          >
            <GraduationCap size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Create your account</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Join CampusOS — your ADIT student hub
          </p>
        </div>

        {serverError && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: 20,
              fontSize: '0.875rem',
              color: 'var(--color-danger)',
            }}
          >
            <AlertCircle size={16} />{serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {field('name', 'Full name', 'text', 'Your full name')}
            {field('enrollmentNo', 'Enrollment number (optional)', 'text', 'e.g. ADIT21CE001')}

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">College email</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                className={`form-input${errors.email ? ' error' : ''}`}
                placeholder={`you${ALLOWED_DOMAIN}`}
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email ? (
                <span className="form-error"><AlertCircle size={12} />{errors.email}</span>
              ) : form.email && form.email.endsWith(ALLOWED_DOMAIN) ? (
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={12} /> Valid college email
                </span>
              ) : (
                <span className="form-hint">Must end with {ALLOWED_DOMAIN}</span>
              )}
            </div>

            {/* Branch + Semester row */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-branch">Branch</label>
                <select id="reg-branch" name="branch" className="form-select" value={form.branch} onChange={handleChange}>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-semester">Semester</label>
                <select id="reg-semester" name="semester" className="form-select" value={form.semester} onChange={handleChange}>
                  {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input${errors.password ? ' error' : ''}`}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  className="btn-icon"
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error"><AlertCircle size={12} />{errors.password}</span>}
            </div>

            {/* Confirm password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirmPassword">Confirm password</label>
              <input
                id="reg-confirmPassword"
                name="confirmPassword"
                type="password"
                className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="form-error"><AlertCircle size={12} />{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              id="register-submit"
              style={{ marginTop: 4 }}
            >
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Create account'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
