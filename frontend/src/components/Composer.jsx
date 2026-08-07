import { useRef, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Avatar from './Avatar';

export default function Composer({ onPosted }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!user) return null;

  function pickImage(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  }

  async function submit(e) {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;
    setBusy(true);
    setError('');
    try {
      const { post } = await api.createPost(content.trim(), imageFile);
      setContent('');
      removeImage();
      onPosted(post);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = content.trim() || imageFile;

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

        {imagePreview && (
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
            <img src={imagePreview} alt="" style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 12, display: 'block' }} />
            <button
              type="button"
              onClick={removeImage}
              aria-label="Remove image"
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 26,
                height: 26,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(18,33,58,0.75)',
                color: '#fff',
                fontSize: 14,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={pickImage}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              style={{
                background: 'none',
                border: '1px solid var(--line)',
                borderRadius: 16,
                padding: '4px 12px',
                fontSize: 13,
                color: 'var(--text-dim)',
              }}
            >
              Add image
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{content.length}/500</span>
          </div>
          <button
            type="submit"
            disabled={busy || !canSubmit}
            style={{
              background: canSubmit ? 'var(--ink)' : 'var(--line)',
              color: canSubmit ? '#fff' : 'var(--text-dim)',
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
