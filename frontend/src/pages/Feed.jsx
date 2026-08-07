import { useEffect, useState } from 'react';
import { api } from '../api';
import Composer from '../components/Composer';
import PostCard from '../components/PostCard';

export default function Feed() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.feed().then((data) => setPosts(data.posts)).catch((err) => setError(err.message));
  }, []);

  function handleChange(updated) {
    if (!updated) return; // deletion refresh happens via filter below (we don't know id here)
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function handlePosted(newPost) {
    setPosts((prev) => [newPost, ...(prev || [])]);
  }

  return (
    <div>
      <div style={{ padding: '20px 20px 8px' }}>
        <h1 className="display" style={{ fontSize: 26, margin: 0 }}>Campus Feed</h1>
        <p style={{ color: 'var(--text-dim)', margin: '4px 0 0', fontSize: 14 }}>
          What's happening across USIU-Africa right now.
        </p>
      </div>
      <Composer onPosted={handlePosted} />

      {error && <p style={{ padding: 20, color: 'var(--danger)' }}>{error}</p>}
      {!posts && !error && (
        <div>
          {[0, 1, 2].map((i) => (
            <div className="skeleton-post" key={i}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '40%', height: 12, marginBottom: 10 }} />
                <div className="skeleton" style={{ width: '90%', height: 12, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: '65%', height: 12 }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {posts && posts.length === 0 && (
        <div className="empty-state">
          <div className="glyph">✎</div>
          <p>No posts yet — be the first to share something.</p>
        </div>
      )}
      {posts && posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onChange={(updated) => {
            if (updated === null) {
              setPosts((prev) => prev.filter((p) => p.id !== post.id));
            } else {
              handleChange(updated);
            }
          }}
        />
      ))}
    </div>
  );
}
