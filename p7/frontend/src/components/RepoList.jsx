import { useState } from 'react';

export default function RepoList({ data }) {
  const [searchQuery, setSearchQuery] = useState('');

  const repositories = Array.isArray(data) ? data : [];

  const filteredRepos = repositories.filter(repo => {
    const query = searchQuery.toLowerCase();
    const name = repo.name ? repo.name.toLowerCase() : '';
    const desc = repo.description ? repo.description.toLowerCase() : '';
    const lang = repo.language ? repo.language.toLowerCase() : '';
    return name.includes(query) || desc.includes(query) || lang.includes(query);
  });

  return (
    <div className="repo-list-wrapper">
      {/* Search & Filter bar */}
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search repositories by name, description, or language..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          id="repo-search"
        />
        {searchQuery && (
          <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
            ✕
          </button>
        )}
      </div>

      <div className="projects-grid">
        {filteredRepos.length > 0 ? (
          filteredRepos.map((repo) => (
            <div key={repo.id || repo.name} className="project-card repo-card" id={`repo-card-${repo.id}`}>
              <div className="project-header">
                <span className="project-icon">📁</span>
                <a 
                  href={repo.html_url} 
                  className="project-link-icon" 
                  target="_blank" 
                  rel="noreferrer"
                  title="View repository on GitHub"
                >
                  ↗
                </a>
              </div>
              <div className="project-body">
                <h3 className="project-title">
                  <a href={repo.html_url} target="_blank" rel="noreferrer" className="repo-title-link">
                    {repo.name}
                  </a>
                </h3>
                <p className="project-desc">
                  {repo.description || "No description provided for this repository."}
                </p>
              </div>
              <div className="project-footer">
                <div className="repo-stats">
                  {repo.language && (
                    <span className="repo-stat-badge language-badge">
                      <span className="language-dot"></span>
                      {repo.language}
                    </span>
                  )}
                  <span className="repo-stat-badge">
                    ⭐ {repo.stargazers_count ?? 0}
                  </span>
                  <span className="repo-stat-badge">
                    🍴 {repo.forks_count ?? 0}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-projects-found">
            <span className="no-results-icon">🔍</span>
            <p>No repositories match your search query: "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
