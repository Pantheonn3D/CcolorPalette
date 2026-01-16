// src/pages/Sitemap.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Map, 
  Palette, 
  BookOpen, 
  Wrench, 
  Grid3X3,
  FileText,
  ChevronRight
} from 'lucide-react';
import { SiteHeader, SiteFooter } from '../components/SEOLayout';
import './Sitemap.css';

const SITEMAP_SECTIONS = [
  {
    title: 'Main Pages',
    icon: Palette,
    links: [
      { href: '/', label: 'Color Palette Generator', description: 'Generate beautiful color palettes instantly' },
      { href: '/home', label: 'Home', description: 'Learn about CColorPalette features' },
      { href: '/explore', label: 'Explore Palettes', description: 'Browse 500+ curated color palettes' },
    ]
  },
  {
    title: 'Tools',
    icon: Wrench,
    links: [
      { href: '/tools/color-converter', label: 'Color Converter', description: 'Convert between HEX, RGB, HSL, OKLCH, CMYK' },
      { href: '/tools/contrast-checker', label: 'Contrast Checker', description: 'Test WCAG color accessibility compliance' },
    ]
  },
  {
    title: 'Guides',
    icon: BookOpen,
    links: [
      { href: '/guides/color-theory', label: 'Color Theory Guide', description: 'Learn color harmonies and the color wheel' },
      { href: '/guides/accessibility-wcag', label: 'Accessibility Guide', description: 'WCAG contrast and color blindness' },
      { href: '/guides/tailwind-css-colors', label: 'Tailwind CSS Colors', description: 'Custom colors in Tailwind v3 and v4' },
      { href: '/guides/brand-color-palette', label: 'Brand Color Guide', description: 'Create effective brand color systems' },
      { href: '/guides/color-psychology', label: 'Color Psychology', description: 'How colors affect emotions and behavior' },
      { href: '/guides/web-design-colors', label: 'Web Design Colors', description: 'UI color systems and best practices' },
    ]
  },
  {
    title: 'Palettes by Color',
    icon: Grid3X3,
    links: [
      { href: '/palettes/color/red', label: 'Red Palettes', description: 'Bold, energetic color combinations' },
      { href: '/palettes/color/orange', label: 'Orange Palettes', description: 'Warm, creative color combinations' },
      { href: '/palettes/color/yellow', label: 'Yellow Palettes', description: 'Bright, optimistic color combinations' },
      { href: '/palettes/color/green', label: 'Green Palettes', description: 'Natural, calming color combinations' },
      { href: '/palettes/color/blue', label: 'Blue Palettes', description: 'Professional, trustworthy color combinations' },
      { href: '/palettes/color/purple', label: 'Purple Palettes', description: 'Creative, luxurious color combinations' },
      { href: '/palettes/color/pink', label: 'Pink Palettes', description: 'Playful, romantic color combinations' },
    ]
  },
  {
    title: 'Palettes by Mood',
    icon: Grid3X3,
    links: [
      { href: '/palettes/mood/vibrant', label: 'Vibrant Palettes', description: 'Bold, saturated colors' },
      { href: '/palettes/mood/pastel', label: 'Pastel Palettes', description: 'Soft, gentle colors' },
      { href: '/palettes/mood/muted', label: 'Muted Palettes', description: 'Desaturated, sophisticated colors' },
      { href: '/palettes/mood/dark', label: 'Dark Mode Palettes', description: 'Deep, rich colors for dark UIs' },
      { href: '/palettes/mood/warm', label: 'Warm Palettes', description: 'Reds, oranges, and yellows' },
      { href: '/palettes/mood/cool', label: 'Cool Palettes', description: 'Blues, greens, and purples' },
      { href: '/palettes/mood/earthy', label: 'Earthy Palettes', description: 'Natural, organic tones' },
      { href: '/palettes/mood/elegant', label: 'Elegant Palettes', description: 'Sophisticated, refined colors' },
    ]
  },
  {
    title: 'Palettes by Industry',
    icon: Grid3X3,
    links: [
      { href: '/palettes/industry/technology', label: 'Technology', description: 'Colors for tech and SaaS' },
      { href: '/palettes/industry/healthcare', label: 'Healthcare', description: 'Colors for medical and wellness' },
      { href: '/palettes/industry/finance', label: 'Finance', description: 'Colors for banking and fintech' },
      { href: '/palettes/industry/food', label: 'Food & Restaurant', description: 'Appetizing color schemes' },
      { href: '/palettes/industry/fashion', label: 'Fashion & Beauty', description: 'Stylish, trendy colors' },
      { href: '/palettes/industry/education', label: 'Education', description: 'Engaging learning colors' },
      { href: '/palettes/industry/realestate', label: 'Real Estate', description: 'Professional property colors' },
      { href: '/palettes/industry/entertainment', label: 'Entertainment', description: 'Bold, exciting colors' },
    ]
  },
  {
    title: 'Resources',
    icon: FileText,
    links: [
      { href: '/glossary', label: 'Color Glossary', description: 'Color terminology definitions' },
      { href: '/privacy', label: 'Privacy Policy', description: 'How we handle your data' },
      { href: '/terms', label: 'Terms of Service', description: 'Usage terms and conditions' },
    ]
  },
];

function Sitemap() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Sitemap",
    "description": "Complete sitemap of CColorPalette - color palette generator, tools, guides, and resources.",
    "url": "https://ccolorpalette.com/sitemap"
  };

  return (
    <div className="sitemap-page">
      <Helmet>
        <title>Sitemap | CColorPalette</title>
        <meta 
          name="description" 
          content="Complete sitemap of CColorPalette. Browse all pages including the color palette generator, tools, guides, and palette collections." 
        />
        <link rel="canonical" href="https://ccolorpalette.com/sitemap" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <SiteHeader />

      <main className="sitemap-main">
        <div className="sitemap-container">
          <header className="sitemap-header">
            <div className="sitemap-icon">
              <Map size={32} />
            </div>
            <h1>Sitemap</h1>
            <p>All pages and resources on CColorPalette</p>
          </header>

          <div className="sitemap-grid">
            {SITEMAP_SECTIONS.map((section) => (
              <section key={section.title} className="sitemap-section">
                <div className="sitemap-section-header">
                  <section.icon size={20} />
                  <h2>{section.title}</h2>
                </div>
                <ul className="sitemap-links">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link to={link.href} className="sitemap-link">
                        <div className="sitemap-link-content">
                          <span className="sitemap-link-label">{link.label}</span>
                          <span className="sitemap-link-desc">{link.description}</span>
                        </div>
                        <ChevronRight size={16} className="sitemap-link-arrow" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default Sitemap;