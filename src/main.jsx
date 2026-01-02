import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Header from './header/Header.jsx';
import ColorGenerator from './colorGenerator/ColorGenerator.jsx';
import LandingContent from './LandingContent';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Header />
    <ColorGenerator />
    <LandingContent />
    <footer className="site-footer">
      <p>© 2026 CColorPalette — Free Accessible Color Palette Generator Tool</p>
    </footer>
  </React.StrictMode>
);
