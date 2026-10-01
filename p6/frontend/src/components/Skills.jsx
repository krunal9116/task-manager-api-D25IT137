export default function Skills({ skills }) {
  return (
    <section id="skills" className="skills-section">
      <div className="section-header">
        <h2 className="section-title">My Skills</h2>
        <div className="section-divider"></div>
      </div>
      <p className="skills-subtitle">
        A representation of my core technical expertise and engineering competencies.
      </p>
      <div className="skills-grid">
        {skills.map((skill, index) => (
          <div key={index} className="skill-card" id={`skill-card-${index}`}>
            <div className="skill-info">
              <span className="skill-name">{skill.name}</span>
              <span className="skill-level">{skill.level}%</span>
            </div>
            <div className="skill-bar-container">
              <div 
                className="skill-bar-progress" 
                style={{ 
                  width: `${skill.level}%`,
                  background: `linear-gradient(90deg, var(--accent-color, #6366f1) 0%, #a855f7 100%)`
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
