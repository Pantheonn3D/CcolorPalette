import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { DIRECTORY_PALETTES } from '../../data/paletteDirectory';
import logo from '../../assets/Frame4ico.png';
import './ExplorePage.css';
import { Helmet } from 'react-helmet-async';
import { trackEvent } from '../../utils/analytics';


<Helmet>
  <title>Explore All Color Palettes | CColorPalette Directory</title>
</Helmet>

function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Simple filter to let users find hex codes if they want
  const filteredPalettes = useMemo(() => {
    if (!searchTerm) return DIRECTORY_PALETTES;
    const term = searchTerm.toUpperCase().replace('#', '');
    return DIRECTORY_PALETTES.filter(p => p.includes(term));
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm.length > 2) {
      const timer = setTimeout(() => {
        trackEvent('search_directory', { term: searchTerm });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  return (
    <div className="explore-page">
      {/* Simple Header */}
      <header className="explore-header">
        <div className="header-container">
          <Link to="/" className="header-logo">
             <img src={logo} alt="CColorPalette" className="header-logo-img" />
             <span className="header-logo-text">CColorPalette</span>
          </Link>
          <Link to="/" className="btn-secondary btn-small">
            <ArrowLeft size={16} />
            <span>Back to Generator</span>
          </Link>
        </div>
      </header>

      <main className="explore-main">
        <div className="section-container">
          <div className="explore-hero">
            <h1 className="section-title">Explore All Palettes</h1>
            <p className="section-subtitle">
              Browse our complete directory of {DIRECTORY_PALETTES.length} curated color combinations.
            </p>
            
            {/* Search Bar */}
            <div className="search-wrapper">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Search hex code (e.g. E63946)..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="explore-grid">
            {filteredPalettes.map((paletteString) => {
              const colors = paletteString.split('-');
              return (
                <a 
                  key={paletteString} 
                  href={`/${paletteString}`}
                  className="mini-card"
                  target="_blank" // Optional: open in new tab so they don't lose place
                  rel="noopener noreferrer"
                >
                  <div className="mini-preview">
                    {colors.map((hex, i) => (
                      <div 
                        key={i} 
                        style={{ backgroundColor: `#${hex}` }} 
                        className="mini-stripe"
                      />
                    ))}
                  </div>
                  <span className="mini-label">#{colors[0]}...</span>
                </a>
              );
            })}
          </div>

          {filteredPalettes.length === 0 && (
            <div className="empty-state">
              <p>No palettes found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="explore-footer">
        <p>© 2026 CColorPalette Directory</p>
      </footer>
    </div>
  );
}

export default ExplorePage;