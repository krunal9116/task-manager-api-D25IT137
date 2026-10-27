import { useState, useEffect } from 'react';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import RepoList from './RepoList';

export default function Projects() {
  const [username, setUsername] = useState('krunal9116');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRepositories = async (targetUser = username) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.github.com/users/${targetUser}/repos?sort=updated&per_page=30`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`GitHub user '${targetUser}' was not found.`);
        }
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch repositories. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories(username);
  }, []);

  return (
    <section id="projects" className="projects-section">
      <div className="section-header">
        <h2 className="section-title">GitHub Repositories</h2>
        <div className="section-divider"></div>
      </div>

      <p className="projects-subtitle">
        Dynamically fetched projects directly from the GitHub REST API.
      </p>

      {loading && <Spinner message="Fetching public repositories from GitHub API..." />}
      
      {!loading && error && (
        <ErrorMessage message={error} onRetry={fetchRepositories} />
      )}

      {!loading && !error && <RepoList data={data} />}
    </section>
  );
}
