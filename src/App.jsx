import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your pages
import ColorGenerator from './colorGenerator/ColorGenerator'; 
import LandingPage from './pages/LandingPage/LandingPage';

import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
    <Router>
      <Routes>
        {/* URL: /home -> Shows Landing Page */}
        <Route path="/home" element={<LandingPage />} />

        {/* URL: / -> Shows Generator */}
        <Route path="/" element={<ColorGenerator />} />

        {/* URL: /1A2B3C-FFFFFF -> Shows Generator with colors */}
        <Route path="/:hexCodes" element={<ColorGenerator />} />
      </Routes>
    </Router>        
    </HelmetProvider>
  );
}

export default App;