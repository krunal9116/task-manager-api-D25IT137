import React from 'react';

export default function ErrorMessage({ message = "Failed to load repositories.", onRetry }) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Unable to Fetch Repositories</h3>
      <p className="error-text">{message}</p>
      {onRetry && (
        <button className="error-retry-btn" onClick={onRetry}>
          🔄 Try Again
        </button>
      )}
    </div>
  );
}
