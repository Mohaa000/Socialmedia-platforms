import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="empty-state" style={{ padding: '72px 24px' }}>
      <div className="glyph">404</div>
      <p style={{ fontSize: 15 }}>This page doesn't exist.</p>
      <p style={{ marginTop: 14 }}>
        <Link to="/" style={{ color: 'var(--ink)', fontWeight: 600 }}>Back to CampusLink</Link>
      </p>
    </div>
  );
}
