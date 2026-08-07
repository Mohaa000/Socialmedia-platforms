import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', displayName: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api.register(form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Join CampusLink"
      tagline="Connect with your USIU-Africa community."
      footer={
        <p className="auth-footer-link">
          Already have an account? <Link to="/login" style={{ color: 'var(--ink)', fontWeight: 600 }}>Log in</Link>
        </p>
      }
    >
      <form onSubmit={submit} className="auth-form">
        <input placeholder="Display name" value={form.displayName} onChange={set('displayName')} required className="auth-input" />
        <input placeholder="Username" value={form.username} onChange={set('username')} required className="auth-input" />
        <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required className="auth-input" />
        <input type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={set('password')} required className="auth-input" />
        {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
        <button type="submit" disabled={busy} className="auth-button">
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
