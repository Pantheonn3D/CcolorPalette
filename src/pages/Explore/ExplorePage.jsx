import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  PlusCircle, 
  Palette, 
  ArrowRight, 
  Grid3X3,
  Sparkles,
  Filter,
  X,
  ChevronDown,
  Shuffle,
  TrendingUp,
  Clock,
  Hash,
} from 'lucide-react';
import logo from '../../assets/Frame4ico.png';
import './ExplorePage.css';
import { Helmet } from 'react-helmet-async';
import { trackEvent } from '../../utils/analytics';

// Import the auto-generated data
import GENERATED_PALETTES from '../../data/generated-palettes.json';

const PALETTES_SOURCE = Array.isArray(GENERATED_PALETTES) ? GENERATED_PALETTES : [];

// Color family filters for search refinement
const COLOR_FAMILIES = [
  { id: 'red', label: 'Reds', hueRange: [0, 20], color: '#E63946' },
  { id: 'orange', label: 'Oranges', hueRange: [20, 45], color: '#F4A261' },
  { id: 'yellow', label: 'Yellows', hueRange: [45, 70], color: '#E9C46A' },
  { id: 'green', label: 'Greens', hueRange: [70, 170], color: '#2A9D8F' },
  { id: 'blue', label: 'Blues', hueRange: [170, 260], color: '#457B9D' },
  { id: 'purple', label: 'Purples', hueRange: [260, 320], color: '#7B2CBF' },
  { id: 'pink', label: 'Pinks', hueRange: [320, 360], color: '#E056A0' },
];

// Sorting options
const SORT_OPTIONS = [
  { id: 'default', label: 'Default', icon: Grid3X3 },
  { id: 'colorCount', label: 'Color Count', icon: Hash },
  { id: 'random', label: 'Random', icon: Shuffle },
];

// Helper to convert hex to HSL
const hexToHsl = (hex) => {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: h = 0;
    }
    h *= 360;
  }

  return { h, s: s * 100, l: l * 100 };
};

// Check if a palette contains a color in a given hue range
const paletteHasHueRange = (paletteString, hueRange) => {
  const colors = paletteString.split('-');
  return colors.some(hex => {
    const hsl = hexToHsl(hex);
    if (hueRange[0] > hueRange[1]) {
      // Wrap around (e.g., reds: 320-360 and 0-20)
      return hsl.h >= hueRange[0] || hsl.h <= hueRange[1];
    }
    return hsl.h >= hueRange[0] && hsl.h <= hueRange[1];
  });
};

function ExplorePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [displayLimit, setDisplayLimit] = useState(60);
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [randomSeed, setRandomSeed] = useState(Date.now());

  // Filter logic
  const filteredPalettes = useMemo(() => {
    let result = PALETTES_SOURCE;

    // Text search
    if (searchTerm) {
      const term = searchTerm.toUpperCase().replace('#', '');
      result = result.filter(p => p.includes(term));
    }

    // Color family filters - AND logic (must contain ALL selected colors)
    if (activeFilters.length > 0) {
      result = result.filter(palette => {
        return activeFilters.every(filterId => {  // Changed from .some() to .every()
          const family = COLOR_FAMILIES.find(f => f.id === filterId);
          if (!family) return false;
          return paletteHasHueRange(palette, family.hueRange);
        });
      });
    }

    return result;
  }, [searchTerm, activeFilters]);

  // Sort logic
  const sortedPalettes = useMemo(() => {
    let result = [...filteredPalettes];

    switch (sortBy) {
      case 'colorCount':
        result.sort((a, b) => b.split('-').length - a.split('-').length);
        break;
      case 'random':
        // Seeded random function (doesn't modify seed)
        const seededRandom = (seed) => {
          const x = Math.sin(seed) * 10000;
          return x - Math.floor(x);
        };
        
        // Fisher-Yates shuffle with seed
        for (let i = result.length - 1; i > 0; i--) {
          const j = Math.floor(seededRandom(randomSeed + i) * (i + 1));
          [result[i], result[j]] = [result[j], result[i]];
        }
        break;
      default:
        break;
    }

    return result;
  }, [filteredPalettes, sortBy, randomSeed]);

  // Visible palettes based on limit
  const visiblePalettes = useMemo(() => {
    return sortedPalettes.slice(0, displayLimit);
  }, [sortedPalettes, displayLimit]);

  // Track search
  useEffect(() => {
    if (searchTerm.length > 2) {
      const timer = setTimeout(() => {
        trackEvent('search_explore', { term: searchTerm, results: filteredPalettes.length });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, filteredPalettes.length]);

  // Reset pagination when search/filters change
  useEffect(() => {
    setDisplayLimit(60);
  }, [searchTerm, activeFilters, sortBy]);

  // Toggle filter
  const toggleFilter = (filterId) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
    trackEvent('filter_explore', { filter: filterId });
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([]);
    setSearchTerm('');
    setSortBy('default');
  };

  // Reshuffle random
  const reshuffle = () => {
    setRandomSeed(Date.now());
    setSortBy('random');
  };

  // Schema.org structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Color Palette Directory",
    "description": `Browse ${PALETTES_SOURCE.length} curated color palettes for design projects`,
    "url": "https://ccolorpalette.com/explore",
    "numberOfItems": PALETTES_SOURCE.length,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": PALETTES_SOURCE.length,
      "itemListElement": visiblePalettes.slice(0, 10).map((palette, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://ccolorpalette.com/${palette}`
      }))
    }
  };

  return (
    <div className="explore-page">
      <Helmet>
        <title>Explore {PALETTES_SOURCE.length.toLocaleString()}+ Color Palettes | CColorPalette Directory</title>
        <meta 
          name="description" 
          content={`Browse our complete directory of ${PALETTES_SOURCE.length.toLocaleString()} curated color palettes. Find the perfect color scheme for web design, branding, UI/UX, and creative projects. Filter by color family, search by hex code.`} 
        />
        <meta name="keywords" content="color palettes, color schemes, hex colors, design palettes, color combinations, web design colors, brand colors, UI colors" />
        
        {/* Open Graph */}
        <meta property="og:title" content={`Explore ${PALETTES_SOURCE.length.toLocaleString()}+ Color Palettes | CColorPalette`} />
        <meta property="og:description" content="Browse thousands of curated color palettes for your next design project." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ccolorpalette.com/explore" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://ccolorpalette.com/explore" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Header */}
      <header className="explore-header">
        <div className="explore-header-inner">
          <Link to="/home" className="explore-logo">
            <img src={logo} alt="CColorPalette" className="explore-logo-img" />
            <span className="explore-logo-text">CColorPalette</span>
          </Link>

          <nav className="explore-nav">
            <Link to="/" className="explore-nav-link">
              <Palette size={16} />
              <span>Generator</span>
            </Link>
          </nav>

          <button 
            className="explore-cta"
            onClick={() => navigate('/')}
          >
            <Sparkles size={16} />
            <span>Create New</span>
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="explore-hero">
        <div className="explore-hero-content">
          <div className="explore-badge">
            <Grid3X3 size={14} />
            <span>Color Palette Directory</span>
          </div>
          
          <h1 className="explore-title">
            Explore {PALETTES_SOURCE.length.toLocaleString()}+ Color Palettes
          </h1>
          
          <p className="explore-subtitle">
            Browse our curated collection of harmonious color combinations.
            Find the perfect palette for your next project.
          </p>

          {/* Search */}
          <div className="explore-search-container">
            <div className="explore-search">
              <Search size={20} className="explore-search-icon" />
              <input
                type="text"
                placeholder="Search by hex code (e.g., E63946, 457B9D)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="explore-search-input"
              />
              {searchTerm && (
                <button 
                  className="explore-search-clear"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button 
              className={`explore-filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <span className="filter-count">{activeFilters.length}</span>
              )}
              <ChevronDown size={16} className={`chevron ${showFilters ? 'open' : ''}`} />
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="explore-filters">
              <div className="filters-section">
                <span className="filters-label">Color Family</span>
                <div className="filters-options">
                  {COLOR_FAMILIES.map(family => (
                    <button
                      key={family.id}
                      className={`filter-chip ${activeFilters.includes(family.id) ? 'active' : ''}`}
                      onClick={() => toggleFilter(family.id)}
                    >
                      <span 
                        className="filter-dot" 
                        style={{ backgroundColor: family.color }}
                      />
                      {family.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filters-section">
                <span className="filters-label">Sort By</span>
                <div className="filters-options">
                  {SORT_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      className={`filter-chip ${sortBy === option.id ? 'active' : ''}`}
                      onClick={() => option.id === 'random' ? reshuffle() : setSortBy(option.id)}
                    >
                      <option.icon size={14} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {(activeFilters.length > 0 || searchTerm || sortBy !== 'default') && (
                <button className="filters-clear" onClick={clearFilters}>
                  <X size={14} />
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Results Info */}
      <div className="explore-results-info">
        <div className="results-count">
          <span className="results-number">{sortedPalettes.length.toLocaleString()}</span>
          <span className="results-label">
            {sortedPalettes.length === PALETTES_SOURCE.length ? 'palettes' : 'palettes found'}
          </span>
        </div>
        {(activeFilters.length > 0 || searchTerm) && (
          <div className="results-filters">
            {searchTerm && (
              <span className="result-tag">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')}><X size={12} /></button>
              </span>
            )}
            {activeFilters.map(filterId => {
              const family = COLOR_FAMILIES.find(f => f.id === filterId);
              return family ? (
                <span key={filterId} className="result-tag">
                  <span className="tag-dot" style={{ backgroundColor: family.color }} />
                  {family.label}
                  <button onClick={() => toggleFilter(filterId)}><X size={12} /></button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <main className="explore-main">
        {visiblePalettes.length > 0 ? (
          <div className="explore-grid">
            {visiblePalettes.map((paletteString) => {
              const colors = paletteString.split('-');
              return (
                <Link
                  key={paletteString}
                  to={`/${paletteString}`}
                  className="palette-card"
                  onClick={() => trackEvent('explore_palette_click', { palette: paletteString })}
                >
                  <div className="palette-preview">
                    {colors.map((hex, i) => (
                      <div
                        key={i}
                        className="palette-stripe"
                        style={{ backgroundColor: `#${hex}` }}
                      />
                    ))}
                  </div>
                  <div className="palette-footer">
                    <span className="palette-hex">#{colors[0]}</span>
                    <span className="palette-count">{colors.length} colors</span>
                    <ArrowRight size={14} className="palette-arrow" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="explore-empty">
            <div className="empty-icon">
              <Search size={48} />
            </div>
            <h3>No palettes found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn-primary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}

        {/* Load More */}
        {visiblePalettes.length < sortedPalettes.length && (
          <div className="explore-load-more">
            <button
              className="load-more-btn"
              onClick={() => setDisplayLimit(prev => prev + 60)}
            >
              <PlusCircle size={20} />
              <span>Load More Palettes</span>
            </button>
            <span className="load-more-count">
              Showing {visiblePalettes.length.toLocaleString()} of {sortedPalettes.length.toLocaleString()}
            </span>
          </div>
        )}
      </main>

      {/* SEO Content */}
      <section className="explore-seo">
        <div className="seo-content">
          <h2>About the Color Palette Directory</h2>
          <p>
            The CColorPalette directory contains {PALETTES_SOURCE.length.toLocaleString()} professionally curated 
            color combinations, each designed using color theory principles like complementary, analogous, 
            triadic, and split-complementary harmonies. Every palette is hand-picked for visual appeal and 
            practical application in web design, branding, UI/UX, marketing materials, and creative projects.
          </p>
          <p>
            Use the search bar to find palettes containing specific hex colors, or filter by color family 
            to discover combinations featuring reds, blues, greens, purples, and more. Click any palette to 
            open it in the generator where you can customize, check accessibility, and export to CSS, 
            Tailwind, JSON, SVG, or PNG.
          </p>
          <div className="seo-links">
            <Link to="/">Color Palette Generator</Link>
            <Link to="/home">Learn About Color Theory</Link>
            <Link to="/home#features">Generator Features</Link>
            <Link to="/home#faq">FAQ</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="explore-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src={logo} alt="CColorPalette" className="footer-logo" />
            <span>CColorPalette</span>
          </div>
          <div className="footer-links">
            <Link to="/">Generator</Link>
            <Link to="/home">Home</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
          <p className="footer-copy">
            © {new Date().getFullYear()} CColorPalette. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default ExplorePage;