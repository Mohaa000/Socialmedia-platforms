import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const isHome = location.pathname === '/';
  const isProfile = location.pathname === `/u/${user.username}`;

  return (
    <nav className="sidebar">
      <Link to="/" className={`sidebar-link ${isHome ? 'active' : ''}`}>
        <span className="dot" /> Home
      </Link>
      <Link to={`/u/${user.username}`} className={`sidebar-link ${isProfile ? 'active' : ''}`}>
        <span className="dot" /> Profile
      </Link>
      <button
        className="sidebar-logout"
        onClick={() => {
          logout();
          navigate('/login');
        }}
      >
        Log out
      </button>
    </nav>
  );
}
