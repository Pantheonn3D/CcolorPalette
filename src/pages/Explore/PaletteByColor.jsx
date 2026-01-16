// src/pages/Explore/PaletteByColor.jsx - NEW FILE
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Palette, 
  ArrowRight, 
  Grid3X3,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { SiteHeader, SiteFooter, Breadcrumbs } from '../../components/SEOLayout';
import GENERATED_PALETTES from '../../data/generated-palettes.json';
import './PaletteByColor.css';

const COLOR_FAMILIES = {
  red: {
    name: 'Red',
    hueRange: [345, 15], // wraps around
    hex: '#E63946',
    description: 'Red color palettes evoke passion, energy, and urgency. Red is one of the most powerful colors in design, commanding attention and creating strong emotional responses. Perfect for call-to-action buttons, sale promotions, and brands wanting to convey boldness.',
    psychology: 'Red increases heart rate and creates urgency. It\'s associated with love, danger, excitement, and appetite (hence its use in food branding).',
    useCases: ['E-commerce CTAs', 'Food & restaurant branding', 'Sports teams', 'Emergency services', 'Valentine\'s Day designs'],
    complementary: 'green',
    analogous: ['orange', 'pink'],
  },
  orange: {
    name: 'Orange',
    hueRange: [15, 45],
    hex: '#F4A261',
    description: 'Orange color palettes blend the energy of red with the cheerfulness of yellow. Orange is enthusiastic, creative, and inviting. It\'s excellent for brands wanting to appear friendly and accessible without the intensity of red.',
    psychology: 'Orange stimulates activity, appetite, and socialization. It conveys warmth, enthusiasm, and creativity.',
    useCases: ['Health & fitness', 'Food packaging', 'Creative agencies', 'Children\'s products', 'Autumn themes'],
    complementary: 'blue',
    analogous: ['red', 'yellow'],
  },
  yellow: {
    name: 'Yellow',
    hueRange: [45, 70],
    hex: '#E9C46A',
    description: 'Yellow color palettes radiate optimism, happiness, and clarity. As the brightest color in the visible spectrum, yellow naturally draws attention and creates feelings of warmth and cheerfulness.',
    psychology: 'Yellow stimulates mental activity and generates muscle energy. It\'s associated with happiness, hope, and caution.',
    useCases: ['Warning signs', 'Sunshine brands', 'Children\'s products', 'Taxi & transportation', 'Summer campaigns'],
    complementary: 'purple',
    analogous: ['orange', 'green'],
  },
  green: {
    name: 'Green',
    hueRange: [70, 170],
    hex: '#2A9D8F',
    description: 'Green color palettes represent nature, growth, and harmony. Green is the most restful color for the human eye, making it ideal for brands in health, wellness, finance, and environmental sectors.',
    psychology: 'Green symbolizes nature, health, and tranquility. It\'s associated with growth, safety, and prosperity.',
    useCases: ['Environmental brands', 'Health & wellness', 'Finance & money', 'Organic products', 'Tech startups'],
    complementary: 'red',
    analogous: ['yellow', 'blue'],
  },
  blue: {
    name: 'Blue',
    hueRange: [170, 260],
    hex: '#457B9D',
    description: 'Blue color palettes convey trust, professionalism, and calm. Blue is the most universally liked color and dominates corporate branding, especially in technology, finance, and healthcare.',
    psychology: 'Blue lowers heart rate and reduces appetite. It\'s associated with trust, loyalty, wisdom, and stability.',
    useCases: ['Corporate branding', 'Technology companies', 'Healthcare', 'Social media', 'Financial services'],
    complementary: 'orange',
    analogous: ['green', 'purple'],
  },
  purple: {
    name: 'Purple',
    hueRange: [260, 320],
    hex: '#7B2CBF',
    description: 'Purple color palettes blend the energy of red with the stability of blue. Purple represents creativity, luxury, and spirituality. It\'s often used by premium brands and creative industries.',
    psychology: 'Purple stimulates imagination and inspires high ideals. It\'s associated with royalty, luxury, wisdom, and creativity.',
    useCases: ['Luxury brands', 'Beauty products', 'Creative agencies', 'Spiritual businesses', 'Premium services'],
    complementary: 'yellow',
    analogous: ['blue', 'pink'],
  },
  pink: {
    name: 'Pink',
    hueRange: [320, 345],
    hex: '#E056A0',
    description: 'Pink color palettes range from soft and romantic to bold and energetic. Pink conveys femininity, playfulness, and tenderness, though hot pink can be as bold as any color.',
    psychology: 'Pink has a calming effect and represents nurturing, romance, and compassion. Hot pink conveys energy and youthfulness.',
    useCases: ['Beauty & cosmetics', 'Fashion', 'Wedding planning', 'Children\'s products', 'Breast cancer awareness'],
    complementary: 'green',
    analogous: ['red', 'purple'],
  },
};

// Helper function to check if hue is in range (handles wrap-around)
const isHueInRange = (hue, range) => {
  if (range[0] > range[1]) {
    // Wraps around (e.g., red: 345-15)
    return hue >= range[0] || hue <= range[1];
  }
  return hue >= range[0] && hue <= range[1];
};

// Convert hex to HSL hue
const hexToHue = (hex) => {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  
  if (max !== min) {
    const d = max - min;
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: break;
    }
    h *= 360;
  }
  
  return h;
};

function PaletteByColor() {
  const { colorFamily } = useParams();
  const colorData = COLOR_FAMILIES[colorFamily?.toLowerCase()];

  const matchingPalettes = useMemo(() => {
    if (!colorData) return [];
    
    return GENERATED_PALETTES.filter(paletteString => {
      const colors = paletteString.split('-');
      return colors.some(hex => {
        const hue = hexToHue(hex);
        return isHueInRange(hue, colorData.hueRange);
      });
    }).slice(0, 100); // Limit for performance
  }, [colorData]);

  if (!colorData) {
    return (
      <div className="palette-by-color-page">
        <SiteHeader />
        <main className="not-found-content">
          <h1>Color Family Not Found</h1>
          <p>Try one of these:</p>
          <div className="color-family-links">
            {Object.keys(COLOR_FAMILIES).map(family => (
              <Link key={family} to={`/palettes/color/${family}`}>
                {COLOR_FAMILIES[family].name}
              </Link>
            ))}
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${colorData.name} Color Palettes`,
    "description": colorData.description,
    "url": `https://ccolorpalette.com/palettes/color/${colorFamily}`,
    "numberOfItems": matchingPalettes.length,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": matchingPalettes.length,
      "itemListElement": matchingPalettes.slice(0, 10).map((palette, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://ccolorpalette.com/${palette}`
      }))
    }
  };

  const breadcrumbs = [
    { label: 'Home', href: '/home' },
    { label: 'Explore', href: '/explore' },
    { label: `${colorData.name} Palettes` }
  ];

  return (
    <div className="palette-by-color-page">
    <Helmet>
    <title>{`${colorData.name} Color Palettes - ${matchingPalettes.length}+ ${colorData.name} Color Schemes | CColorPalette`}</title>
    <meta 
        name="description" 
        content={`Browse ${matchingPalettes.length}+ ${colorData.name.toLowerCase()} color palettes. ${colorData.description.slice(0, 120)}...`} 
    />
        <meta 
          name="keywords" 
          content={`${colorData.name.toLowerCase()} color palette, ${colorData.name.toLowerCase()} color scheme, ${colorData.name.toLowerCase()} colors, ${colorData.name.toLowerCase()} hex codes, ${colorData.name.toLowerCase()} color combinations`} 
        />
        <link rel="canonical" href={`https://ccolorpalette.com/palettes/color/${colorFamily}`} />
        
        <meta property="og:title" content={`${colorData.name} Color Palettes | CColorPalette`} />
        <meta property="og:description" content={colorData.description} />
        <meta property="og:url" content={`https://ccolorpalette.com/palettes/color/${colorFamily}`} />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <SiteHeader />

      <main className="color-page-main">
        {/* Breadcrumbs */}
        <div className="color-page-breadcrumbs">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Hero */}
        <header className="color-page-hero" style={{ '--accent-color': colorData.hex }}>
          <div className="color-swatch-large" style={{ backgroundColor: colorData.hex }} />
          <div className="hero-content">
            <span className="hero-badge">
              <Palette size={14} />
              {matchingPalettes.length}+ Palettes
            </span>
            <h1>{colorData.name} Color Palettes</h1>
            <p>{colorData.description}</p>
          </div>
        </header>

        {/* Content Grid */}
        <div className="color-page-content">
          {/* Sidebar */}
          <aside className="color-page-sidebar">
            {/* Psychology */}
            <div className="sidebar-section">
              <h3>Color Psychology</h3>
              <p>{colorData.psychology}</p>
              <Link to="/guides/color-psychology" className="sidebar-link">
                Learn more about color psychology <ChevronRight size={14} />
              </Link>
            </div>

            {/* Use Cases */}
            <div className="sidebar-section">
              <h3>Best Used For</h3>
              <ul className="use-cases-list">
                {colorData.useCases.map((useCase, i) => (
                  <li key={i}>{useCase}</li>
                ))}
              </ul>
            </div>

            {/* Related Colors */}
            <div className="sidebar-section">
              <h3>Color Relationships</h3>
              <div className="related-colors">
                <div className="related-color-item">
                  <span className="related-label">Complementary:</span>
                  <Link to={`/palettes/color/${colorData.complementary}`}>
                    {COLOR_FAMILIES[colorData.complementary]?.name}
                  </Link>
                </div>
                <div className="related-color-item">
                  <span className="related-label">Analogous:</span>
                  {colorData.analogous.map((c, i) => (
                    <React.Fragment key={c}>
                      <Link to={`/palettes/color/${c}`}>
                        {COLOR_FAMILIES[c]?.name}
                      </Link>
                      {i < colorData.analogous.length - 1 && ', '}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <Link to="/guides/color-theory" className="sidebar-link">
                Learn about color harmonies <ChevronRight size={14} />
              </Link>
            </div>

            {/* Other Colors */}
            <div className="sidebar-section">
              <h3>Browse Other Colors</h3>
              <div className="other-colors-grid">
                {Object.keys(COLOR_FAMILIES).filter(f => f !== colorFamily).map(family => (
                  <Link 
                    key={family} 
                    to={`/palettes/color/${family}`}
                    className="other-color-link"
                    style={{ '--swatch-color': COLOR_FAMILIES[family].hex }}
                  >
                    <span className="mini-swatch" />
                    {COLOR_FAMILIES[family].name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Palette Grid */}
          <section className="palettes-section">
            <h2>{matchingPalettes.length} {colorData.name} Palettes</h2>
            <div className="palettes-grid">
              {matchingPalettes.map((paletteString) => {
                const colors = paletteString.split('-');
                return (
                  <Link
                    key={paletteString}
                    to={`/${paletteString}`}
                    className="palette-card"
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

            {matchingPalettes.length >= 100 && (
              <div className="load-more-hint">
                <p>Showing 100 palettes. <Link to="/explore">Browse all palettes</Link> or <Link to="/">generate your own</Link>.</p>
              </div>
            )}
          </section>
        </div>

        {/* SEO Content */}
        <section className="color-page-seo">
          <h2>About {colorData.name} Color Palettes</h2>
          <p>
            {colorData.name} is one of the most {colorFamily === 'blue' ? 'universally trusted' : 'emotionally impactful'} colors 
            in design. Our collection of {matchingPalettes.length}+ {colorData.name.toLowerCase()} color palettes 
            includes harmonious combinations suitable for {colorData.useCases.slice(0, 3).join(', ').toLowerCase()}, and more.
          </p>
          <p>
            Each palette is crafted using <Link to="/guides/color-theory">color theory principles</Link> to ensure 
            visual harmony. Want to customize these colors? Open any palette in our{' '}
            <Link to="/">color palette generator</Link> to adjust shades, check{' '}
            <Link to="/guides/accessibility-wcag">accessibility compliance</Link>, and export to CSS, Tailwind, or JSON.
          </p>
          
          <div className="seo-internal-links">
            <h3>Related Resources</h3>
            <ul>
              <li><Link to="/guides/color-theory">Complete Guide to Color Theory</Link></li>
              <li><Link to="/guides/color-psychology">{colorData.name} Color Psychology</Link></li>
              <li><Link to="/guides/brand-color-palette">Creating Brand Color Palettes</Link></li>
              <li><Link to="/tools/contrast-checker">Check Color Contrast</Link></li>
              <li><Link to="/glossary">Color Terminology Glossary</Link></li>
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default PaletteByColor;