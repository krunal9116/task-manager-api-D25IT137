import { useState } from 'react';

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const projects = [
    {
      title: "Nova Dashboard",
      description: "A high-performance cloud telemetry dashboard utilizing real-time WebSockets, dynamic charts, and automated threshold alerts.",
      tags: ["React", "Chart.js", "WebSockets", "Tailwind"],
      link: "#",
      icon: "📊"
    },
    {
      title: "Synthetix AI",
      description: "An automated code review agent that leverages large language models to scan commits for security vulnerabilities and performance bottlenecks.",
      tags: ["Node.js", "OpenAI API", "GitHub Actions", "TypeScript"],
      link: "#",
      icon: "🤖"
    },
    {
      title: "Aether Engine",
      description: "A browser-based interactive 3D physics sandbox built using WebGL and custom shaders to simulate fluid dynamics in real time.",
      tags: ["React", "Three.js", "WebGL", "GLSL"],
      link: "#",
      icon: "🌌"
    },
    {
      title: "OmniSearch CLI",
      description: "A lightning-fast command-line interface tool to search, index, and organize files across federated storage networks.",
      tags: ["Go", "gRPC", "CLI", "Shell"],
      link: "#",
      icon: "⚡"
    }
  ];

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <section id="projects" className="projects-section">
      <div className="section-header">
        <h2 className="section-title">Featured Projects</h2>
        <div className="section-divider"></div>
      </div>
      
      <p className="projects-subtitle">
        A curated showcase of engineering solutions, open-source libraries, and creative experiments.
      </p>

      {/* Controlled input for search/filtering */}
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Filter projects by title, description, or tech stack..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          id="project-search"
        />
        {searchQuery && (
          <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
            ✕
          </button>
        )}
      </div>

      <div className="projects-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, index) => (
            <div key={index} className="project-card" id={`project-card-${index}`}>
              <div className="project-header">
                <span className="project-icon">{project.icon}</span>
                <a href={project.link} className="project-link-icon" target="_blank" rel="noreferrer">
                  ↗
                </a>
              </div>
              <div className="project-body">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.description}</p>
              </div>
              <div className="project-footer">
                <div className="project-tags">
                  {project.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="project-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-projects-found">
            <span className="no-results-icon">🔍</span>
            <p>No projects match your search query: "{searchQuery}"</p>
          </div>
        )}
      </div>
    </section>
  );
}
