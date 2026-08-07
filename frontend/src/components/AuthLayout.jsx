export default function AuthLayout({ title, tagline, children, footer }) {
  return (
    <div>
      <div className="auth-banner">
        <span className="brand-word">CampusLink</span>
        <p className="brand-tag">{tagline}</p>
      </div>
      <div className="auth-card">
        <h1 className="display" style={{ fontSize: 26, margin: '20px 0 0' }}>{title}</h1>
        {children}
        {footer}
      </div>
    </div>
  );
}
