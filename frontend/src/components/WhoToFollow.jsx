import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Avatar from './Avatar';

export default function WhoToFollow() {
  const [users, setUsers] = useState(null);
  const [followed, setFollowed] = useState({});

  useEffect(() => {
    api.suggestions().then((data) => setUsers(data.users)).catch(() => setUsers([]));
  }, []);

  async function follow(username) {
    setFollowed((f) => ({ ...f, [username]: true }));
    try {
      await api.follow(username);
    } catch (err) {
      setFollowed((f) => ({ ...f, [username]: false }));
    }
  }

  if (!users || users.length === 0) return null;

  return (
    <div className="who-to-follow">
      <h2>Who to follow</h2>
      <div className="who-to-follow-list">
        {users.map((u) => (
          <div className="who-to-follow-row" key={u.id}>
            <Link to={`/u/${u.username}`} style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
              <Avatar name={u.display_name} color={u.avatar_color} size={36} />
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>{u.display_name}</span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)' }}>@{u.username}</span>
              </span>
            </Link>
            <button
              onClick={() => follow(u.username)}
              disabled={!!followed[u.username]}
              className="who-to-follow-btn"
            >
              {followed[u.username] ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
