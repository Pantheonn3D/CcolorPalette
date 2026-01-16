// src/App.jsx - UPDATED
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import ColorGenerator from './colorGenerator/ColorGenerator';
import LandingPage from './pages/LandingPage/LandingPage';
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import TermsOfService from './pages/Legal/TermsOfService';
import ExplorePage from './pages/Explore/ExplorePage';
import ScrollToTop from './components/ScrollToTop';

// NEW SEO PAGES
import ColorTheoryGuide from './pages/Guides/ColorTheoryGuide';
import AccessibilityGuide from './pages/Guides/AccessibilityGuide';
import TailwindColorsGuide from './pages/Guides/TailwindColorsGuide';
import BrandingColorsGuide from './pages/Guides/BrandingColorsGuide';
import ColorPsychologyGuide from './pages/Guides/ColorPsychologyGuide';
import WebDesignColorsGuide from './pages/Guides/WebDesignColorsGuide';
import ColorGlossary from './pages/Resources/ColorGlossary';
import ColorConverterPage from './pages/Tools/ColorConverterPage';
import ContrastCheckerPage from './pages/Tools/ContrastCheckerPage';
import PaletteByColor from './pages/Explore/PaletteByColor';
import PaletteByMood from './pages/Explore/PaletteByMood';
import PaletteByIndustry from './pages/Explore/PaletteByIndustry';
import Sitemap from './pages/Sitemap';
import NotFound from './pages/NotFound';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Main Pages */}
          <Route path="/home" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          
          {/* Guides & Articles (SEO Content) */}
          <Route path="/guides/color-theory" element={<ColorTheoryGuide />} />
          <Route path="/guides/accessibility-wcag" element={<AccessibilityGuide />} />
          <Route path="/guides/tailwind-css-colors" element={<TailwindColorsGuide />} />
          <Route path="/guides/brand-color-palette" element={<BrandingColorsGuide />} />
          <Route path="/guides/color-psychology" element={<ColorPsychologyGuide />} />
          <Route path="/guides/web-design-colors" element={<WebDesignColorsGuide />} />
          
          {/* Resources */}
          <Route path="/glossary" element={<ColorGlossary />} />
          <Route path="/sitemap" element={<Sitemap />} />
          
          {/* Tools */}
          <Route path="/tools/color-converter" element={<ColorConverterPage />} />
          <Route path="/tools/contrast-checker" element={<ContrastCheckerPage />} />
          
          {/* Palette Discovery (Topic Clusters) */}
          <Route path="/palettes/color/:colorFamily" element={<PaletteByColor />} />
          <Route path="/palettes/mood/:mood" element={<PaletteByMood />} />
          <Route path="/palettes/industry/:industry" element={<PaletteByIndustry />} />
          
          {/* Legal */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* Palette Generator (catch-all) */}
          <Route path="/:hexCodes" element={<ColorGenerator />} />
          <Route path="/" element={<ColorGenerator />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;