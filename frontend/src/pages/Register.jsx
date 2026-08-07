import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { inputStyle, buttonStyle } from './Login';

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
    <div style={{ padding: '48px 24px', maxWidth: 380, margin: '0 auto' }}>
      <h1 className="display" style={{ fontSize: 30 }}>Join CampusLink</h1>
      <p style={{ color: 'var(--text-dim)', marginTop: -8 }}>Connect with your USIU-Africa community.</p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
        <input placeholder="Display name" value={form.displayName} onChange={set('displayName')} required style={inputStyle} />
        <input placeholder="Username" value={form.username} onChange={set('username')} required style={inputStyle} />
        <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required style={inputStyle} />
        <input type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={set('password')} required style={inputStyle} />
        {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
        <button type="submit" disabled={busy} style={buttonStyle}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p style={{ marginTop: 18, fontSize: 14 }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--ink)', fontWeight: 600 }}>Log in</Link>
      </p>
    </div>
  );
}
