// src/pages/Resources/ColorGlossary.jsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  ArrowRight,
  Palette,
  Hash
} from 'lucide-react';
import { 
  SEOArticleLayout, 
  PageHeader,
} from '../../components/SEOLayout';
import './ColorGlossary.css';

const GLOSSARY_TERMS = [
  {
    term: 'Analogous Colors',
    definition: 'Colors that are adjacent to each other on the color wheel, typically within 30-60 degrees. They create harmonious, cohesive palettes often found in nature.',
    related: ['Color Wheel', 'Color Harmony', 'Complementary Colors'],
    category: 'harmony'
  },
  {
    term: 'Brightness',
    definition: 'The perceived intensity of light emitted or reflected by a color. Often used interchangeably with lightness, though technically brightness refers to emitted light while lightness refers to reflected light.',
    related: ['Lightness', 'Value', 'Luminance'],
    category: 'property'
  },
  {
    term: 'Chroma',
    definition: 'The purity or intensity of a color, indicating how vivid or dull it appears. High chroma colors are vivid; low chroma colors appear grayish. Used in color spaces like OKLCH.',
    related: ['Saturation', 'OKLCH', 'Color Space'],
    category: 'property'
  },
  {
    term: 'CMYK',
    definition: 'A subtractive color model used in color printing. Stands for Cyan, Magenta, Yellow, and Key (black). Colors are created by subtracting light through ink absorption.',
    related: ['RGB', 'Color Space', 'Subtractive Color'],
    category: 'format'
  },
  {
    term: 'Color Blindness',
    definition: 'A reduced ability to distinguish between certain colors. The most common types are protanopia (red-blind), deuteranopia (green-blind), and tritanopia (blue-blind).',
    related: ['Accessibility', 'WCAG', 'Contrast'],
    category: 'accessibility'
  },
  {
    term: 'Color Harmony',
    definition: 'The pleasing arrangement of colors that creates visual balance and aesthetic appeal. Based on relationships on the color wheel such as complementary, analogous, or triadic.',
    related: ['Color Wheel', 'Complementary Colors', 'Triadic Colors'],
    category: 'harmony'
  },
  {
    term: 'Color Space',
    definition: 'A specific organization of colors that defines how colors are represented numerically. Examples include RGB, HSL, CMYK, and OKLCH, each with different uses and properties.',
    related: ['RGB', 'HSL', 'OKLCH', 'CMYK'],
    category: 'format'
  },
  {
    term: 'Color Temperature',
    definition: 'The perceived warmth or coolness of a color. Warm colors (reds, oranges, yellows) appear to advance; cool colors (blues, greens, purples) appear to recede.',
    related: ['Warm Colors', 'Cool Colors', 'Color Psychology'],
    category: 'property'
  },
  {
    term: 'Color Wheel',
    definition: 'A circular diagram showing relationships between colors. Primary colors are evenly spaced, with secondary and tertiary colors between them. The basis for understanding color harmony.',
    related: ['Primary Colors', 'Secondary Colors', 'Color Harmony'],
    category: 'theory'
  },
  {
    term: 'Complementary Colors',
    definition: 'Colors positioned directly opposite each other on the color wheel (180 degrees apart). When placed together, they create maximum contrast and visual intensity.',
    related: ['Color Wheel', 'Split Complementary', 'Contrast'],
    category: 'harmony'
  },
  {
    term: 'Contrast',
    definition: 'The difference in luminance or color between two elements. High contrast improves readability; WCAG defines specific contrast ratios for accessibility compliance.',
    related: ['WCAG', 'Luminance', 'Accessibility'],
    category: 'accessibility'
  },
  {
    term: 'Contrast Ratio',
    definition: 'A numerical measurement of the difference in luminance between foreground and background colors. WCAG requires 4.5:1 for normal text (AA) and 7:1 for enhanced accessibility (AAA).',
    related: ['WCAG', 'Accessibility', 'Luminance'],
    category: 'accessibility'
  },
  {
    term: 'Cool Colors',
    definition: 'Colors on the blue-green side of the color wheel (roughly 170-280 degrees). They evoke calm, trust, and professionalism, and tend to visually recede.',
    related: ['Warm Colors', 'Color Temperature', 'Color Psychology'],
    category: 'property'
  },
  {
    term: 'Deuteranopia',
    definition: 'A type of red-green color blindness affecting green perception. The most common form of color blindness, affecting approximately 6% of males.',
    related: ['Color Blindness', 'Protanopia', 'Accessibility'],
    category: 'accessibility'
  },
  {
    term: 'Gradient',
    definition: 'A gradual transition between two or more colors. Linear gradients transition in a straight line; radial gradients transition from a center point outward.',
    related: ['Color Transition', 'CSS'],
    category: 'technique'
  },
  {
    term: 'Grayscale',
    definition: 'A range of colors from pure black to pure white with no saturation. Used to test designs for accessibility and to understand value relationships.',
    related: ['Value', 'Saturation', 'Monochromatic'],
    category: 'property'
  },
  {
    term: 'HEX Color',
    definition: 'A six-digit hexadecimal representation of a color, preceded by #. Each pair of digits represents red, green, and blue values from 00 to FF (0-255 in decimal).',
    related: ['RGB', 'Color Code', 'Web Colors'],
    category: 'format'
  },
  {
    term: 'HSL',
    definition: 'A color model representing colors as Hue (0-360 degrees), Saturation (0-100%), and Lightness (0-100%). More intuitive for humans than RGB for color manipulation.',
    related: ['Hue', 'Saturation', 'Lightness', 'HSV'],
    category: 'format'
  },
  {
    term: 'HSV/HSB',
    definition: 'Hue, Saturation, Value (or Brightness). Similar to HSL but uses Value/Brightness instead of Lightness. Common in design software like Photoshop.',
    related: ['HSL', 'Hue', 'Saturation', 'Value'],
    category: 'format'
  },
  {
    term: 'Hue',
    definition: 'The pure color attribute, measured in degrees (0-360) on the color wheel. Red is 0/360, green is 120, and blue is 240 degrees.',
    related: ['Color Wheel', 'HSL', 'Saturation'],
    category: 'property'
  },
  {
    term: 'Lightness',
    definition: 'How light or dark a color appears, measured from 0% (black) to 100% (white). The L in HSL. Different from brightness, which refers to emitted light.',
    related: ['Value', 'Brightness', 'HSL'],
    category: 'property'
  },
  {
    term: 'Luminance',
    definition: 'The objective measurement of light intensity as perceived by the human eye. Used to calculate contrast ratios for accessibility. Accounts for how the eye perceives different wavelengths.',
    related: ['Contrast Ratio', 'Brightness', 'WCAG'],
    category: 'property'
  },
  {
    term: 'Monochromatic',
    definition: 'A color scheme using variations of a single hue, created by adjusting saturation and lightness while keeping hue constant. Always harmonious and elegant.',
    related: ['Color Harmony', 'Tint', 'Shade', 'Tone'],
    category: 'harmony'
  },
  {
    term: 'Neutral Colors',
    definition: 'Colors with little to no saturation: black, white, grays, and sometimes muted browns and beiges. Essential for balance in color palettes.',
    related: ['Grayscale', 'Saturation', 'Color Balance'],
    category: 'property'
  },
  {
    term: 'OKLCH',
    definition: 'A perceptually uniform color space using Lightness, Chroma, and Hue. Colors with the same lightness value actually appear equally bright, unlike HSL. Modern CSS supports OKLCH natively.',
    related: ['Perceptual Uniformity', 'HSL', 'Color Space', 'Chroma'],
    category: 'format'
  },
  {
    term: 'Opacity',
    definition: 'The degree to which a color is transparent. 100% opacity is fully opaque; 0% is fully transparent. In CSS, controlled via RGBA or the opacity property.',
    related: ['Transparency', 'Alpha Channel', 'RGBA'],
    category: 'property'
  },
  {
    term: 'Palette',
    definition: 'A selected set of colors used together in a design. A well-designed palette typically includes primary, secondary, accent, and neutral colors with defined relationships.',
    related: ['Color Harmony', 'Color Scheme', 'Primary Colors'],
    category: 'theory'
  },
  {
    term: 'Perceptual Uniformity',
    definition: 'A property of color spaces where equal numerical changes produce equally perceived visual changes. OKLCH is perceptually uniform; HSL is not.',
    related: ['OKLCH', 'Color Space', 'Lightness'],
    category: 'theory'
  },
  {
    term: 'Primary Colors',
    definition: 'Colors that cannot be created by mixing other colors. In traditional color theory (RYB): red, yellow, blue. In digital (RGB): red, green, blue.',
    related: ['Secondary Colors', 'Tertiary Colors', 'Color Wheel'],
    category: 'theory'
  },
  {
    term: 'Protanopia',
    definition: 'A type of red-green color blindness affecting red perception. Red appears darker, almost black. Affects approximately 1% of males.',
    related: ['Color Blindness', 'Deuteranopia', 'Accessibility'],
    category: 'accessibility'
  },
  {
    term: 'RGB',
    definition: 'An additive color model using Red, Green, and Blue light. Each channel ranges from 0-255. The basis for digital displays and web colors.',
    related: ['HEX', 'Additive Color', 'Color Space'],
    category: 'format'
  },
  {
    term: 'Saturation',
    definition: 'The intensity or purity of a color. 100% saturation is the purest, most vivid form of the color; 0% saturation is gray. The S in HSL.',
    related: ['Chroma', 'HSL', 'Vibrance'],
    category: 'property'
  },
  {
    term: 'Secondary Colors',
    definition: 'Colors created by mixing two primary colors. In traditional color theory: orange (red+yellow), green (yellow+blue), purple (blue+red).',
    related: ['Primary Colors', 'Tertiary Colors', 'Color Wheel'],
    category: 'theory'
  },
  {
    term: 'Shade',
    definition: 'A color mixed with black, making it darker. Different from tint (mixed with white) and tone (mixed with gray). Used to create depth and hierarchy.',
    related: ['Tint', 'Tone', 'Value'],
    category: 'technique'
  },
  {
    term: 'Split Complementary',
    definition: 'A color harmony using a base color plus the two colors adjacent to its complement. Provides contrast with more flexibility than direct complementary.',
    related: ['Complementary Colors', 'Color Harmony', 'Triadic Colors'],
    category: 'harmony'
  },
  {
    term: 'Tertiary Colors',
    definition: 'Colors created by mixing a primary color with an adjacent secondary color. Examples: red-orange, yellow-green, blue-purple.',
    related: ['Primary Colors', 'Secondary Colors', 'Color Wheel'],
    category: 'theory'
  },
  {
    term: 'Tint',
    definition: 'A color mixed with white, making it lighter. Creates pastel versions of colors. Different from shade (mixed with black) and tone (mixed with gray).',
    related: ['Shade', 'Tone', 'Lightness'],
    category: 'technique'
  },
  {
    term: 'Tone',
    definition: 'A color mixed with gray (both black and white), reducing its saturation while potentially adjusting lightness. Creates muted, sophisticated colors.',
    related: ['Tint', 'Shade', 'Saturation'],
    category: 'technique'
  },
  {
    term: 'Triadic Colors',
    definition: 'Three colors equally spaced on the color wheel (120 degrees apart). Creates vibrant, balanced palettes. Examples: red-yellow-blue, orange-green-purple.',
    related: ['Color Harmony', 'Color Wheel', 'Tetradic Colors'],
    category: 'harmony'
  },
  {
    term: 'Tritanopia',
    definition: 'A rare type of color blindness affecting blue-yellow perception. Blue appears greenish, and yellow appears violet or light gray. Affects approximately 0.01% of the population.',
    related: ['Color Blindness', 'Protanopia', 'Deuteranopia'],
    category: 'accessibility'
  },
  {
    term: 'Value',
    definition: 'The lightness or darkness of a color. High value colors are light; low value colors are dark. Critical for creating visual hierarchy and readability.',
    related: ['Lightness', 'Brightness', 'Contrast'],
    category: 'property'
  },
  {
    term: 'Vibrance',
    definition: 'A selective saturation adjustment that increases saturation in less-saturated colors more than in already-saturated colors. Common in photo editing.',
    related: ['Saturation', 'Color Adjustment'],
    category: 'technique'
  },
  {
    term: 'Warm Colors',
    definition: 'Colors on the red-yellow side of the color wheel (roughly 0-60 and 300-360 degrees). They evoke energy, warmth, and excitement, and tend to visually advance.',
    related: ['Cool Colors', 'Color Temperature', 'Color Psychology'],
    category: 'property'
  },
  {
    term: 'WCAG',
    definition: 'Web Content Accessibility Guidelines. International standards for web accessibility, including color contrast requirements: 4.5:1 for AA (normal text) and 7:1 for AAA.',
    related: ['Contrast Ratio', 'Accessibility', 'Color Blindness'],
    category: 'accessibility'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Terms' },
  { id: 'harmony', label: 'Color Harmony' },
  { id: 'property', label: 'Color Properties' },
  { id: 'format', label: 'Color Formats' },
  { id: 'theory', label: 'Color Theory' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'technique', label: 'Techniques' },
];

function ColorGlossary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTerms = useMemo(() => {
    let terms = GLOSSARY_TERMS;
    
    if (activeCategory !== 'all') {
      terms = terms.filter(t => t.category === activeCategory);
    }
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      terms = terms.filter(t => 
        t.term.toLowerCase().includes(lower) ||
        t.definition.toLowerCase().includes(lower)
      );
    }
    
    return terms.sort((a, b) => a.term.localeCompare(b.term));
  }, [searchTerm, activeCategory]);

  // Group by first letter
  const groupedTerms = useMemo(() => {
    const groups = {};
    filteredTerms.forEach(term => {
      const letter = term.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(term);
    });
    return groups;
  }, [filteredTerms]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": "Color Terminology Glossary",
    "description": "Comprehensive glossary of color theory, color science, and design terminology.",
    "url": "https://ccolorpalette.com/glossary",
    "hasDefinedTerm": GLOSSARY_TERMS.slice(0, 20).map(term => ({
      "@type": "DefinedTerm",
      "name": term.term,
      "description": term.definition
    }))
  };

  const breadcrumbs = [
    { label: 'Home', href: '/home' },
    { label: 'Resources', href: '/glossary' },
    { label: 'Color Glossary' }
  ];

  const relatedLinks = [
    { href: '/', label: 'Palette Generator', icon: Palette },
    { href: '/guides/color-theory', label: 'Color Theory Guide', icon: BookOpen },
    { href: '/guides/accessibility-wcag', label: 'Accessibility Guide', icon: BookOpen },
    { href: '/tools/color-converter', label: 'Color Converter', icon: Hash },
  ];

  return (
    <SEOArticleLayout
      title="Color Glossary - Color Theory & Design Terminology"
      description="Comprehensive glossary of color terminology. Learn definitions for color theory, color spaces, accessibility, and design terms. From analogous to WCAG."
      keywords="color glossary, color terminology, color theory terms, HSL definition, RGB meaning, WCAG contrast, color wheel terms, design terminology, color definitions"
      canonicalPath="/glossary"
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      relatedLinks={relatedLinks}
      lastModified="2025-01-15"
    >
      <PageHeader
        badge="Reference"
        badgeIcon={BookOpen}
        title="Color Glossary"
        subtitle="Comprehensive definitions of color theory, color science, and design terminology."
      />

      {/* Search and Filters */}
      <div className="glossary-controls">
        <div className="glossary-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glossary-search-input"
          />
        </div>
        
        <div className="glossary-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="glossary-results-info">
        {filteredTerms.length} {filteredTerms.length === 1 ? 'term' : 'terms'} found
      </div>

      {/* Glossary Content */}
      <div className="glossary-content">
        {Object.keys(groupedTerms).length === 0 ? (
          <div className="glossary-empty">
            <p>No terms found matching your search.</p>
            <button onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}>
              Clear filters
            </button>
          </div>
        ) : (
          Object.keys(groupedTerms).sort().map(letter => (
            <div key={letter} className="glossary-letter-group">
              <h2 className="glossary-letter">{letter}</h2>
              <div className="glossary-terms">
                {groupedTerms[letter].map(item => (
                  <article key={item.term} className="glossary-term-card" id={item.term.toLowerCase().replace(/\s+/g, '-')}>
                    <h3 className="term-name">{item.term}</h3>
                    <p className="term-definition">{item.definition}</p>
                    {item.related.length > 0 && (
                      <div className="term-related">
                        <span className="related-label">Related:</span>
                        {item.related.map((rel, i) => (
                          <a 
                            key={rel} 
                            href={`#${rel.toLowerCase().replace(/\s+/g, '-')}`}
                            className="related-link"
                          >
                            {rel}{i < item.related.length - 1 ? ',' : ''}
                          </a>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CTA */}
      <section className="article-cta">
        <h2>Apply What You Have Learned</h2>
        <p>
          Put your color knowledge into practice with our palette generator.
        </p>
        <Link to="/" className="article-cta-btn">
          <Palette size={20} />
          Open Palette Generator
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Related Articles */}
      <section className="article-related">
        <h2>Learn More</h2>
        <div className="related-articles-grid">
          <Link to="/guides/color-theory" className="related-article-card">
            <h3>Color Theory Guide</h3>
            <p>Comprehensive guide to color harmony and the color wheel.</p>
          </Link>
          <Link to="/guides/accessibility-wcag" className="related-article-card">
            <h3>Accessibility Guide</h3>
            <p>WCAG contrast requirements and color blindness.</p>
          </Link>
          <Link to="/guides/color-psychology" className="related-article-card">
            <h3>Color Psychology</h3>
            <p>How colors affect emotions and behavior.</p>
          </Link>
        </div>
      </section>
    </SEOArticleLayout>
  );
}

export default ColorGlossary;