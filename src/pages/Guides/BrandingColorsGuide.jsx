// src/pages/Guides/BrandingColorsGuide.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Palette, 
  Target,
  Users,
  Building,
  ArrowRight,
  ExternalLink,
  Lightbulb,
  CheckCircle
} from 'lucide-react';
import { 
  SEOArticleLayout, 
  PageHeader,
} from '../../components/SEOLayout';

const BRAND_ARCHETYPES = [
  {
    archetype: 'The Innovator',
    industries: ['Technology', 'Startups', 'SaaS'],
    colors: ['Blue', 'Electric Blue', 'Cyan', 'White'],
    palette: '/2563EB-3B82F6-06B6D4-F8FAFC-0F172A',
    psychology: 'Trust, innovation, clarity, forward-thinking'
  },
  {
    archetype: 'The Nurturer',
    industries: ['Healthcare', 'Wellness', 'Childcare'],
    colors: ['Green', 'Soft Blue', 'Warm White'],
    palette: '/10B981-34D399-0EA5E9-F0FDF4-065F46',
    psychology: 'Care, growth, health, safety'
  },
  {
    archetype: 'The Luxury',
    industries: ['Fashion', 'Jewelry', 'Premium Services'],
    colors: ['Black', 'Gold', 'Deep Purple', 'Cream'],
    palette: '/0F0F0F-D4AF37-581C87-F5F5DC-1C1917',
    psychology: 'Exclusivity, elegance, sophistication, quality'
  },
  {
    archetype: 'The Energizer',
    industries: ['Sports', 'Fitness', 'Energy Drinks'],
    colors: ['Red', 'Orange', 'Yellow', 'Black'],
    palette: '/DC2626-EA580C-FBBF24-0F0F0F-FFFFFF',
    psychology: 'Energy, action, excitement, power'
  },
  {
    archetype: 'The Creative',
    industries: ['Design Agencies', 'Art', 'Entertainment'],
    colors: ['Purple', 'Pink', 'Vibrant accents'],
    palette: '/7C3AED-EC4899-F59E0B-0F172A-F8FAFC',
    psychology: 'Imagination, creativity, uniqueness, inspiration'
  },
  {
    archetype: 'The Natural',
    industries: ['Organic Food', 'Outdoor', 'Environmental'],
    colors: ['Forest Green', 'Earth Brown', 'Sky Blue'],
    palette: '/166534-A16207-0369A1-F5F5DC-1C1917',
    psychology: 'Nature, sustainability, authenticity, purity'
  }
];

const COLOR_ROLES = [
  {
    role: 'Primary Color',
    percentage: '60%',
    usage: 'Main brand color. Used for primary buttons, headers, logo, key visual elements.',
    tips: 'Should be distinctive and memorable. Test recognition at small sizes.'
  },
  {
    role: 'Secondary Color',
    percentage: '30%',
    usage: 'Supports primary. Used for backgrounds, secondary buttons, accents.',
    tips: 'Should complement primary without competing. Often a tint or contrasting hue.'
  },
  {
    role: 'Accent Color',
    percentage: '10%',
    usage: 'Highlights and calls-to-action. Used sparingly for emphasis.',
    tips: 'High contrast with both primary and secondary. Draws attention to key actions.'
  },
  {
    role: 'Neutral Colors',
    percentage: 'Variable',
    usage: 'Text, backgrounds, borders. The workhorses of your color system.',
    tips: 'Include light (backgrounds), medium (borders), and dark (text) options.'
  }
];

const INDUSTRY_COLORS = [
  { industry: 'Finance & Banking', colors: 'Blue, Green, Navy', reason: 'Trust, stability, growth' },
  { industry: 'Healthcare', colors: 'Blue, Green, White', reason: 'Cleanliness, trust, healing' },
  { industry: 'Food & Restaurant', colors: 'Red, Orange, Yellow', reason: 'Appetite, warmth, energy' },
  { industry: 'Technology', colors: 'Blue, Purple, Black', reason: 'Innovation, trust, sophistication' },
  { industry: 'Luxury & Fashion', colors: 'Black, Gold, Purple', reason: 'Elegance, exclusivity, quality' },
  { industry: 'Children & Education', colors: 'Primary colors, pastels', reason: 'Playfulness, creativity, joy' },
  { industry: 'Environmental', colors: 'Green, Brown, Blue', reason: 'Nature, sustainability, earth' },
  { industry: 'Beauty & Cosmetics', colors: 'Pink, Purple, Gold', reason: 'Femininity, luxury, glamour' },
];

function BrandingColorsGuide() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How to Create a Brand Color Palette",
    "description": "Complete guide to developing brand colors. Learn color psychology, industry standards, and how to create a memorable brand identity.",
    "author": {
      "@type": "Organization",
      "name": "CColorPalette"
    },
    "datePublished": "2024-01-01",
    "dateModified": "2025-01-15"
  };

  const breadcrumbs = [
    { label: 'Home', href: '/home' },
    { label: 'Guides', href: '/guides/color-theory' },
    { label: 'Brand Colors' }
  ];

  const relatedLinks = [
    { href: '/', label: 'Palette Generator', icon: Palette },
    { href: '/guides/color-psychology', label: 'Color Psychology', icon: BookOpen },
    { href: '/guides/color-theory', label: 'Color Theory', icon: BookOpen },
    { href: '/explore', label: 'Explore Palettes', icon: Palette },
  ];

  return (
    <SEOArticleLayout
      title="Brand Color Palette Guide - Create Memorable Brand Identity"
      description="Learn how to create effective brand color palettes. Covers color psychology, industry standards, the 60-30-10 rule, and step-by-step brand color selection process."
      keywords="brand colors, brand color palette, brand identity colors, company colors, logo colors, business color scheme, brand color psychology, corporate colors, brand guidelines colors"
      canonicalPath="/guides/brand-color-palette"
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      relatedLinks={relatedLinks}
      lastModified="2025-01-15"
    >
      <PageHeader
        badge="Brand Guide"
        badgeIcon={Target}
        title="Brand Color Palette: The Complete Guide"
        subtitle="Create a distinctive, memorable brand identity with strategically chosen colors."
      />

      {/* Table of Contents */}
      <nav className="article-toc">
        <h2>Table of Contents</h2>
        <ol>
          <li><a href="#why-brand-colors">Why Brand Colors Matter</a></li>
          <li><a href="#color-roles">The 60-30-10 Rule</a></li>
          <li><a href="#industry-standards">Industry Color Standards</a></li>
          <li><a href="#brand-archetypes">Brand Archetypes & Colors</a></li>
          <li><a href="#creation-process">Creating Your Brand Palette</a></li>
          <li><a href="#brand-guidelines">Brand Guidelines</a></li>
        </ol>
      </nav>

      {/* Why Brand Colors Matter */}
      <section id="why-brand-colors" className="article-section">
        <h2>Why Brand Colors Matter</h2>
        <p>
          Color increases brand recognition by up to <strong>80%</strong>. Think of Coca-Cola red, 
          Tiffany blue, or McDonald's yellow—these colors are instantly recognizable and evoke 
          specific emotions and associations.
        </p>
        <p>
          Your brand colors appear everywhere: logo, website, packaging, marketing materials, 
          social media, and physical spaces. Choosing the right colors is one of the most 
          important branding decisions you'll make.
        </p>
        
        <div className="article-callout">
          <Lightbulb size={20} />
          <div>
            <strong>Did you know?</strong> People make subconscious judgments about products 
            within 90 seconds, and up to 90% of that assessment is based on color alone.
          </div>
        </div>
      </section>

      {/* Color Roles */}
      <section id="color-roles" className="article-section">
        <h2>The 60-30-10 Rule</h2>
        <p>
          The 60-30-10 rule is a classic design principle for balanced color distribution. 
          It ensures visual hierarchy while maintaining brand consistency.
        </p>

        <div className="color-roles-grid">
          {COLOR_ROLES.map((role) => (
            <div key={role.role} className="role-card">
              <div className="role-header">
                <h3>{role.role}</h3>
                <span className="role-percentage">{role.percentage}</span>
              </div>
              <p><strong>Usage:</strong> {role.usage}</p>
              <p><strong>Tips:</strong> {role.tips}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Industry Standards */}
      <section id="industry-standards" className="article-section">
        <h2>Industry Color Standards</h2>
        <p>
          While standing out is important, certain colors are associated with specific industries 
          for good reasons. Understanding these conventions helps you make informed decisions about 
          whether to follow or deliberately break them.
        </p>

        <div className="industry-table">
          <table>
            <thead>
              <tr>
                <th>Industry</th>
                <th>Common Colors</th>
                <th>Psychology</th>
              </tr>
            </thead>
            <tbody>
              {INDUSTRY_COLORS.map((item) => (
                <tr key={item.industry}>
                  <td><strong>{item.industry}</strong></td>
                  <td>{item.colors}</td>
                  <td>{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p>
          Learn more about why these associations exist in our{' '}
          <Link to="/guides/color-psychology">color psychology guide</Link>.
        </p>
      </section>

      {/* Brand Archetypes */}
      <section id="brand-archetypes" className="article-section">
        <h2>Brand Archetypes & Color Palettes</h2>
        <p>
          Brand archetypes help define your brand's personality. Each archetype naturally 
          aligns with certain color families that reinforce the brand message.
        </p>

        <div className="archetypes-grid">
          {BRAND_ARCHETYPES.map((item) => (
            <div key={item.archetype} className="archetype-card">
              <h3>{item.archetype}</h3>
              <p className="archetype-industries">{item.industries.join(' • ')}</p>
              <p><strong>Colors:</strong> {item.colors.join(', ')}</p>
              <p><strong>Conveys:</strong> {item.psychology}</p>
              <Link to={item.palette} className="archetype-palette-link">
                View Example Palette <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Creation Process */}
      <section id="creation-process" className="article-section">
        <h2>Creating Your Brand Palette: Step by Step</h2>

        <div className="steps-list">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Define Your Brand Personality</h3>
              <p>
                List 3-5 adjectives that describe your brand. Are you bold or subtle? 
                Modern or traditional? Playful or serious? These traits guide color selection.
              </p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Research Your Competition</h3>
              <p>
                Analyze competitor colors. You may want to differentiate (if competitors 
                all use blue, consider a different approach) or align with industry expectations.
              </p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Understand Your Audience</h3>
              <p>
                Consider demographics, cultural context, and preferences. Colors have 
                different meanings across cultures and age groups.
              </p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Choose Your Primary Color</h3>
              <p>
                Select a color that embodies your brand's core personality. Test it at 
                various sizes and contexts. Use our <Link to="/">palette generator</Link> to explore options.
              </p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">5</div>
            <div className="step-content">
              <h3>Build Supporting Colors</h3>
              <p>
                Use <Link to="/guides/color-theory">color harmony principles</Link> to select 
                complementary, analogous, or triadic colors that work with your primary.
              </p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">6</div>
            <div className="step-content">
              <h3>Test Accessibility</h3>
              <p>
                Ensure your colors meet <Link to="/guides/accessibility-wcag">WCAG contrast requirements</Link>. 
                Test color blindness compatibility.
              </p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">7</div>
            <div className="step-content">
              <h3>Create Usage Guidelines</h3>
              <p>
                Document how, when, and where each color should be used. Include 
                color values in HEX, RGB, and CMYK for digital and print consistency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Guidelines */}
      <section id="brand-guidelines" className="article-section">
        <h2>Documenting Your Brand Colors</h2>
        <p>
          Your brand guidelines should include:
        </p>

        <ul className="checklist">
          <li><CheckCircle size={16} /> Primary, secondary, and accent color definitions</li>
          <li><CheckCircle size={16} /> Color values in HEX, RGB, CMYK, and Pantone</li>
          <li><CheckCircle size={16} /> Minimum contrast requirements</li>
          <li><CheckCircle size={16} /> Do's and don'ts with examples</li>
          <li><CheckCircle size={16} /> Acceptable color combinations</li>
          <li><CheckCircle size={16} /> Background color restrictions</li>
          <li><CheckCircle size={16} /> Print vs. digital specifications</li>
        </ul>

        <p>
          Export your palette from our <Link to="/">generator</Link> to get all color values 
          in multiple formats, ready for documentation.
        </p>
      </section>

      {/* CTA */}
      <section className="article-cta">
        <h2>Build Your Brand Palette</h2>
        <p>
          Use our free palette generator to explore colors and create your brand identity.
        </p>
        <Link to="/" className="article-cta-btn">
          <Palette size={20} />
          Start Creating
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Related Articles */}
      <section className="article-related">
        <h2>Continue Learning</h2>
        <div className="related-articles-grid">
          <Link to="/guides/color-psychology" className="related-article-card">
            <h3>Color Psychology</h3>
            <p>How colors influence perception and behavior.</p>
          </Link>
          <Link to="/guides/color-theory" className="related-article-card">
            <h3>Color Theory</h3>
            <p>Create harmonious color combinations.</p>
          </Link>
          <Link to="/explore" className="related-article-card">
            <h3>Explore Palettes</h3>
            <p>Browse curated brand-ready palettes.</p>
          </Link>
        </div>
      </section>
    </SEOArticleLayout>
  );
}

export default BrandingColorsGuide;