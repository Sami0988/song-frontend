import React from 'react';
import './Loader.css';

const Loader = ({ loadingText = "Loading..." }) => {
  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <p className="loader-text">{loadingText}</p>
      </div>
    </div>
  );
};

export default Loader;