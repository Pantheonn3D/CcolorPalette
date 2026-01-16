// src/pages/Guides/AccessibilityGuide.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Palette, 
  Eye, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Accessibility,
  Users,
  Monitor,
  Contrast
} from 'lucide-react';
import { 
  SEOArticleLayout, 
  PageHeader,
} from '../../components/SEOLayout';

const WCAG_LEVELS = [
  {
    level: 'AA (Minimum)',
    normalText: '4.5:1',
    largeText: '3:1',
    uiComponents: '3:1',
    description: 'Required for most websites. Ensures content is readable for users with moderately low vision.',
    required: true
  },
  {
    level: 'AAA (Enhanced)',
    normalText: '7:1',
    largeText: '4.5:1',
    uiComponents: '4.5:1',
    description: 'Highest level of accessibility. Recommended for government and healthcare sites.',
    required: false
  }
];

const COLOR_BLINDNESS_TYPES = [
  {
    type: 'Protanopia',
    affected: 'Red perception',
    population: '~1% of males',
    description: 'Difficulty distinguishing red from green. Red appears darker, almost black.',
    avoid: 'Red-green combinations without additional differentiation',
    tips: ['Use blue-yellow contrasts', 'Add patterns or icons', 'Never rely on color alone']
  },
  {
    type: 'Deuteranopia',
    affected: 'Green perception',
    population: '~6% of males',
    description: 'Most common type. Green, yellow, and red appear similar.',
    avoid: 'Red-green, yellow-green combinations',
    tips: ['Use high contrast', 'Add text labels', 'Use shapes and patterns']
  },
  {
    type: 'Tritanopia',
    affected: 'Blue perception',
    population: '~0.01% of population',
    description: 'Rare. Blue appears greenish, yellow appears violet or light gray.',
    avoid: 'Blue-yellow combinations without contrast',
    tips: ['Use red-blue contrasts', 'Ensure sufficient value contrast']
  },
  {
    type: 'Achromatopsia',
    affected: 'All color perception',
    population: '~0.003% of population',
    description: 'Complete color blindness. Sees only grayscale.',
    avoid: 'Any color-only differentiation',
    tips: ['Ensure high luminance contrast', 'Use patterns and shapes', 'Add text labels']
  }
];

const COMMON_MISTAKES = [
  {
    mistake: 'Light gray text on white background',
    why: 'Insufficient contrast ratio, typically 2:1 or less',
    fix: 'Use darker gray (#595959 or darker) for minimum 4.5:1 ratio',
    icon: XCircle
  },
  {
    mistake: 'Red text for errors without icons',
    why: 'Color blind users may not perceive the red color',
    fix: 'Add error icons, bold text, or border indicators alongside color',
    icon: XCircle
  },
  {
    mistake: 'Colored links without underlines',
    why: 'Links become invisible to color blind users',
    fix: 'Always underline links or use other non-color indicators',
    icon: XCircle
  },
  {
    mistake: 'Low contrast placeholder text',
    why: 'Placeholder text is often too light to read',
    fix: 'Use visible labels instead of placeholders, or darken placeholder color',
    icon: XCircle
  },
  {
    mistake: 'Charts using only color to differentiate data',
    why: 'Data becomes indistinguishable for color blind users',
    fix: 'Add patterns, labels, or different shapes to chart elements',
    icon: XCircle
  }
];

const BEST_PRACTICES = [
  {
    practice: 'Test with real contrast checkers',
    description: 'Don\'t rely on visual estimation. Use tools to verify exact ratios.',
    icon: CheckCircle
  },
  {
    practice: 'Simulate color blindness',
    description: 'Preview your designs through various color blindness filters.',
    icon: CheckCircle
  },
  {
    practice: 'Use multiple visual cues',
    description: 'Combine color with icons, text, patterns, or borders.',
    icon: CheckCircle
  },
  {
    practice: 'Design in grayscale first',
    description: 'If your design works in grayscale, it will work for everyone.',
    icon: CheckCircle
  },
  {
    practice: 'Maintain contrast in all states',
    description: 'Check hover, focus, active, and disabled states too.',
    icon: CheckCircle
  },
  {
    practice: 'Test with real users',
    description: 'Automated tools catch ~30% of issues. User testing catches the rest.',
    icon: CheckCircle
  }
];

function AccessibilityGuide() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "WCAG Color Accessibility Guide for Designers",
    "description": "Learn how to create accessible color palettes that meet WCAG 2.1 guidelines. Understand contrast ratios, color blindness, and inclusive design practices.",
    "author": {
      "@type": "Organization",
      "name": "CColorPalette"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CColorPalette",
      "url": "https://ccolorpalette.com"
    },
    "datePublished": "2024-01-01",
    "dateModified": "2025-01-15"
  };

  const breadcrumbs = [
    { label: 'Home', href: '/home' },
    { label: 'Guides', href: '/guides/color-theory' },
    { label: 'Accessibility' }
  ];

  const relatedLinks = [
    { href: '/', label: 'Palette Generator', icon: Palette },
    { href: '/tools/contrast-checker', label: 'Contrast Checker', icon: Contrast },
    { href: '/guides/color-theory', label: 'Color Theory Guide', icon: BookOpen },
    { href: '/guides/web-design-colors', label: 'Web Design Colors', icon: BookOpen },
    { href: '/glossary', label: 'Color Glossary', icon: BookOpen },
  ];

  return (
    <SEOArticleLayout
      title="WCAG Color Accessibility Guide - Contrast Ratios & Color Blindness"
      description="Complete guide to creating accessible color palettes. Learn WCAG 2.1 contrast requirements, design for color blindness, and ensure your colors work for everyone. Free tools and practical tips."
      keywords="WCAG color contrast, accessible color palette, color blindness design, contrast ratio checker, ADA color compliance, inclusive design colors, accessibility guidelines, color accessibility, WCAG 2.1 colors"
      canonicalPath="/guides/accessibility-wcag"
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      relatedLinks={relatedLinks}
      lastModified="2025-01-15"
    >
      <PageHeader
        badge="Accessibility Guide"
        badgeIcon={Accessibility}
        title="WCAG Color Accessibility: The Complete Guide"
        subtitle="Create inclusive color palettes that work for everyone, including users with visual impairments and color blindness."
      />

      {/* Table of Contents */}
      <nav className="article-toc">
        <h2>Table of Contents</h2>
        <ol>
          <li><a href="#why-accessibility">Why Color Accessibility Matters</a></li>
          <li><a href="#wcag-requirements">WCAG Contrast Requirements</a></li>
          <li><a href="#color-blindness">Designing for Color Blindness</a></li>
          <li><a href="#common-mistakes">Common Mistakes to Avoid</a></li>
          <li><a href="#best-practices">Best Practices</a></li>
          <li><a href="#tools">Tools & Testing</a></li>
        </ol>
      </nav>

      {/* Why Accessibility */}
      <section id="why-accessibility" className="article-section">
        <h2>Why Color Accessibility Matters</h2>
        <p>
          Approximately <strong>1.3 billion people</strong> worldwide live with some form of visual 
          impairment. Additionally, about <strong>8% of men</strong> and <strong>0.5% of women</strong> have 
          some form of color blindness. Designing with accessibility in mind ensures your content 
          reaches everyone.
        </p>
        <p>
          Beyond ethics, accessibility is often legally required. The Americans with Disabilities 
          Act (ADA), Section 508, and the European Accessibility Act all mandate accessible digital 
          content. Non-compliance can result in lawsuits and significant penalties.
        </p>
        
        <div className="article-callout">
          <Users size={20} />
          <div>
            <strong>Business Impact:</strong> Accessible websites have better SEO, reach more users, 
            and often see improved conversion rates because the content is clearer for everyone.
          </div>
        </div>
      </section>

      {/* WCAG Requirements */}
      <section id="wcag-requirements" className="article-section">
        <h2>WCAG 2.1 Contrast Requirements</h2>
        <p>
          The Web Content Accessibility Guidelines (WCAG) define specific contrast ratios for text 
          and UI elements. Contrast ratio measures the difference in luminance between foreground 
          and background colors on a scale from 1:1 (no contrast) to 21:1 (maximum contrast).
        </p>

        <div className="wcag-table">
          <table>
            <thead>
              <tr>
                <th>Level</th>
                <th>Normal Text</th>
                <th>Large Text (18pt+)</th>
                <th>UI Components</th>
              </tr>
            </thead>
            <tbody>
              {WCAG_LEVELS.map((level) => (
                <tr key={level.level}>
                  <td>
                    <strong>{level.level}</strong>
                    {level.required && <span className="required-badge">Required</span>}
                  </td>
                  <td>{level.normalText}</td>
                  <td>{level.largeText}</td>
                  <td>{level.uiComponents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3>How to Calculate Contrast Ratio</h3>
        <p>
          Contrast ratio is calculated using the relative luminance of two colors. The formula 
          is <code>(L1 + 0.05) / (L2 + 0.05)</code> where L1 is the lighter color's luminance 
          and L2 is the darker color's luminance.
        </p>
        <p>
          Don't worry about calculating manually—use our{' '}
          <Link to="/tools/contrast-checker">contrast checker tool</Link> or the accessibility 
          panel in our <Link to="/">palette generator</Link> to see instant WCAG ratings.
        </p>

        <h3>What Counts as "Large Text"?</h3>
        <ul>
          <li><strong>18pt (24px)</strong> or larger regular weight text</li>
          <li><strong>14pt (18.5px)</strong> or larger bold text</li>
        </ul>
      </section>

      {/* Color Blindness */}
      <section id="color-blindness" className="article-section">
        <h2>Designing for Color Blindness</h2>
        <p>
          Color blindness affects how people perceive colors. The most common types affect 
          red-green perception, but blue-yellow and complete color blindness also exist. 
          Understanding these conditions helps you create universally accessible designs.
        </p>

        <div className="color-blindness-grid">
          {COLOR_BLINDNESS_TYPES.map((type) => (
            <div key={type.type} className="blindness-card">
              <h3>{type.type}</h3>
              <p className="affected"><strong>Affects:</strong> {type.affected}</p>
              <p className="population"><strong>Prevalence:</strong> {type.population}</p>
              <p>{type.description}</p>
              <div className="blindness-tips">
                <h4>Design Tips</h4>
                <ul>
                  {type.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p>
          Our <Link to="/">palette generator</Link> includes a color blindness simulator 
          that lets you preview your palette through each of these vision types. Always 
          test your designs before publishing.
        </p>
      </section>

      {/* Common Mistakes */}
      <section id="common-mistakes" className="article-section">
        <h2>Common Accessibility Mistakes</h2>
        <div className="mistakes-list">
          {COMMON_MISTAKES.map((item, i) => (
            <div key={i} className="mistake-item">
              <div className="mistake-header">
                <item.icon size={20} className="mistake-icon" />
                <h3>{item.mistake}</h3>
              </div>
              <p><strong>Why it's a problem:</strong> {item.why}</p>
              <p><strong>How to fix:</strong> {item.fix}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Best Practices */}
      <section id="best-practices" className="article-section">
        <h2>Accessibility Best Practices</h2>
        <div className="practices-grid">
          {BEST_PRACTICES.map((item, i) => (
            <div key={i} className="practice-item">
              <item.icon size={20} className="practice-icon" />
              <div>
                <h3>{item.practice}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="article-section">
        <h2>Accessibility Tools & Testing</h2>
        
        <h3>CColorPalette Tools</h3>
        <ul className="resource-list">
          <li>
            <Link to="/">Color Palette Generator</Link> – 
            Built-in WCAG contrast checking and color blindness simulation
          </li>
          <li>
            <Link to="/tools/contrast-checker">Contrast Checker</Link> – 
            Check any two colors against WCAG guidelines
          </li>
        </ul>

        <h3>External Resources</h3>
        <ul className="resource-list">
          <li>
            <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer">
              W3C WCAG 2.1 Quick Reference <ExternalLink size={12} />
            </a> – Official WCAG guidelines
          </li>
          <li>
            <a href="https://webaim.org/resources/contrastchecker/" target="_blank" rel="noopener noreferrer">
              WebAIM Contrast Checker <ExternalLink size={12} />
            </a> – Popular contrast testing tool
          </li>
          <li>
            <a href="https://www.a11yproject.com/" target="_blank" rel="noopener noreferrer">
              The A11Y Project <ExternalLink size={12} />
            </a> – Community accessibility resources
          </li>
        </ul>
      </section>

      {/* CTA */}
      <section className="article-cta">
        <h2>Create Accessible Palettes</h2>
        <p>
          Use our free palette generator with built-in accessibility checking 
          to ensure your colors work for everyone.
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
          <Link to="/guides/color-theory" className="related-article-card">
            <h3>Color Theory</h3>
            <p>Master the fundamentals of color harmony.</p>
          </Link>
          <Link to="/guides/web-design-colors" className="related-article-card">
            <h3>Web Design Colors</h3>
            <p>Best practices for web color usage.</p>
          </Link>
          <Link to="/glossary" className="related-article-card">
            <h3>Color Glossary</h3>
            <p>Definitions of accessibility terms.</p>
          </Link>
        </div>
      </section>
    </SEOArticleLayout>
  );
}

export default AccessibilityGuide;