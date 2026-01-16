import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import ColorGenerator from './colorGenerator/ColorGenerator';
import LandingPage from './pages/LandingPage/LandingPage';
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import TermsOfService from './pages/Legal/TermsOfService';
import ExplorePage from './pages/Explore/ExplorePage';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Specific routes FIRST */}
          <Route path="/home" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* Catch-all palette route LAST */}
          <Route path="/:hexCodes" element={<ColorGenerator />} />
          <Route path="/" element={<ColorGenerator />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;