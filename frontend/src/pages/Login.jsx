import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api.login({ username, password });
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
      <h1 className="display" style={{ fontSize: 30 }}>Welcome back</h1>
      <p style={{ color: 'var(--text-dim)', marginTop: -8 }}>Log in to CampusLink.</p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
        <input
          placeholder="Username or email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
        <button type="submit" disabled={busy} style={buttonStyle}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p style={{ marginTop: 18, fontSize: 14 }}>
        New here? <Link to="/register" style={{ color: 'var(--ink)', fontWeight: 600 }}>Create an account</Link>
      </p>
    </div>
  );
}

export const inputStyle = {
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid var(--line)',
  fontSize: 15,
  background: '#fff',
};

export const buttonStyle = {
  padding: '12px 14px',
  borderRadius: 8,
  border: 'none',
  background: 'var(--ink)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 15,
};
