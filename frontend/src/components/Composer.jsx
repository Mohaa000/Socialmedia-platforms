import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Avatar from './Avatar';

export default function Composer({ onPosted }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  async function submit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    setError('');
    try {
      const { post } = await api.createPost(content.trim());
      setContent('');
      onPosted(post);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{
        display: 'flex',
        gap: 12,
        padding: '18px 20px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--paper)',
      }}
    >
      <Avatar name={user.displayName} color={user.avatar_color} />
      <div style={{ flex: 1 }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening on campus?"
          maxLength={500}
          rows={2}
          style={{
            width: '100%',
            border: 'none',
            resize: 'none',
            fontSize: 16,
            background: 'transparent',
            color: 'var(--text)',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{content.length}/500</span>
          <button
            type="submit"
            disabled={busy || !content.trim()}
            style={{
              background: content.trim() ? 'var(--ink)' : 'var(--line)',
              color: content.trim() ? '#fff' : 'var(--text-dim)',
              border: 'none',
              borderRadius: 20,
              padding: '8px 20px',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {busy ? 'Posting…' : 'Post'}
          </button>
        </div>
        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 6 }}>{error}</p>}
      </div>
    </form>
  );
}
