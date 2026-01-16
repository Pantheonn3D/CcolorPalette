// src/pages/Tools/ColorConverterPage.jsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Palette, 
  Copy,
  Check,
  ArrowRight,
  ArrowLeftRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  SEOArticleLayout, 
  PageHeader,
} from '../../components/SEOLayout';
import { hexToHsl, hslToHex, hexToOklch } from '../../utils/colorUtils';
import './ColorConverterPage.css';

// Color conversion utilities
const hexToRgb = (hex) => {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};

const rgbToHex = (r, g, b) => {
  const toHex = (c) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToRgb = (h, s, l) => {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};

const rgbToCmyk = (r, g, b) => {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rr - k) / (1 - k)) * 100),
    m: Math.round(((1 - gg - k) / (1 - k)) * 100),
    y: Math.round(((1 - bb - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
};

const COLOR_FORMATS = [
  { id: 'hex', label: 'HEX', placeholder: '#3B82F6' },
  { id: 'rgb', label: 'RGB', placeholder: 'rgb(59, 130, 246)' },
  { id: 'hsl', label: 'HSL', placeholder: 'hsl(217, 91%, 60%)' },
  { id: 'oklch', label: 'OKLCH', placeholder: 'oklch(62% 0.19 255)' },
  { id: 'cmyk', label: 'CMYK', placeholder: 'cmyk(76%, 47%, 0%, 4%)' },
];

function ColorConverterPage() {
  const [inputColor, setInputColor] = useState('#3B82F6');
  const [copiedFormat, setCopiedFormat] = useState(null);

  // Parse the input and determine format
  const parseColor = (input) => {
    const trimmed = input.trim();
    
    // HEX
    if (/^#?[0-9A-Fa-f]{6}$/.test(trimmed)) {
      const hex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
      return { format: 'hex', hex: hex.toUpperCase() };
    }
    if (/^#?[0-9A-Fa-f]{3}$/.test(trimmed)) {
      const short = trimmed.replace('#', '');
      const hex = `#${short[0]}${short[0]}${short[1]}${short[1]}${short[2]}${short[2]}`.toUpperCase();
      return { format: 'hex', hex };
    }
    
    // RGB
    const rgbMatch = trimmed.match(/rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i);
    if (rgbMatch) {
      const hex = rgbToHex(parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]));
      return { format: 'rgb', hex };
    }
    
    // HSL
    const hslMatch = trimmed.match(/hsl\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?\s*\)/i);
    if (hslMatch) {
      const rgb = hslToRgb(parseInt(hslMatch[1]), parseInt(hslMatch[2]), parseInt(hslMatch[3]));
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      return { format: 'hsl', hex };
    }
    
    return null;
  };

  // Get all color values from hex
  const colorValues = useMemo(() => {
    const parsed = parseColor(inputColor);
    if (!parsed) return null;
    
    const hex = parsed.hex;
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const oklch = hexToOklch(hex);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    
    return {
      hex,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      oklch: `oklch(${(oklch.L * 100).toFixed(1)}% ${oklch.C.toFixed(3)} ${Math.round(oklch.h)})`,
      cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
      rawRgb: rgb,
      rawHsl: hsl,
      rawOklch: oklch,
      rawCmyk: cmyk,
    };
  }, [inputColor]);

  const copyValue = async (format, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Color Converter Tool",
    "description": "Free online color converter. Convert between HEX, RGB, HSL, OKLCH, and CMYK color formats instantly.",
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
    { label: 'Tools', href: '/tools/color-converter' },
    { label: 'Color Converter' }
  ];

  const relatedLinks = [
    { href: '/', label: 'Palette Generator', icon: Palette },
    { href: '/tools/contrast-checker', label: 'Contrast Checker', icon: ArrowLeftRight },
    { href: '/guides/color-theory', label: 'Color Theory', icon: BookOpen },
    { href: '/glossary', label: 'Color Glossary', icon: BookOpen },
  ];

  return (
    <SEOArticleLayout
      title="Color Converter - HEX, RGB, HSL, OKLCH, CMYK"
      description="Free online color converter tool. Instantly convert colors between HEX, RGB, HSL, OKLCH, and CMYK formats. Copy any format with one click."
      keywords="color converter, hex to rgb, rgb to hex, hsl converter, oklch converter, cmyk converter, color format converter, hex rgb hsl, color code converter"
      canonicalPath="/tools/color-converter"
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      relatedLinks={relatedLinks}
      lastModified="2025-01-15"
    >
      <PageHeader
        badge="Free Tool"
        badgeIcon={ArrowLeftRight}
        title="Color Converter"
        subtitle="Convert colors between HEX, RGB, HSL, OKLCH, and CMYK formats instantly."
      />

      {/* Converter Tool */}
      <section className="converter-tool">
        <div className="converter-input-section">
          <label className="converter-label">Enter a color in any format</label>
          <div className="converter-input-wrapper">
            <input
              type="text"
              value={inputColor}
              onChange={(e) => setInputColor(e.target.value)}
              placeholder="#3B82F6 or rgb(59, 130, 246) or hsl(217, 91%, 60%)"
              className="converter-input"
              spellCheck={false}
            />
            {colorValues && (
              <div 
                className="converter-preview"
                style={{ backgroundColor: colorValues.hex }}
              />
            )}
          </div>
          {!colorValues && inputColor.length > 2 && (
            <p className="converter-error">
              <Info size={14} />
              Could not parse color. Try HEX (#3B82F6), RGB, or HSL format.
            </p>
          )}
        </div>

        {colorValues && (
          <div className="converter-results">
            <div className="converter-color-display">
              <div 
                className="color-swatch-large"
                style={{ backgroundColor: colorValues.hex }}
              />
              <div className="color-info">
                <span className="color-hex-display">{colorValues.hex}</span>
                <span className="color-name">
                  {colorValues.rawHsl.l > 50 ? 'Light' : 'Dark'} 
                  {colorValues.rawHsl.s < 20 ? ' Gray' : ''}
                </span>
              </div>
            </div>

            <div className="converter-formats">
              {COLOR_FORMATS.map((format) => (
                <div key={format.id} className="format-row">
                  <span className="format-label">{format.label}</span>
                  <code className="format-value">{colorValues[format.id]}</code>
                  <button
                    className={`format-copy ${copiedFormat === format.id ? 'copied' : ''}`}
                    onClick={() => copyValue(format.id, colorValues[format.id])}
                  >
                    {copiedFormat === format.id ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              ))}
            </div>

            {/* Raw Values */}
            <div className="converter-raw-values">
              <h3>Component Values</h3>
              <div className="raw-values-grid">
                <div className="raw-value-group">
                  <span className="raw-label">RGB</span>
                  <div className="raw-values">
                    <span>R: {colorValues.rawRgb.r}</span>
                    <span>G: {colorValues.rawRgb.g}</span>
                    <span>B: {colorValues.rawRgb.b}</span>
                  </div>
                </div>
                <div className="raw-value-group">
                  <span className="raw-label">HSL</span>
                  <div className="raw-values">
                    <span>H: {colorValues.rawHsl.h}</span>
                    <span>S: {colorValues.rawHsl.s}%</span>
                    <span>L: {colorValues.rawHsl.l}%</span>
                  </div>
                </div>
                <div className="raw-value-group">
                  <span className="raw-label">CMYK</span>
                  <div className="raw-values">
                    <span>C: {colorValues.rawCmyk.c}%</span>
                    <span>M: {colorValues.rawCmyk.m}%</span>
                    <span>Y: {colorValues.rawCmyk.y}%</span>
                    <span>K: {colorValues.rawCmyk.k}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Info Section */}
      <section className="article-section">
        <h2>About Color Formats</h2>
        
        <h3>HEX (Hexadecimal)</h3>
        <p>
          The most common web color format. Uses six hexadecimal digits to represent 
          red, green, and blue values (00-FF each). Example: #3B82F6 represents 
          R:59, G:130, B:246.
        </p>

        <h3>RGB (Red, Green, Blue)</h3>
        <p>
          Additive color model used in digital displays. Each channel ranges from 0-255. 
          Used in CSS as <code>rgb(59, 130, 246)</code>.
        </p>

        <h3>HSL (Hue, Saturation, Lightness)</h3>
        <p>
          More intuitive for humans. Hue is the color (0-360 degrees), saturation is 
          intensity (0-100%), and lightness is brightness (0-100%). Great for creating 
          color variations.
        </p>

        <h3>OKLCH (Lightness, Chroma, Hue)</h3>
        <p>
          A perceptually uniform color space. Colors with the same lightness value 
          actually appear equally bright to human vision. Modern CSS supports OKLCH 
          natively. Our <Link to="/">palette generator</Link> uses OKLCH internally.
        </p>

        <h3>CMYK (Cyan, Magenta, Yellow, Key/Black)</h3>
        <p>
          Subtractive color model used in print. Important for designers preparing 
          work for physical printing. Note: screen representation is approximate.
        </p>
      </section>

      {/* CTA */}
      <section className="article-cta">
        <h2>Generate Color Palettes</h2>
        <p>
          Create harmonious color combinations with our free palette generator.
        </p>
        <Link to="/" className="article-cta-btn">
          <Palette size={20} />
          Open Palette Generator
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Related Articles */}
      <section className="article-related">
        <h2>Related Resources</h2>
        <div className="related-articles-grid">
          <Link to="/tools/contrast-checker" className="related-article-card">
            <h3>Contrast Checker</h3>
            <p>Check WCAG contrast ratios between colors.</p>
          </Link>
          <Link to="/guides/color-theory" className="related-article-card">
            <h3>Color Theory</h3>
            <p>Learn about color relationships and harmony.</p>
          </Link>
          <Link to="/glossary" className="related-article-card">
            <h3>Color Glossary</h3>
            <p>Definitions of color terminology.</p>
          </Link>
        </div>
      </section>
    </SEOArticleLayout>
  );
}

export default ColorConverterPage;