import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Avatar from '../components/Avatar';

export default function Profile() {
  const { username } = useParams();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');

  const isOwnProfile = user && user.username === username;

  function load() {
    api.profile(username)
      .then(({ user: u, posts: p }) => { setProfile(u); setPosts(p); setBio(u.bio || ''); })
      .catch((err) => setError(err.message));
  }

  useEffect(() => { load(); }, [username]);

  async function toggleFollow() {
    if (!user) return;
    if (profile.isFollowedByViewer) {
      await api.unfollow(username);
    } else {
      await api.follow(username);
    }
    load();
  }

  async function saveBio() {
    const { user: updated } = await api.updateProfile({ bio });
    setEditing(false);
    setUser(updated);
    load();
  }

  if (error) return <p style={{ padding: 20, color: 'var(--danger)' }}>{error}</p>;
  if (!profile) return <p style={{ padding: 20, color: 'var(--text-dim)' }}>Loading profile…</p>;

  return (
    <div>
      <div style={{ padding: 24, borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Avatar name={profile.display_name} color={profile.avatar_color} size={64} />
          <div>
            <h1 className="display" style={{ fontSize: 24, margin: 0 }}>{profile.display_name}</h1>
            <p style={{ color: 'var(--text-dim)', margin: '2px 0' }}>@{profile.username}</p>
          </div>
          {!isOwnProfile && user && (
            <button
              onClick={toggleFollow}
              style={{
                marginLeft: 'auto',
                background: profile.isFollowedByViewer ? '#fff' : 'var(--ink)',
                color: profile.isFollowedByViewer ? 'var(--ink)' : '#fff',
                border: '1px solid var(--ink)',
                borderRadius: 20,
                padding: '8px 18px',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {profile.isFollowedByViewer ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {editing ? (
          <div style={{ marginTop: 14 }}>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              style={{ width: '100%', padding: 10, border: '1px solid var(--line)', borderRadius: 8 }}
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button onClick={saveBio} style={{ background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px' }}>Save</button>
              <button onClick={() => setEditing(false)} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 14px' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <p style={{ marginTop: 14, lineHeight: 1.5 }}>
            {profile.bio || <span style={{ color: 'var(--text-dim)' }}>No bio yet.</span>}
            {isOwnProfile && (
              <button onClick={() => setEditing(true)} style={{ marginLeft: 10, background: 'none', border: 'none', color: 'var(--ink)', fontWeight: 600, fontSize: 13 }}>
                Edit
              </button>
            )}
          </p>
        )}

        <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 14 }}>
          <span><strong>{profile.followerCount}</strong> <span style={{ color: 'var(--text-dim)' }}>followers</span></span>
          <span><strong>{profile.followingCount}</strong> <span style={{ color: 'var(--text-dim)' }}>following</span></span>
          <span><strong>{posts.length}</strong> <span style={{ color: 'var(--text-dim)' }}>posts</span></span>
        </div>
      </div>

      {posts.map((post) => (
        <article key={post.id} style={{ padding: '14px 24px', borderBottom: '1px solid var(--line)' }}>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{post.content}</p>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: 'var(--text-dim)' }}>
            <span>♡ {post.likeCount}</span>
            <span>💬 {post.commentCount}</span>
          </div>
        </article>
      ))}
      {posts.length === 0 && <p style={{ padding: 24, color: 'var(--text-dim)' }}>No posts yet.</p>}
    </div>
  );
}
