// src/pages/Explore/PaletteByIndustry.jsx
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Palette, 
  ArrowRight, 
  Building,
  ChevronRight
} from 'lucide-react';
import { SiteHeader, SiteFooter, Breadcrumbs } from '../../components/SEOLayout';
import GENERATED_PALETTES from '../../data/generated-palettes.json';
import './PaletteByColor.css'; // Reuse the same styles

const INDUSTRY_DATA = {
  technology: {
    name: 'Technology',
    description: 'Professional and innovative color palettes for tech companies, SaaS products, and digital services. Blues dominate for trust, with accent colors for energy and modernity.',
    colors: ['Blue', 'Purple', 'Cyan', 'Black', 'White'],
    characteristics: 'Clean, professional, trustworthy with innovative accents',
    useCases: ['Software companies', 'Tech startups', 'SaaS products', 'IT services', 'Digital agencies'],
    hueRanges: [[180, 280]], // Blues and purples
    psychology: 'Blue conveys trust and reliability - essential for tech products handling user data. Purple adds innovation and creativity.',
  },
  healthcare: {
    name: 'Healthcare',
    description: 'Calming, clean color palettes for medical practices, health apps, and wellness brands. Focuses on trust, cleanliness, and calm.',
    colors: ['Blue', 'Green', 'White', 'Light Gray'],
    characteristics: 'Clean, calming, trustworthy, professional',
    useCases: ['Hospitals', 'Medical practices', 'Health apps', 'Pharmaceutical', 'Mental health'],
    hueRanges: [[170, 220], [80, 150]], // Blues and greens
    psychology: 'Blue builds trust while green represents health and growth. White conveys cleanliness and sterility.',
  },
  finance: {
    name: 'Finance',
    description: 'Conservative and trustworthy color palettes for banks, fintech, and financial services. Stability and security are paramount.',
    colors: ['Navy Blue', 'Green', 'Gold', 'Gray'],
    characteristics: 'Conservative, stable, trustworthy, professional',
    useCases: ['Banks', 'Investment firms', 'Insurance', 'Fintech', 'Accounting'],
    hueRanges: [[200, 250], [80, 140]], // Navy blues and greens
    psychology: 'Deep blues convey stability and trust. Green represents money and growth. Gold suggests premium service.',
  },
  food: {
    name: 'Food & Restaurant',
    description: 'Appetizing, warm color palettes for restaurants, food brands, and culinary businesses. Designed to stimulate appetite and convey freshness.',
    colors: ['Red', 'Orange', 'Yellow', 'Green', 'Brown'],
    characteristics: 'Warm, appetizing, energetic, inviting',
    useCases: ['Restaurants', 'Food delivery', 'Grocery', 'Food packaging', 'Cafes'],
    hueRanges: [[0, 60], [80, 120]], // Reds, oranges, yellows, and greens
    psychology: 'Red and orange stimulate appetite. Yellow creates warmth. Green suggests freshness and organic quality.',
  },
  fashion: {
    name: 'Fashion & Beauty',
    description: 'Elegant and sophisticated color palettes for fashion brands, beauty products, and luxury retail. Style and aspiration are key.',
    colors: ['Black', 'White', 'Gold', 'Pink', 'Purple'],
    characteristics: 'Elegant, sophisticated, aspirational, trendy',
    useCases: ['Fashion brands', 'Beauty products', 'Cosmetics', 'Jewelry', 'Luxury retail'],
    hueRanges: [[280, 360], [0, 30]], // Pinks, purples, and reds
    psychology: 'Black conveys sophistication and luxury. Pink represents femininity. Purple suggests creativity and royalty.',
  },
  education: {
    name: 'Education',
    description: 'Engaging yet professional color palettes for schools, e-learning platforms, and educational content. Balance between fun and credibility.',
    colors: ['Blue', 'Green', 'Orange', 'Yellow'],
    characteristics: 'Engaging, trustworthy, accessible, energetic',
    useCases: ['Schools', 'Universities', 'E-learning', 'EdTech', 'Training'],
    hueRanges: [[180, 250], [80, 140], [20, 50]], // Blues, greens, oranges
    psychology: 'Blue builds trust while warmer accents create engagement and energy. Green represents growth and learning.',
  },
  realestate: {
    name: 'Real Estate',
    description: 'Professional and trustworthy color palettes for real estate agencies, property platforms, and home services. Conveys stability and reliability.',
    colors: ['Blue', 'Green', 'Brown', 'Gold', 'Gray'],
    characteristics: 'Professional, trustworthy, stable, premium',
    useCases: ['Real estate agencies', 'Property platforms', 'Home services', 'Architecture', 'Interior design'],
    hueRanges: [[180, 230], [80, 130], [20, 45]], // Blues, greens, browns
    psychology: 'Blue conveys trust. Green represents growth and nature. Earth tones connect to home and stability.',
  },
  entertainment: {
    name: 'Entertainment',
    description: 'Bold and exciting color palettes for media, gaming, and entertainment brands. Energy and excitement are essential.',
    colors: ['Red', 'Purple', 'Black', 'Neon accents'],
    characteristics: 'Bold, exciting, energetic, immersive',
    useCases: ['Gaming', 'Media', 'Streaming', 'Events', 'Music'],
    hueRanges: [[0, 30], [260, 320]], // Reds and purples
    psychology: 'Bold colors create excitement and energy. Purple suggests creativity and imagination. Black adds drama.',
  },
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

// Check if hue is in any of the ranges
const isHueInRanges = (hue, ranges) => {
  return ranges.some(([min, max]) => hue >= min && hue <= max);
};

function PaletteByIndustry() {
  const { industry } = useParams();
  const industryData = INDUSTRY_DATA[industry?.toLowerCase()];

  const matchingPalettes = useMemo(() => {
    if (!industryData) return [];
    
    return GENERATED_PALETTES.filter(paletteString => {
      const colors = paletteString.split('-');
      const matchCount = colors.filter(hex => {
        const hue = hexToHue(hex);
        return isHueInRanges(hue, industryData.hueRanges);
      }).length;
      return matchCount >= Math.ceil(colors.length / 2);
    }).slice(0, 100);
  }, [industryData]);

  if (!industryData) {
    return (
      <div className="palette-by-color-page">
        <SiteHeader />
        <main className="not-found-content" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <h1>Industry Not Found</h1>
          <p>Try one of these industries:</p>
          <div className="other-colors-grid" style={{ justifyContent: 'center', marginTop: '24px' }}>
            {Object.keys(INDUSTRY_DATA).map(ind => (
              <Link 
                key={ind} 
                to={`/palettes/industry/${ind}`}
                className="other-color-link"
              >
                {INDUSTRY_DATA[ind].name}
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
    "name": `${industryData.name} Color Palettes`,
    "description": industryData.description,
    "url": `https://ccolorpalette.com/palettes/industry/${industry}`,
    "numberOfItems": matchingPalettes.length
  };

  const breadcrumbs = [
    { label: 'Home', href: '/home' },
    { label: 'Explore', href: '/explore' },
    { label: `${industryData.name} Palettes` }
  ];

  return (
    <div className="palette-by-color-page">
      <Helmet>
      <title>{`${industryData.name} Color Palettes - Best Colors for ${industryData.name} | CColorPalette`}</title>
        <meta 
          name="description" 
          content={`Browse ${matchingPalettes.length}+ color palettes for ${industryData.name.toLowerCase()}. ${industryData.description.slice(0, 100)}...`} 
        />
        <meta 
          name="keywords" 
          content={`${industryData.name.toLowerCase()} colors, ${industryData.name.toLowerCase()} color palette, ${industryData.name.toLowerCase()} branding colors, ${industryData.name.toLowerCase()} website colors`} 
        />
        <link rel="canonical" href={`https://ccolorpalette.com/palettes/industry/${industry}`} />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <SiteHeader />

      <main className="color-page-main">
        <div className="color-page-breadcrumbs">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Hero */}
        <header className="mood-page-hero">
          <span className="hero-badge">
            <Building size={14} />
            {matchingPalettes.length}+ Palettes
          </span>
          <h1>{industryData.name} Color Palettes</h1>
          <p>{industryData.description}</p>
        </header>

        <div className="mood-page-content">
          {/* Sidebar */}
          <aside className="mood-page-sidebar">
            <div className="sidebar-section">
              <h3>Common Colors</h3>
              <p>{industryData.colors.join(', ')}</p>
            </div>

            <div className="sidebar-section">
              <h3>Characteristics</h3>
              <p>{industryData.characteristics}</p>
            </div>

            <div className="sidebar-section">
              <h3>Best Used For</h3>
              <ul>
                {industryData.useCases.map((useCase, i) => (
                  <li key={i}>{useCase}</li>
                ))}
              </ul>
            </div>

            <div className="sidebar-section">
              <h3>Color Psychology</h3>
              <p>{industryData.psychology}</p>
              <Link to="/guides/color-psychology" className="sidebar-link">
                Learn more about color psychology <ChevronRight size={14} />
              </Link>
            </div>

            <div className="sidebar-section">
              <h3>Browse Other Industries</h3>
              <div className="other-moods-grid">
                {Object.keys(INDUSTRY_DATA).filter(i => i !== industry).map(ind => (
                  <Link key={ind} to={`/palettes/industry/${ind}`} className="other-mood-link">
                    {INDUSTRY_DATA[ind].name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Palette Grid */}
          <section className="palettes-section">
            <h2>{matchingPalettes.length} {industryData.name} Palettes</h2>
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
                <p>
                  Showing 100 palettes.{' '}
                  <Link to="/explore">Browse all palettes</Link> or{' '}
                  <Link to="/">generate custom palettes</Link>.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* SEO Content */}
        <section className="mood-page-seo">
          <h2>Color Palettes for {industryData.name}</h2>
          <p>
            Choosing the right colors for your {industryData.name.toLowerCase()} brand is crucial. 
            The colors you select communicate your values, build trust, and influence how customers 
            perceive your business.
          </p>
          <p>
            These palettes are curated using <Link to="/guides/color-psychology">color psychology principles</Link> specific 
            to the {industryData.name.toLowerCase()} industry. Customize any palette in our{' '}
            <Link to="/">color palette generator</Link> and check{' '}
            <Link to="/guides/accessibility-wcag">accessibility compliance</Link> before using.
          </p>
          
          <div className="seo-internal-links">
            <h3>Related Resources</h3>
            <ul>
              <li><Link to="/guides/brand-color-palette">Creating Brand Color Palettes</Link></li>
              <li><Link to="/guides/color-psychology">Color Psychology Guide</Link></li>
              <li><Link to="/guides/web-design-colors">Web Design Color Best Practices</Link></li>
              <li><Link to="/explore">Browse All Palettes</Link></li>
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default PaletteByIndustry;