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
      {!posts && !error && <p style={{ padding: 20, color: 'var(--text-dim)' }}>Loading feed…</p>}
      {posts && posts.length === 0 && (
        <p style={{ padding: 20, color: 'var(--text-dim)' }}>No posts yet — be the first to share something.</p>
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
