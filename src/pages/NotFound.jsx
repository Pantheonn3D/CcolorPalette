// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, Palette, Search, BookOpen } from 'lucide-react';
import { SiteHeader, SiteFooter } from '../components/SEOLayout';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found-page">
      <Helmet>
        <title>Page Not Found | CColorPalette</title>
        <meta name="description" content="The page you're looking for doesn't exist. Explore our color palette generator, guides, and resources." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <SiteHeader />

      <main className="not-found-main">
        <div className="not-found-content">
          <div className="not-found-visual">
            <span className="error-code">404</span>
          </div>
          
          <h1>Page Not Found</h1>
          <p>
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>

          <div className="not-found-links">
            <Link to="/" className="not-found-link primary">
              <Palette size={20} />
              <span>Open Palette Generator</span>
            </Link>
            <Link to="/home" className="not-found-link">
              <Home size={20} />
              <span>Go Home</span>
            </Link>
            <Link to="/explore" className="not-found-link">
              <Search size={20} />
              <span>Explore Palettes</span>
            </Link>
            <Link to="/guides/color-theory" className="not-found-link">
              <BookOpen size={20} />
              <span>Read Guides</span>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default NotFound;