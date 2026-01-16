// src/pages/Guides/ColorTheoryGuide.jsx - NEW FILE
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Palette, 
  Eye, 
  Zap,
  Circle,
  Layers,
  Blend,
  Triangle,
  GitBranch,
  Target,
  Lightbulb,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { 
  SEOArticleLayout, 
  PageHeader,
  STANDARD_INTERNAL_LINKS 
} from '../../components/SEOLayout';

const COLOR_WHEEL_SECTIONS = [
  {
    id: 'primary',
    title: 'Primary Colors',
    colors: ['Red', 'Yellow', 'Blue'],
    description: 'Primary colors are the foundation of all other colors. They cannot be created by mixing other colors together. In traditional color theory (RYB), these are red, yellow, and blue. In digital design (RGB), they are red, green, and blue.',
    usage: 'Primary colors are bold and attention-grabbing. Use them sparingly as accents or call-to-action elements.'
  },
  {
    id: 'secondary',
    title: 'Secondary Colors',
    colors: ['Orange', 'Green', 'Purple'],
    description: 'Secondary colors are created by mixing two primary colors: red + yellow = orange, yellow + blue = green, blue + red = purple.',
    usage: 'Secondary colors offer strong visual impact while being slightly less intense than primaries. Great for supporting brand elements.'
  },
  {
    id: 'tertiary',
    title: 'Tertiary Colors',
    colors: ['Red-Orange', 'Yellow-Orange', 'Yellow-Green', 'Blue-Green', 'Blue-Purple', 'Red-Purple'],
    description: 'Tertiary colors are created by mixing a primary with an adjacent secondary color, resulting in six additional hues.',
    usage: 'Tertiary colors provide nuanced options for sophisticated color schemes and gradual transitions.'
  }
];

const HARMONY_TYPES = [
  {
    id: 'monochromatic',
    icon: Circle,
    title: 'Monochromatic',
    description: 'Uses variations of a single hue by adjusting saturation and lightness.',
    pros: ['Always harmonious', 'Creates elegant, unified look', 'Easy to implement'],
    cons: ['Can lack visual interest', 'Limited contrast options'],
    bestFor: 'Minimalist designs, luxury brands, photography portfolios',
    example: '/2A5B6C-3D7A8E-5099B0-6BB8D2-86D7F4'
  },
  {
    id: 'analogous',
    icon: Layers,
    title: 'Analogous',
    description: 'Combines colors adjacent to each other on the color wheel (30-60° apart).',
    pros: ['Natural, organic feel', 'Visually comfortable', 'Found in nature'],
    cons: ['Low contrast', 'Needs careful balance'],
    bestFor: 'Nature themes, wellness brands, comfortable UIs',
    example: '/1A5B3A-2A7B4A-3A9B5A-6ABB7A-9ADB9A'
  },
  {
    id: 'complementary',
    icon: Blend,
    title: 'Complementary',
    description: 'Pairs colors directly opposite each other on the wheel (180° apart).',
    pros: ['Maximum contrast', 'Vibrant, energetic', 'Commands attention'],
    cons: ['Can be jarring', 'Requires careful balance'],
    bestFor: 'Call-to-action buttons, sports brands, event marketing',
    example: '/E63946-1D3557-F1FAEE-A8DADC-457B9D'
  },
  {
    id: 'split-complementary',
    icon: GitBranch,
    title: 'Split Complementary',
    description: 'Uses a base color with the two colors adjacent to its complement.',
    pros: ['High contrast with more nuance', 'Easier to balance than complementary', 'Visually interesting'],
    cons: ['More complex to implement', 'Requires careful proportion'],
    bestFor: 'Web design, app interfaces, versatile branding',
    example: '/3A86FF-8338EC-FF006E-FB5607-FFBE0B'
  },
  {
    id: 'triadic',
    icon: Triangle,
    title: 'Triadic',
    description: 'Three colors equally spaced around the wheel (120° apart).',
    pros: ['Vibrant and balanced', 'Strong visual interest', 'Versatile'],
    cons: ['Can be overwhelming', 'Needs one dominant color'],
    bestFor: 'Children\'s products, creative agencies, playful brands',
    example: '/FF5733-33FF57-5733FF-FF33A1-33FFF5'
  },
  {
    id: 'tetradic',
    icon: Target,
    title: 'Tetradic (Square)',
    description: 'Four colors forming a square on the wheel (90° apart each).',
    pros: ['Rich color variety', 'Complex visual interest', 'Many combinations'],
    cons: ['Challenging to balance', 'Can appear cluttered'],
    bestFor: 'Complex illustrations, diverse product lines, event graphics',
    example: '/264653-2A9D8F-E9C46A-F4A261-E76F51'
  }
];

const COLOR_PROPERTIES = [
  {
    name: 'Hue',
    description: 'The pure color itself, measured in degrees (0-360°) on the color wheel. Red is 0°, green is 120°, blue is 240°.',
    example: 'Changing hue transforms red to orange to yellow to green, etc.'
  },
  {
    name: 'Saturation',
    description: 'The intensity or purity of a color, measured as a percentage. 100% is vivid; 0% is gray.',
    example: 'High saturation = vibrant red. Low saturation = muted, grayish red.'
  },
  {
    name: 'Lightness/Value',
    description: 'How light or dark a color appears, measured as a percentage. 100% is white; 0% is black.',
    example: 'High lightness = pink (light red). Low lightness = maroon (dark red).'
  },
  {
    name: 'Temperature',
    description: 'The perceived warmth or coolness of a color. Warm: reds, oranges, yellows. Cool: blues, greens, purples.',
    example: 'Warm colors advance visually; cool colors recede.'
  },
  {
    name: 'Chroma',
    description: 'Similar to saturation but refers to the colorfulness relative to white. Used in OKLCH color space.',
    example: 'High chroma colors stand out; low chroma colors blend with neutrals.'
  }
];

function ColorTheoryGuide() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Complete Guide to Color Theory for Designers",
    "description": "Learn color theory fundamentals including the color wheel, color harmonies, and how to create effective color palettes for web design and branding.",
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
    "dateModified": "2025-01-15",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://ccolorpalette.com/guides/color-theory"
    }
  };

  const breadcrumbs = [
    { label: 'Home', href: '/home' },
    { label: 'Guides', href: '/guides/color-theory' },
    { label: 'Color Theory' }
  ];

  const relatedLinks = [
    { href: '/', label: 'Color Palette Generator', icon: Palette },
    { href: '/guides/color-psychology', label: 'Color Psychology Guide', icon: BookOpen },
    { href: '/guides/accessibility-wcag', label: 'WCAG Accessibility', icon: Eye },
    { href: '/guides/web-design-colors', label: 'Web Design Colors', icon: BookOpen },
    { href: '/glossary', label: 'Color Glossary', icon: BookOpen },
    { href: '/explore', label: 'Explore Palettes', icon: Palette },
  ];

  return (
    <SEOArticleLayout
      title="Complete Guide to Color Theory for Designers"
      description="Master color theory with our comprehensive guide. Learn about the color wheel, color harmonies (complementary, analogous, triadic), and how to create effective color palettes for web design, branding, and UI/UX projects."
      keywords="color theory, color wheel, color harmony, complementary colors, analogous colors, triadic colors, color palette design, color schemes, hue saturation lightness, web design colors"
      canonicalPath="/guides/color-theory"
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      relatedLinks={relatedLinks}
      lastModified="2025-01-15"
    >
      <PageHeader
        badge="Complete Guide"
        badgeIcon={BookOpen}
        title="Color Theory: The Complete Guide for Designers"
        subtitle="Master the fundamentals of color and create harmonious, effective color palettes for any project."
      />

      {/* Table of Contents */}
      <nav className="article-toc">
        <h2>Table of Contents</h2>
        <ol>
          <li><a href="#what-is-color-theory">What is Color Theory?</a></li>
          <li><a href="#color-wheel">The Color Wheel</a></li>
          <li><a href="#color-properties">Color Properties (HSL)</a></li>
          <li><a href="#color-harmonies">Color Harmonies</a></li>
          <li><a href="#applying-color-theory">Applying Color Theory</a></li>
          <li><a href="#tools-resources">Tools & Resources</a></li>
        </ol>
      </nav>

      {/* Introduction */}
      <section id="what-is-color-theory" className="article-section">
        <h2>What is Color Theory?</h2>
        <p>
          Color theory is the study of how colors interact, complement, and influence each other. 
          It provides a framework for creating visually pleasing and effective color combinations 
          in art, design, and visual communication.
        </p>
        <p>
          Understanding color theory is essential for designers because it transforms random 
          color selection into intentional, effective communication. Whether you're designing 
          a <Link to="/guides/web-design-colors">website</Link>, creating a{' '}
          <Link to="/guides/brand-color-palette">brand identity</Link>, or building a user 
          interface, color theory helps you make informed decisions that resonate with your audience.
        </p>
        
        <div className="article-callout">
          <Lightbulb size={20} />
          <div>
            <strong>Quick Start:</strong> Want to apply color theory immediately? 
            Our <Link to="/">color palette generator</Link> uses these principles 
            automatically to create harmonious combinations.
          </div>
        </div>
      </section>

      {/* Color Wheel */}
      <section id="color-wheel" className="article-section">
        <h2>The Color Wheel: Foundation of Color Theory</h2>
        <p>
          The color wheel is a circular diagram that shows relationships between colors. 
          Developed by Sir Isaac Newton in 1666, it remains the fundamental tool for 
          understanding color relationships.
        </p>

        <div className="color-wheel-visual">
          {/* Visual representation would go here */}
          <div className="color-wheel-placeholder">
            <span>Color Wheel Diagram</span>
          </div>
        </div>

        {COLOR_WHEEL_SECTIONS.map((section) => (
          <div key={section.id} className="color-category">
            <h3>{section.title}</h3>
            <div className="color-swatches">
              {section.colors.map((color) => (
                <span key={color} className="color-name">{color}</span>
              ))}
            </div>
            <p>{section.description}</p>
            <p><strong>Usage:</strong> {section.usage}</p>
          </div>
        ))}
      </section>

      {/* Color Properties */}
      <section id="color-properties" className="article-section">
        <h2>Color Properties: Understanding HSL</h2>
        <p>
          Every color can be described using three fundamental properties. The HSL 
          (Hue, Saturation, Lightness) model is particularly intuitive for designers 
          because it mirrors how humans perceive color.
        </p>

        <div className="properties-grid">
          {COLOR_PROPERTIES.map((prop) => (
            <div key={prop.name} className="property-card">
              <h4>{prop.name}</h4>
              <p>{prop.description}</p>
              <div className="property-example">
                <strong>Example:</strong> {prop.example}
              </div>
            </div>
          ))}
        </div>

        <p>
          Our <Link to="/">palette generator</Link> actually uses OKLCH internally—a 
          perceptually uniform color space that ensures colors with the same lightness 
          actually appear equally bright to human vision. Learn more in our{' '}
          <Link to="/glossary">color glossary</Link>.
        </p>
      </section>

      {/* Color Harmonies */}
      <section id="color-harmonies" className="article-section">
        <h2>Color Harmonies: Creating Balanced Palettes</h2>
        <p>
          Color harmonies are combinations of colors that create visual balance and 
          aesthetic appeal. They're based on geometric relationships on the color wheel.
        </p>

        <div className="harmonies-grid">
          {HARMONY_TYPES.map((harmony) => (
            <div key={harmony.id} className="harmony-card" id={`harmony-${harmony.id}`}>
              <div className="harmony-header">
                <harmony.icon size={24} />
                <h3>{harmony.title}</h3>
              </div>
              <p>{harmony.description}</p>
              
              <div className="harmony-details">
                <div className="harmony-pros">
                  <h4>Advantages</h4>
                  <ul>
                    {harmony.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div className="harmony-cons">
                  <h4>Challenges</h4>
                  <ul>
                    {harmony.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <p><strong>Best for:</strong> {harmony.bestFor}</p>
              
              <Link to={harmony.example} className="harmony-example-link">
                <span>View Example Palette</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Applying Color Theory */}
      <section id="applying-color-theory" className="article-section">
        <h2>Applying Color Theory in Practice</h2>
        
        <h3>The 60-30-10 Rule</h3>
        <p>
          A proven formula for balanced color distribution: 60% dominant color (backgrounds), 
          30% secondary color (main content areas), and 10% accent color (calls-to-action, highlights).
        </p>

        <h3>Creating Hierarchy with Color</h3>
        <p>
          Use color to guide the user's eye through your design. Bright, saturated colors 
          draw attention, while muted colors recede. This is crucial for{' '}
          <Link to="/guides/web-design-colors">effective web design</Link>.
        </p>

        <h3>Accessibility Considerations</h3>
        <p>
          Always consider <Link to="/guides/accessibility-wcag">WCAG accessibility guidelines</Link>{' '}
          when choosing colors. Ensure sufficient contrast for text readability and avoid 
          relying solely on color to convey information. Our{' '}
          <Link to="/tools/contrast-checker">contrast checker tool</Link> can help.
        </p>

        <h3>Context and Culture</h3>
        <p>
          Color meanings vary across cultures. Red signifies luck in China but danger in Western 
          contexts. Consider your audience when selecting colors for{' '}
          <Link to="/guides/brand-color-palette">brand identities</Link>. Learn more about 
          symbolic meanings in our <Link to="/guides/color-psychology">color psychology guide</Link>.
        </p>
      </section>

      {/* Tools & Resources */}
      <section id="tools-resources" className="article-section">
        <h2>Tools & Resources</h2>
        
        <h3>CColorPalette Tools</h3>
        <ul className="resource-list">
          <li>
            <Link to="/">Color Palette Generator</Link> – 
            Generate harmonious palettes using all harmony types discussed above
          </li>
          <li>
            <Link to="/tools/contrast-checker">Contrast Checker</Link> – 
            Verify WCAG compliance for your color combinations
          </li>
          <li>
            <Link to="/tools/color-converter">Color Converter</Link> – 
            Convert between HEX, RGB, HSL, and OKLCH formats
          </li>
          <li>
            <Link to="/explore">Palette Directory</Link> – 
            Browse thousands of curated color palettes
          </li>
        </ul>

        <h3>External Resources</h3>
        <ul className="resource-list">
          <li>
            <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer">
              W3C WCAG 2.1 Guidelines <ExternalLink size={12} />
            </a>
          </li>
          <li>
            <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value" target="_blank" rel="noopener noreferrer">
              MDN CSS Color Documentation <ExternalLink size={12} />
            </a>
          </li>
        </ul>
      </section>

      {/* CTA */}
      <section className="article-cta">
        <h2>Ready to Create Your Palette?</h2>
        <p>
          Put color theory into practice with our free palette generator. 
          Press spacebar to generate harmonious color combinations instantly.
        </p>
        <Link to="/" className="article-cta-btn">
          <Palette size={20} />
          Open Color Palette Generator
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Related Articles */}
      <section className="article-related">
        <h2>Continue Learning</h2>
        <div className="related-articles-grid">
          <Link to="/guides/color-psychology" className="related-article-card">
            <h3>Color Psychology</h3>
            <p>How colors influence emotions and behavior in design.</p>
          </Link>
          <Link to="/guides/accessibility-wcag" className="related-article-card">
            <h3>WCAG Accessibility</h3>
            <p>Ensure your color choices are accessible to everyone.</p>
          </Link>
          <Link to="/guides/brand-color-palette" className="related-article-card">
            <h3>Brand Color Guide</h3>
            <p>Create distinctive color palettes for brand identity.</p>
          </Link>
          <Link to="/glossary" className="related-article-card">
            <h3>Color Glossary</h3>
            <p>Definitions of all color-related terminology.</p>
          </Link>
        </div>
      </section>
    </SEOArticleLayout>
  );
}

export default ColorTheoryGuide;