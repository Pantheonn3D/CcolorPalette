// src/pages/Tools/ContrastCheckerPage.jsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Palette, 
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Contrast,
  Type,
  Heading
} from 'lucide-react';
import { 
  SEOArticleLayout, 
  PageHeader,
} from '../../components/SEOLayout';
import './ContrastCheckerPage.css';

// Contrast calculation utilities
const getLuminance = (hex) => {
  const rgb = hex.replace('#', '').match(/.{2}/g).map(x => {
    const c = parseInt(x, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
};

const getContrastRatio = (hex1, hex2) => {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

const getWCAGResults = (ratio) => ({
  normalAA: ratio >= 4.5,
  normalAAA: ratio >= 7,
  largeAA: ratio >= 3,
  largeAAA: ratio >= 4.5,
  uiAA: ratio >= 3,
});

function ContrastCheckerPage() {
  const [foreground, setForeground] = useState('#1D3557');
  const [background, setBackground] = useState('#F1FAEE');
  const [copiedRatio, setCopiedRatio] = useState(false);

  const isValidHex = (hex) => /^#[0-9A-Fa-f]{6}$/.test(hex);

  const handleColorChange = (value, setter) => {
    let cleaned = value.replace(/[^0-9A-Fa-f#]/g, '').toUpperCase();
    if (!cleaned.startsWith('#')) cleaned = '#' + cleaned;
    if (cleaned.length <= 7) setter(cleaned);
  };

  const contrastData = useMemo(() => {
    if (!isValidHex(foreground) || !isValidHex(background)) return null;
    
    const ratio = getContrastRatio(foreground, background);
    const results = getWCAGResults(ratio);
    
    return { ratio, results };
  }, [foreground, background]);

  const swapColors = () => {
    const temp = foreground;
    setForeground(background);
    setBackground(temp);
  };

  const copyRatio = async () => {
    if (!contrastData) return;
    try {
      await navigator.clipboard.writeText(`${contrastData.ratio.toFixed(2)}:1`);
      setCopiedRatio(true);
      setTimeout(() => setCopiedRatio(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const ResultIcon = ({ pass }) => (
    pass ? <CheckCircle size={18} className="result-pass" /> : <XCircle size={18} className="result-fail" />
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "WCAG Contrast Checker",
    "description": "Free WCAG 2.1 color contrast checker. Test foreground and background colors for accessibility compliance with AA and AAA standards.",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const breadcrumbs = [
    { label: 'Home', href: '/home' },
    { label: 'Tools', href: '/tools/contrast-checker' },
    { label: 'Contrast Checker' }
  ];

  const relatedLinks = [
    { href: '/', label: 'Palette Generator', icon: Palette },
    { href: '/tools/color-converter', label: 'Color Converter', icon: RefreshCw },
    { href: '/guides/accessibility-wcag', label: 'Accessibility Guide', icon: BookOpen },
    { href: '/glossary', label: 'Color Glossary', icon: BookOpen },
  ];

  return (
    <SEOArticleLayout
      title="WCAG Contrast Checker - Test Color Accessibility"
      description="Free WCAG 2.1 color contrast checker. Test text and background colors for AA and AAA accessibility compliance. Instant results for normal text, large text, and UI components."
      keywords="wcag contrast checker, color contrast ratio, accessibility checker, aa contrast, aaa contrast, color accessibility, wcag 2.1, contrast ratio calculator, ada color compliance"
      canonicalPath="/tools/contrast-checker"
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      relatedLinks={relatedLinks}
      lastModified="2025-01-15"
    >
      <PageHeader
        badge="Accessibility Tool"
        badgeIcon={Contrast}
        title="WCAG Contrast Checker"
        subtitle="Test color combinations for WCAG 2.1 accessibility compliance."
      />

      {/* Checker Tool */}
      <section className="checker-tool">
        <div className="checker-inputs">
          <div className="checker-input-group">
            <label>Foreground (Text)</label>
            <div className="checker-input-row">
              <input
                type="text"
                value={foreground}
                onChange={(e) => handleColorChange(e.target.value, setForeground)}
                className="checker-input"
                maxLength={7}
                spellCheck={false}
              />
              <input
                type="color"
                value={isValidHex(foreground) ? foreground : '#000000'}
                onChange={(e) => setForeground(e.target.value.toUpperCase())}
                className="checker-color-picker"
              />
            </div>
          </div>

          <button className="checker-swap" onClick={swapColors} title="Swap colors">
            <RefreshCw size={20} />
          </button>

          <div className="checker-input-group">
            <label>Background</label>
            <div className="checker-input-row">
              <input
                type="text"
                value={background}
                onChange={(e) => handleColorChange(e.target.value, setBackground)}
                className="checker-input"
                maxLength={7}
                spellCheck={false}
              />
              <input
                type="color"
                value={isValidHex(background) ? background : '#FFFFFF'}
                onChange={(e) => setBackground(e.target.value.toUpperCase())}
                className="checker-color-picker"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div 
          className="checker-preview"
          style={{ 
            backgroundColor: isValidHex(background) ? background : '#FFFFFF',
            color: isValidHex(foreground) ? foreground : '#000000'
          }}
        >
          <span className="preview-large">Large Text (18pt+)</span>
          <span className="preview-normal">Normal text appears like this. Regular body copy at 16px or smaller.</span>
          <div className="preview-ui">
            <button style={{ borderColor: isValidHex(foreground) ? foreground : '#000000' }}>
              UI Component
            </button>
          </div>
        </div>

        {/* Results */}
        {contrastData && (
          <div className="checker-results">
            <div className="ratio-display">
              <span className="ratio-label">Contrast Ratio</span>
              <div className="ratio-value-row">
                <span className="ratio-value">{contrastData.ratio.toFixed(2)}:1</span>
                <button 
                  className={`ratio-copy ${copiedRatio ? 'copied' : ''}`}
                  onClick={copyRatio}
                >
                  {copiedRatio ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <span className="ratio-grade">
                {contrastData.ratio >= 7 ? 'Excellent' : 
                 contrastData.ratio >= 4.5 ? 'Good' : 
                 contrastData.ratio >= 3 ? 'Fair' : 'Poor'}
              </span>
            </div>

            <div className="wcag-results">
              <div className="wcag-section">
                <h3>
                  <Type size={16} />
                  Normal Text (under 18pt)
                </h3>
                <div className="wcag-row">
                  <span>WCAG AA (4.5:1)</span>
                  <ResultIcon pass={contrastData.results.normalAA} />
                </div>
                <div className="wcag-row">
                  <span>WCAG AAA (7:1)</span>
                  <ResultIcon pass={contrastData.results.normalAAA} />
                </div>
              </div>

              <div className="wcag-section">
                <h3>
                  <Heading size={16} />
                  Large Text (18pt+ or 14pt bold)
                </h3>
                <div className="wcag-row">
                  <span>WCAG AA (3:1)</span>
                  <ResultIcon pass={contrastData.results.largeAA} />
                </div>
                <div className="wcag-row">
                  <span>WCAG AAA (4.5:1)</span>
                  <ResultIcon pass={contrastData.results.largeAAA} />
                </div>
              </div>

              <div className="wcag-section">
                <h3>
                  <Contrast size={16} />
                  UI Components & Graphics
                </h3>
                <div className="wcag-row">
                  <span>WCAG AA (3:1)</span>
                  <ResultIcon pass={contrastData.results.uiAA} />
                </div>
              </div>
            </div>
          </div>
        )}

        {(!isValidHex(foreground) || !isValidHex(background)) && (
          <div className="checker-error">
            <AlertTriangle size={18} />
            <span>Enter valid 6-digit HEX colors (e.g., #3B82F6)</span>
          </div>
        )}
      </section>

      {/* Info Section */}
      <section className="article-section">
        <h2>Understanding WCAG Contrast Requirements</h2>
        
        <h3>What is WCAG?</h3>
        <p>
          The Web Content Accessibility Guidelines (WCAG) are international standards 
          for making web content accessible to people with disabilities. Contrast 
          requirements ensure text is readable for users with low vision or color 
          deficiencies.
        </p>

        <h3>AA vs AAA Compliance</h3>
        <p>
          <strong>Level AA</strong> is the minimum standard most websites should meet. 
          It requires 4.5:1 contrast for normal text and 3:1 for large text.
        </p>
        <p>
          <strong>Level AAA</strong> is enhanced accessibility. It requires 7:1 for 
          normal text and 4.5:1 for large text. Recommended for government, healthcare, 
          and high-accessibility contexts.
        </p>

        <h3>What Counts as Large Text?</h3>
        <ul>
          <li>18 point (24px) or larger regular weight text</li>
          <li>14 point (18.5px) or larger bold text</li>
        </ul>

        <h3>UI Components</h3>
        <p>
          Interactive elements like buttons, form inputs, and focus indicators require 
          at least 3:1 contrast against adjacent colors to be distinguishable.
        </p>
      </section>

      <section className="article-section">
        <h2>Tips for Better Contrast</h2>
        <ul>
          <li>Avoid light gray text on white backgrounds (a common mistake)</li>
          <li>Test your colors with color blindness simulation</li>
          <li>Consider hover, focus, and disabled states too</li>
          <li>Use our <Link to="/">palette generator</Link> with built-in accessibility checking</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="article-cta">
        <h2>Create Accessible Color Palettes</h2>
        <p>
          Generate harmonious colors with built-in WCAG contrast checking.
        </p>
        <Link to="/" className="article-cta-btn">
          <Palette size={20} />
          Open Palette Generator
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Related */}
      <section className="article-related">
        <h2>Related Resources</h2>
        <div className="related-articles-grid">
          <Link to="/guides/accessibility-wcag" className="related-article-card">
            <h3>Accessibility Guide</h3>
            <p>Complete guide to WCAG color requirements.</p>
          </Link>
          <Link to="/tools/color-converter" className="related-article-card">
            <h3>Color Converter</h3>
            <p>Convert between HEX, RGB, HSL formats.</p>
          </Link>
          <Link to="/glossary" className="related-article-card">
            <h3>Color Glossary</h3>
            <p>Accessibility terminology explained.</p>
          </Link>
        </div>
      </section>
    </SEOArticleLayout>
  );
}

export default ContrastCheckerPage;