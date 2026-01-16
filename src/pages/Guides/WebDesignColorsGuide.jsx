// src/pages/Guides/WebDesignColorsGuide.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Palette, 
  Monitor,
  Layout,
  ArrowRight,
  ExternalLink,
  Code,
  Layers,
  CheckCircle
} from 'lucide-react';
import { 
  SEOArticleLayout, 
  PageHeader,
} from '../../components/SEOLayout';

const UI_COLOR_SYSTEM = [
  {
    category: 'Primary Actions',
    colors: ['Primary button', 'Links', 'Active states'],
    guidance: 'Your main brand color. Should have strong contrast against backgrounds.',
    example: 'bg-primary, text-primary'
  },
  {
    category: 'Secondary Actions',
    colors: ['Secondary buttons', 'Less important CTAs'],
    guidance: 'Supports primary without competing. Often a tint or complementary color.',
    example: 'bg-secondary, border-secondary'
  },
  {
    category: 'Backgrounds',
    colors: ['Page background', 'Card backgrounds', 'Section backgrounds'],
    guidance: 'Multiple levels: default (white/dark), subtle (slightly tinted), muted (stronger tint).',
    example: 'bg-default, bg-subtle, bg-muted'
  },
  {
    category: 'Text Colors',
    colors: ['Headings', 'Body text', 'Muted text', 'Placeholder text'],
    guidance: '3-4 levels of text hierarchy. Ensure WCAG compliance for each.',
    example: 'text-primary, text-secondary, text-muted'
  },
  {
    category: 'Borders & Dividers',
    colors: ['Card borders', 'Input borders', 'Dividers'],
    guidance: 'Subtle but visible. Multiple levels for focus states.',
    example: 'border-default, border-strong, border-focus'
  },
  {
    category: 'Feedback Colors',
    colors: ['Success', 'Error', 'Warning', 'Info'],
    guidance: 'Semantic colors with consistent meaning. Include background and text variants.',
    example: 'bg-success, text-error, border-warning'
  }
];

const DARK_MODE_TIPS = [
  'Don\'t simply invert colors—dark mode needs its own considered palette',
  'Reduce saturation slightly for colors on dark backgrounds',
  'Use lighter text colors (but not pure white—try #E5E5E5)',
  'Backgrounds should be dark gray (#121212 to #1F1F1F), not pure black',
  'Maintain contrast ratios—they\'re even more important in dark mode',
  'Test elevation with subtle shadows or lighter background shades',
  'Consider using CSS custom properties for easy theme switching'
];

const COMMON_MISTAKES = [
  {
    mistake: 'Too many colors',
    solution: 'Stick to 3-5 main colors plus neutrals. More causes visual chaos.'
  },
  {
    mistake: 'Inconsistent usage',
    solution: 'Create a color system with defined roles. Document everything.'
  },
  {
    mistake: 'Ignoring accessibility',
    solution: 'Test all text colors against their backgrounds. Use contrast checkers.'
  },
  {
    mistake: 'Not enough contrast between elements',
    solution: 'Cards, buttons, and sections need visible boundaries.'
  },
  {
    mistake: 'Forgetting hover/focus states',
    solution: 'Plan color variations for all interactive states upfront.'
  },
  {
    mistake: 'Using color as only differentiator',
    solution: 'Add icons, text, or patterns alongside color coding.'
  }
];

function WebDesignColorsGuide() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "Web Design Color Guide - UI Color Systems & Best Practices",
    "description": "Complete guide to using colors in web design. Learn about UI color systems, dark mode, CSS implementation, and best practices.",
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
    { label: 'Web Design Colors' }
  ];

  const relatedLinks = [
    { href: '/', label: 'Palette Generator', icon: Palette },
    { href: '/guides/tailwind-css-colors', label: 'Tailwind CSS Colors', icon: Code },
    { href: '/guides/accessibility-wcag', label: 'Accessibility Guide', icon: BookOpen },
    { href: '/guides/color-theory', label: 'Color Theory', icon: BookOpen },
  ];

  return (
    <SEOArticleLayout
      title="Web Design Colors Guide - UI Color Systems & Best Practices"
      description="Learn how to create effective color systems for web design. Covers UI color palettes, dark mode, CSS implementation, accessibility, and common mistakes to avoid."
      keywords="web design colors, UI color system, website color palette, dark mode colors, CSS color variables, web color best practices, UI color palette, website color scheme"
      canonicalPath="/guides/web-design-colors"
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      relatedLinks={relatedLinks}
      lastModified="2025-01-15"
    >
      <PageHeader
        badge="Web Design Guide"
        badgeIcon={Monitor}
        title="Web Design Colors: Building Effective UI Color Systems"
        subtitle="Create cohesive, accessible color systems for websites and web applications."
      />

      {/* Table of Contents */}
      <nav className="article-toc">
        <h2>Table of Contents</h2>
        <ol>
          <li><a href="#color-systems">Building a UI Color System</a></li>
          <li><a href="#dark-mode">Dark Mode Design</a></li>
          <li><a href="#implementation">CSS Implementation</a></li>
          <li><a href="#common-mistakes">Common Mistakes</a></li>
          <li><a href="#checklist">Color Checklist</a></li>
        </ol>
      </nav>

      {/* UI Color Systems */}
      <section id="color-systems" className="article-section">
        <h2>Building a UI Color System</h2>
        <p>
          A well-structured color system makes your website consistent, maintainable, and 
          scalable. Rather than picking colors ad-hoc, define categories with specific roles.
        </p>

        <div className="color-system-grid">
          {UI_COLOR_SYSTEM.map((item) => (
            <div key={item.category} className="system-card">
              <h3>{item.category}</h3>
              <div className="system-colors">
                {item.colors.map((color, i) => (
                  <span key={i} className="system-color-tag">{color}</span>
                ))}
              </div>
              <p>{item.guidance}</p>
              <code className="system-example">{item.example}</code>
            </div>
          ))}
        </div>

        <h3>The Minimum Viable Color System</h3>
        <p>
          At minimum, every web project needs:
        </p>
        <ul>
          <li><strong>1 Primary color</strong> for main actions and brand identity</li>
          <li><strong>3-4 Neutral colors</strong> for text hierarchy</li>
          <li><strong>2-3 Background colors</strong> for depth and sections</li>
          <li><strong>4 Semantic colors</strong> for success, error, warning, info</li>
          <li><strong>2-3 Border colors</strong> for structure and focus states</li>
        </ul>

        <p>
          Generate a complete system with our <Link to="/">palette generator</Link>, then 
          export to <Link to="/guides/tailwind-css-colors">Tailwind CSS</Link> or CSS variables.
        </p>
      </section>

      {/* Dark Mode */}
      <section id="dark-mode" className="article-section">
        <h2>Dark Mode Design</h2>
        <p>
          Dark mode isn't just inverting your colors—it requires thoughtful adjustments 
          to maintain readability, hierarchy, and aesthetics.
        </p>

        <div className="tips-list">
          {DARK_MODE_TIPS.map((tip, i) => (
            <div key={i} className="tip-item">
              <CheckCircle size={18} className="tip-icon" />
              <span>{tip}</span>
            </div>
          ))}
        </div>

        <h3>Dark Mode Color Adjustments</h3>
        <div className="comparison-grid">
          <div className="comparison-card light">
            <h4>Light Mode</h4>
            <ul>
              <li>Background: #FFFFFF</li>
              <li>Surface: #F8FAFC</li>
              <li>Text: #0F172A</li>
              <li>Muted text: #64748B</li>
              <li>Primary: #2563EB (100% sat)</li>
            </ul>
          </div>
          <div className="comparison-card dark">
            <h4>Dark Mode</h4>
            <ul>
              <li>Background: #0F172A</li>
              <li>Surface: #1E293B</li>
              <li>Text: #E2E8F0</li>
              <li>Muted text: #94A3B8</li>
              <li>Primary: #3B82F6 (slightly lighter)</li>
            </ul>
          </div>
        </div>

        <p>
          Use our generator's "Dark mode friendly" option to automatically adjust 
          colors for dark backgrounds.
        </p>
      </section>

      {/* Implementation */}
      <section id="implementation" className="article-section">
        <h2>CSS Implementation</h2>
        <p>
          Modern CSS makes color systems easy to implement and maintain.
        </p>

        <h3>CSS Custom Properties (Recommended)</h3>
        <pre className="code-block"><code>{`:root {
  /* Light theme */
  --color-bg: #ffffff;
  --color-text: #0f172a;
  --color-primary: #2563eb;
}

[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #e2e8f0;
  --color-primary: #3b82f6;
}

/* Usage */
body {
  background: var(--color-bg);
  color: var(--color-text);
}`}</code></pre>

        <p>
          Export your palette from CColorPalette in CSS format, or see our{' '}
          <Link to="/guides/tailwind-css-colors">Tailwind CSS guide</Link> for 
          framework-specific implementation.
        </p>
      </section>

      {/* Common Mistakes */}
      <section id="common-mistakes" className="article-section">
        <h2>Common Web Design Color Mistakes</h2>
        
        <div className="mistakes-grid">
          {COMMON_MISTAKES.map((item, i) => (
            <div key={i} className="mistake-card">
              <h3>❌ {item.mistake}</h3>
              <p>✅ {item.solution}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Checklist */}
      <section id="checklist" className="article-section">
        <h2>Color System Checklist</h2>
        <p>Before launching, verify your color system:</p>
        
        <div className="checklist-grid">
          <div className="checklist-section">
            <h3>Accessibility</h3>
            <ul>
              <li>☐ All text meets WCAG AA contrast (4.5:1)</li>
              <li>☐ Large text meets 3:1 minimum</li>
              <li>☐ Focus states are visible</li>
              <li>☐ Tested with color blindness simulator</li>
              <li>☐ Information not conveyed by color alone</li>
            </ul>
          </div>
          
          <div className="checklist-section">
            <h3>Consistency</h3>
            <ul>
              <li>☐ Colors documented with HEX/RGB values</li>
              <li>☐ Naming convention established</li>
              <li>☐ All interactive states defined</li>
              <li>☐ Feedback colors consistent (success, error)</li>
              <li>☐ Dark mode tested (if applicable)</li>
            </ul>
          </div>
          
          <div className="checklist-section">
            <h3>Implementation</h3>
            <ul>
              <li>☐ CSS variables or design tokens created</li>
              <li>☐ Colors work across all browsers</li>
              <li>☐ Print styles considered</li>
              <li>☐ Colors work on various screen types</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="article-cta">
        <h2>Build Your Web Color System</h2>
        <p>
          Generate harmonious, accessible colors and export them ready for your web project.
        </p>
        <Link to="/" className="article-cta-btn">
          <Palette size={20} />
          Open Palette Generator
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Related Articles */}
      <section className="article-related">
        <h2>Continue Learning</h2>
        <div className="related-articles-grid">
          <Link to="/guides/tailwind-css-colors" className="related-article-card">
            <h3>Tailwind CSS Colors</h3>
            <p>Configure colors in Tailwind projects.</p>
          </Link>
          <Link to="/guides/accessibility-wcag" className="related-article-card">
            <h3>Accessibility</h3>
            <p>Ensure your colors work for everyone.</p>
          </Link>
          <Link to="/guides/color-theory" className="related-article-card">
            <h3>Color Theory</h3>
            <p>Create harmonious combinations.</p>
          </Link>
        </div>
      </section>
    </SEOArticleLayout>
  );
}

export default WebDesignColorsGuide;