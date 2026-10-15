export default function Header({ name, title, themeColor }) {
  return (
    <section id="home" className="hero-section" style={{ '--accent-color': themeColor }}>
      <div className="hero-content">
        <div className="hero-badge" style={{ borderColor: themeColor, color: themeColor }}>
          Available for Opportunities
        </div>
        <h1 className="hero-title">
          Hi, I am <span className="hero-name" style={{ color: themeColor }}>{name}</span>
        </h1>
        <h2 className="hero-subtitle">{title}</h2>
        <p className="hero-description">
          Building high-performance, visually stunning web experiences.
          Specializing in modern React architecture and elegant interactive designs.
        </p>
        <div className="hero-actions">
          <a 
            href="#contact" 
            className="btn btn-primary" 
            id="hero-btn-contact" 
            style={{ backgroundColor: themeColor, boxShadow: `0 0 20px ${themeColor}66` }}
          >
            Get in Touch
          </a>
          <a 
            href="#about" 
            className="btn btn-secondary" 
            id="hero-btn-about"
          >
            Learn More
          </a>
        </div>
      </div>
      <div className="hero-visual">
        <div 
          className="glow-sphere" 
          style={{ background: `radial-gradient(circle, ${themeColor}33 0%, transparent 70%)` }}
        ></div>
        <div className="visual-card">
          <div className="card-header">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <div className="card-body">
            <pre>
              <code>
{`const developer = {
  name: "${name}",
  role: "${title}",
  skills: ["React", "JavaScript", "CSS"],
  philosophy: "Clean, elegant interfaces"
};`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
