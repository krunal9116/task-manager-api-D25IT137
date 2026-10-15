import React from 'react';

export default function Spinner({ message = "Loading repositories from GitHub..." }) {
  return (
    <div className="spinner-container">
      <div className="spinner" role="status" aria-label="loading"></div>
      <p className="spinner-message">{message}</p>
    </div>
  );
}
