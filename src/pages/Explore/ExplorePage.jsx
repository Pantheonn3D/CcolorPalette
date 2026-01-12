import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, PlusCircle } from 'lucide-react';
import logo from '../../assets/Frame4ico.png';
import './ExplorePage.css';
import { Helmet } from 'react-helmet-async';
import { trackEvent } from '../../utils/analytics';

// CHANGE 1: Import the generated JSON instead of the static directory
// Ensure you have run the script so this file exists!
import GENERATED_PALETTES from '../../data/generated-palettes.json';

// Fallback in case the script hasn't run yet, prevents crash
const PALETTES_SOURCE = GENERATED_PALETTES || [];

function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // CHANGE 2: Pagination state
  const [displayLimit, setDisplayLimit] = useState(60); 

  // Filter logic
  const filteredPalettes = useMemo(() => {
    if (!searchTerm) return PALETTES_SOURCE;
    const term = searchTerm.toUpperCase().replace('#', '');
    return PALETTES_SOURCE.filter(p => p.includes(term));
  }, [searchTerm]);

  // Determine what is currently visible based on limit
  const visiblePalettes = useMemo(() => {
    return filteredPalettes.slice(0, displayLimit);
  }, [filteredPalettes, displayLimit]);

  useEffect(() => {
    if (searchTerm.length > 2) {
      const timer = setTimeout(() => {
        trackEvent('search_directory', { term: searchTerm });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  // Reset pagination when search changes
  useEffect(() => {
    setDisplayLimit(60);
  }, [searchTerm]);

  return (
    <div className="explore-page">
      <Helmet>
        <title>Explore All Color Palettes | CColorPalette Directory</title>
        <meta name="description" content={`Browse our complete directory of ${PALETTES_SOURCE.length} curated color combinations.`} />
      </Helmet>

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
              Browse our complete directory of {PALETTES_SOURCE.length} curated color combinations.
            </p>
            
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
            {visiblePalettes.map((paletteString) => {
              const colors = paletteString.split('-');
              return (
                <a 
                  key={paletteString} 
                  href={`/${paletteString}`}
                  className="mini-card"
                  target="_blank" 
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

          {/* Load More Button */}
          {visiblePalettes.length < filteredPalettes.length && (
            <div className="load-more-container" style={{ textAlign: 'center', margin: '40px 0' }}>
              <button 
                onClick={() => setDisplayLimit(prev => prev + 60)} 
                className="btn-secondary"
                style={{ padding: '12px 24px', cursor: 'pointer' }}
              >
                <PlusCircle size={18} style={{ marginRight: '8px' }}/>
                Load More
              </button>
              <p style={{ marginTop: '10px', opacity: 0.6, fontSize: '0.9rem' }}>
                Showing {visiblePalettes.length} of {filteredPalettes.length}
              </p>
            </div>
          )}

          {filteredPalettes.length === 0 && (
            <div className="empty-state">
              <p>No palettes found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </main>

      <footer className="explore-footer">
        <p>© 2026 CColorPalette Directory</p>
      </footer>
    </div>
  );
}

export default ExplorePage;