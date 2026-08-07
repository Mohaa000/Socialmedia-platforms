import { Link } from 'react-router-dom';

const FEATURES = [
  {
    num: '01',
    title: 'Post updates',
    body: "Share what's on your mind in a clean, focused feed built for quick updates.",
  },
  {
    num: '02',
    title: 'Follow your circle',
    body: 'Follow classmates and friends to keep their updates close.',
  },
  {
    num: '03',
    title: 'Join the conversation',
    body: 'Like and comment on posts to keep the conversation going.',
  },
];

export default function Landing() {
  return (
    <div>
      <div className="landing-hero">
        <span className="landing-kicker">USIU-Africa community feed</span>
        <h1 className="display">Everything happening on campus, in one feed.</h1>
        <p className="landing-lead">
          CampusLink is where USIU-Africa students share updates, follow classmates, and keep up
          with what's happening — all in one place.
        </p>
        <div className="landing-cta">
          <Link to="/register" className="btn-primary">Create an account</Link>
          <Link to="/login" className="btn-secondary">Log in</Link>
        </div>
      </div>

      <div className="landing-features">
        {FEATURES.map((f) => (
          <div className="landing-feature" key={f.num}>
            <div className="num">{f.num}</div>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </div>

      <p className="landing-footer">CampusLink — built for the USIU-Africa community.</p>
    </div>
  );
}
