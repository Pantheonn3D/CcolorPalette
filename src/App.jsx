import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import ColorGenerator from './colorGenerator/ColorGenerator';
import LandingPage from './pages/LandingPage/LandingPage';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/home" element={<LandingPage />} />
          <Route path="/" element={<ColorGenerator />} />
          <Route path="/:hexCodes" element={<ColorGenerator />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;