import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../header/Header';
import heroImage from '../../assets/heroImage.jpg';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      <Header isLanding />

      <main
        className="hero-section"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero-content">
          <h1 className="hero-title">CcolorPalette</h1>

          <p className="hero-subtitle">
            Create beautiful, accessible color schemes with one-click
            <br />
            export to CSS, PNG, SVG, and more.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/')}>
              Open Generator
            </button>

            <button className="btn-secondary">
              See how it works (coming soon)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;