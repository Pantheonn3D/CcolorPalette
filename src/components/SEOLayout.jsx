// src/components/SEOLayout.jsx - NEW FILE
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ChevronRight, 
  Home,
  Palette,
  BookOpen,
  Wrench,
  Grid3X3 
} from 'lucide-react';
import logo from '../assets/Frame4ico.png';
import './SEOLayout.css';

// Breadcrumb component for better navigation and SEO
export function Breadcrumbs({ items }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href ? `https://ccolorpalette.com${item.href}` : undefined
    }))
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol className="breadcrumb-list">
          {items.map((item, index) => (
            <li key={index} className="breadcrumb-item">
              {index > 0 && <ChevronRight size={14} className="breadcrumb-separator" />}
              {item.href ? (
                <Link to={item.href} className="breadcrumb-link">
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

// Internal linking sidebar component
export function RelatedLinks({ links, title = "Related Resources" }) {
  return (
    <aside className="related-links-sidebar">
      <h3 className="related-links-title">{title}</h3>
      <nav className="related-links-nav">
        {links.map((link, index) => (
          <Link key={index} to={link.href} className="related-link-item">
            {link.icon && <link.icon size={16} />}
            <span>{link.label}</span>
            <ChevronRight size={14} className="related-link-arrow" />
          </Link>
        ))}
      </nav>
    </aside>
  );
}

// Standard internal links for all pages
export const STANDARD_INTERNAL_LINKS = {
  tools: [
    { href: '/', label: 'Color Palette Generator', icon: Palette },
    { href: '/tools/color-converter', label: 'Color Converter', icon: Wrench },
    { href: '/tools/contrast-checker', label: 'Contrast Checker', icon: Wrench },
  ],
  guides: [
    { href: '/guides/color-theory', label: 'Color Theory Guide', icon: BookOpen },
    { href: '/guides/accessibility-wcag', label: 'WCAG Accessibility Guide', icon: BookOpen },
    { href: '/guides/tailwind-css-colors', label: 'Tailwind CSS Colors', icon: BookOpen },
    { href: '/guides/brand-color-palette', label: 'Brand Color Guide', icon: BookOpen },
    { href: '/guides/color-psychology', label: 'Color Psychology', icon: BookOpen },
    { href: '/guides/web-design-colors', label: 'Web Design Colors', icon: BookOpen },
  ],
  explore: [
    { href: '/explore', label: 'Browse All Palettes', icon: Grid3X3 },
    { href: '/palettes/color/blue', label: 'Blue Palettes', icon: Palette },
    { href: '/palettes/color/green', label: 'Green Palettes', icon: Palette },
    { href: '/palettes/mood/vibrant', label: 'Vibrant Palettes', icon: Palette },
    { href: '/palettes/mood/pastel', label: 'Pastel Palettes', icon: Palette },
  ],
  resources: [
    { href: '/glossary', label: 'Color Glossary', icon: BookOpen },
    { href: '/sitemap', label: 'Sitemap', icon: Grid3X3 },
  ]
};

// Reusable page header
export function PageHeader({ 
  title, 
  subtitle, 
  badge,
  badgeIcon: BadgeIcon 
}) {
  return (
    <header className="seo-page-header">
      {badge && (
        <div className="seo-page-badge">
          {BadgeIcon && <BadgeIcon size={14} />}
          <span>{badge}</span>
        </div>
      )}
      <h1 className="seo-page-title">{title}</h1>
      {subtitle && <p className="seo-page-subtitle">{subtitle}</p>}
    </header>
  );
}

// Standard site header for article pages
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-container">
        <Link to="/home" className="site-logo">
          <img src={logo} alt="CColorPalette" className="site-logo-img" />
          <span className="site-logo-text">CColorPalette</span>
        </Link>
        
        <nav className="site-nav">
          <Link to="/" className="site-nav-link">Generator</Link>
          <Link to="/explore" className="site-nav-link">Explore</Link>
          <Link to="/guides/color-theory" className="site-nav-link">Guides</Link>
          <Link to="/glossary" className="site-nav-link">Glossary</Link>
        </nav>
        
        <Link to="/" className="site-cta">
          <Palette size={16} />
          <span>Open Generator</span>
        </Link>
      </div>
    </header>
  );
}

// Standard site footer with comprehensive internal linking
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-container">
        <div className="footer-main-grid">
          {/* Brand */}
          <div className="footer-brand-section">
            <Link to="/home" className="footer-logo">
              <img src={logo} alt="CColorPalette" />
              <span>CColorPalette</span>
            </Link>
            <p className="footer-tagline">
              Free color palette generator for designers, developers, and creative professionals.
              Create beautiful, accessible color schemes instantly.
            </p>
          </div>
          
          {/* Tools */}
          <div className="footer-links-section">
            <h4>Tools</h4>
            <Link to="/">Palette Generator</Link>
            <Link to="/tools/color-converter">Color Converter</Link>
            <Link to="/tools/contrast-checker">Contrast Checker</Link>
            <Link to="/explore">Explore Palettes</Link>
          </div>
          
          {/* Guides */}
          <div className="footer-links-section">
            <h4>Guides</h4>
            <Link to="/guides/color-theory">Color Theory</Link>
            <Link to="/guides/accessibility-wcag">WCAG Accessibility</Link>
            <Link to="/guides/tailwind-css-colors">Tailwind CSS Colors</Link>
            <Link to="/guides/brand-color-palette">Brand Colors</Link>
            <Link to="/guides/color-psychology">Color Psychology</Link>
            <Link to="/guides/web-design-colors">Web Design Colors</Link>
          </div>
          
          {/* Palettes by Color */}
          <div className="footer-links-section">
            <h4>Palettes by Color</h4>
            <Link to="/palettes/color/red">Red Palettes</Link>
            <Link to="/palettes/color/orange">Orange Palettes</Link>
            <Link to="/palettes/color/yellow">Yellow Palettes</Link>
            <Link to="/palettes/color/green">Green Palettes</Link>
            <Link to="/palettes/color/blue">Blue Palettes</Link>
            <Link to="/palettes/color/purple">Purple Palettes</Link>
          </div>
          
          {/* Palettes by Mood */}
          <div className="footer-links-section">
            <h4>Palettes by Mood</h4>
            <Link to="/palettes/mood/vibrant">Vibrant</Link>
            <Link to="/palettes/mood/pastel">Pastel</Link>
            <Link to="/palettes/mood/muted">Muted</Link>
            <Link to="/palettes/mood/dark">Dark Mode</Link>
            <Link to="/palettes/mood/warm">Warm</Link>
            <Link to="/palettes/mood/cool">Cool</Link>
          </div>
          
          {/* Resources */}
          <div className="footer-links-section">
            <h4>Resources</h4>
            <Link to="/glossary">Color Glossary</Link>
            <Link to="/sitemap">Sitemap</Link>
            <Link to="/home#faq">FAQ</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
        
        {/* External Authority Links */}
        <div className="footer-external-links">
          <span>Learn More:</span>
          <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer">
            W3C WCAG Guidelines
          </a>
          <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value" target="_blank" rel="noopener noreferrer">
            MDN CSS Colors
          </a>
          <a href="https://tailwindcss.com/docs/customizing-colors" target="_blank" rel="noopener noreferrer">
            Tailwind CSS Docs
          </a>
        </div>
        
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CColorPalette. Free color palette generator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// SEO wrapper for article/guide pages
export function SEOArticleLayout({ 
  children, 
  title,
  description,
  keywords,
  canonicalPath,
  structuredData,
  breadcrumbs,
  relatedLinks,
  lastModified
}) {
  const fullUrl = `https://ccolorpalette.com${canonicalPath}`;
  
  return (
    <div className="seo-article-page">
      <Helmet>
        <title>{title} | CColorPalette</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        <link rel="canonical" href={fullUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="CColorPalette" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        
        {/* Article metadata */}
        {lastModified && <meta property="article:modified_time" content={lastModified} />}
        
        {/* Structured Data */}
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
      </Helmet>
      
      <SiteHeader />
      
      <main className="seo-article-main">
        <div className="seo-article-container">
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
          
          <div className="seo-article-grid">
            <article className="seo-article-content">
              {children}
            </article>
            
            {relatedLinks && (
              <aside className="seo-article-sidebar">
                <RelatedLinks links={relatedLinks} />
                
                {/* Quick Actions Card */}
                <div className="sidebar-cta-card">
                  <h4>Try It Now</h4>
                  <p>Generate beautiful color palettes instantly with our free tool.</p>
                  <Link to="/" className="sidebar-cta-btn">
                    <Palette size={18} />
                    Open Generator
                  </Link>
                </div>
              </aside>
            )}
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}

export default SEOArticleLayout;