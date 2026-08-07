import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Avatar from './Avatar';

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'var(--ink)',
        color: '#fff',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '3px solid var(--gold)',
      }}
    >
      <Link to="/" className="display" style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>
        CampusLink
      </Link>

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => navigate(`/u/${user.username}`)}
            style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}
            aria-label={`View ${user.displayName}'s profile`}
          >
            <Avatar name={user.displayName} color={user.avatar_color} size={32} />
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.35)',
              color: '#fff',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 13,
            }}
          >
            Log out
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          style={{
            background: 'var(--gold)',
            color: 'var(--ink)',
            fontWeight: 600,
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 14,
          }}
        >
          Log in
        </Link>
      )}
    </header>
  );
}
