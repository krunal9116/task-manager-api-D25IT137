export default function About({ bio }) {
  return (
    <section id="about" className="about-section">
      <div className="section-header">
        <h2 className="section-title">About Me</h2>
        <div className="section-divider"></div>
      </div>
      <div className="about-grid">
        <div className="about-bio">
          <p className="bio-text">{bio}</p>
          <div className="bio-highlights">
            <div className="highlight-item">
              <span className="highlight-icon">🎓</span>
              <div>
                <h4>Education</h4>
                <p>B.Tech in Computer Science</p>
              </div>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">💼</span>
              <div>
                <h4>Current Focus</h4>
                <p>Frontend Engineering & Creative UX/UI Designs</p>
              </div>
            </div>
          </div>
        </div>
        <div className="about-cards">
          <div className="stats-card">
            <h3 className="stats-num">15+</h3>
            <p className="stats-label">React Projects</p>
          </div>
          <div className="stats-card">
            <h3 className="stats-num">A+</h3>
            <p className="stats-label">Academic Standing</p>
          </div>
          <div className="stats-card">
            <h3 className="stats-num">100%</h3>
            <p className="stats-label">Performance Core Web Vitals</p>
          </div>
          <div className="stats-card">
            <h3 className="stats-num">Git</h3>
            <p className="stats-label">Collaborative Workflows</p>
          </div>
        </div>
      </div>
    </section>
  );
}
