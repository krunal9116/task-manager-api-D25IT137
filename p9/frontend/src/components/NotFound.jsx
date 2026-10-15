import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="not-found-section">
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-description">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="error-actions">
          <Link to="/" className="btn btn-primary home-redirect-btn">
            Back to Home 🏠
          </Link>
        </div>
      </div>
      <div className="not-found-visual">
        <div className="error-glow-sphere"></div>
      </div>
    </section>
  );
}
