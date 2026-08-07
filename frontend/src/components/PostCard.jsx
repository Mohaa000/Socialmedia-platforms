import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Avatar from './Avatar';

function timeAgo(isoLike) {
  const then = new Date(isoLike.replace(' ', 'T') + 'Z').getTime();
  const diffSec = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  return `${Math.floor(diffHr / 24)}d`;
}

export default function PostCard({ post, onChange }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [liking, setLiking] = useState(false);

  async function toggleLike() {
    if (!user || liking) return;
    setLiking(true);
    try {
      const result = post.likedByViewer ? await api.unlike(post.id) : await api.like(post.id);
      onChange({ ...post, likeCount: result.likeCount, likedByViewer: result.likedByViewer });
    } catch (err) {
      // silently ignore
    } finally {
      setLiking(false);
    }
  }

  async function openComments() {
    setShowComments((s) => !s);
    if (!comments) {
      const data = await api.comments(post.id);
      setComments(data.comments);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const { comment } = await api.addComment(post.id, commentText.trim());
    setComments((c) => [...(c || []), comment]);
    setCommentText('');
    onChange({ ...post, commentCount: post.commentCount + 1 });
  }

  async function remove() {
    if (!confirm('Delete this post?')) return;
    await api.deletePost(post.id);
    onChange(null);
  }

  return (
    <article style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to={`/u/${post.author.username}`}>
          <Avatar name={post.author.displayName} color={post.author.avatarColor} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <Link to={`/u/${post.author.username}`} style={{ fontWeight: 700 }}>{post.author.displayName}</Link>
            <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>@{post.author.username}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>· {timeAgo(post.createdAt)}</span>
            {user && user.id === post.author.id && (
              <button onClick={remove} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 13 }}>
                Delete
              </button>
            )}
          </div>
          {post.content && (
            <p style={{ margin: '6px 0 10px', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>{post.content}</p>
          )}
          {post.image && (
            <img
              src={post.image}
              alt=""
              style={{ maxWidth: '100%', maxHeight: 420, borderRadius: 12, margin: '4px 0 10px', display: 'block' }}
            />
          )}

          <div style={{ display: 'flex', gap: 22 }}>
            <button
              onClick={toggleLike}
              disabled={!user}
              style={{
                background: 'none',
                border: 'none',
                color: post.likedByViewer ? 'var(--danger)' : 'var(--text-dim)',
                fontSize: 13,
                fontWeight: post.likedByViewer ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {post.likedByViewer ? '♥' : '♡'} {post.likeCount}
            </button>
            <button onClick={openComments} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 13 }}>
              💬 {post.commentCount}
            </button>
          </div>

          {showComments && (
            <div style={{ marginTop: 12, paddingLeft: 4 }}>
              {(comments || []).map((c) => (
                <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <Avatar name={c.author.displayName} color={c.author.avatarColor} size={26} />
                  <div style={{ background: 'var(--paper-dim)', borderRadius: 12, padding: '6px 12px', fontSize: 14 }}>
                    <strong>{c.author.displayName}</strong> <span style={{ color: 'var(--text)' }}>{c.content}</span>
                  </div>
                </div>
              ))}
              {user && (
                <form onSubmit={submitComment} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment…"
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 16, background: '#fff' }}
                  />
                  <button type="submit" style={{ background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 16, padding: '0 16px', fontSize: 13 }}>
                    Reply
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
