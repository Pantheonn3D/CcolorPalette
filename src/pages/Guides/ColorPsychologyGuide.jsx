// src/pages/Guides/ColorPsychologyGuide.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Palette, 
  Brain,
  Heart,
  ArrowRight,
  Globe
} from 'lucide-react';
import { 
  SEOArticleLayout, 
  PageHeader,
} from '../../components/SEOLayout';

const COLOR_MEANINGS = [
  {
    color: 'Red',
    hex: '#DC2626',
    emotions: ['Passion', 'Energy', 'Urgency', 'Excitement', 'Danger'],
    positive: 'Love, power, confidence, courage, determination',
    negative: 'Anger, aggression, danger, warning',
    usage: 'Sale signs, CTAs, food brands, sports, emergency services',
    brands: ['Coca-Cola', 'YouTube', 'Netflix', 'Target', 'CNN'],
    cultural: 'Luck and prosperity in China; mourning in South Africa',
    palette: '/DC2626-EF4444-F87171-FCA5A5-FEE2E2'
  },
  {
    color: 'Orange',
    hex: '#EA580C',
    emotions: ['Enthusiasm', 'Creativity', 'Warmth', 'Adventure', 'Confidence'],
    positive: 'Friendly, energetic, cheerful, affordable, youthful',
    negative: 'Cheap, immaturity, frustration, ignorance',
    usage: 'Food, fitness, creative agencies, youth brands, CTAs',
    brands: ['Amazon', 'Nickelodeon', 'Fanta', 'Harley-Davidson', 'Firefox'],
    cultural: 'Sacred in Hinduism; represents autumn in Western cultures',
    palette: '/EA580C-F97316-FB923C-FDBA74-FED7AA'
  },
  {
    color: 'Yellow',
    hex: '#EAB308',
    emotions: ['Happiness', 'Optimism', 'Clarity', 'Warmth', 'Caution'],
    positive: 'Cheerful, energetic, attention-grabbing, warm, hopeful',
    negative: 'Cowardice, caution, anxiety, criticism',
    usage: 'Warnings, children products, food, taxis, optimistic brands',
    brands: ['McDonald\'s', 'IKEA', 'Best Buy', 'Snapchat', 'National Geographic'],
    cultural: 'Imperial color in China; mourning in Egypt',
    palette: '/EAB308-FACC15-FDE047-FEF08A-FEF9C3'
  },
  {
    color: 'Green',
    hex: '#16A34A',
    emotions: ['Nature', 'Growth', 'Health', 'Wealth', 'Calm'],
    positive: 'Fresh, peaceful, balanced, prosperous, healthy',
    negative: 'Envy, inexperience, boredom, stagnation',
    usage: 'Environmental, health, finance, organic, outdoor brands',
    brands: ['Whole Foods', 'Spotify', 'Starbucks', 'John Deere', 'Animal Planet'],
    cultural: 'Sacred in Islam; represents luck in Western cultures',
    palette: '/16A34A-22C55E-4ADE80-86EFAC-BBF7D0'
  },
  {
    color: 'Blue',
    hex: '#2563EB',
    emotions: ['Trust', 'Security', 'Calm', 'Intelligence', 'Loyalty'],
    positive: 'Professional, reliable, peaceful, trustworthy, stable',
    negative: 'Cold, distant, sad, predictable, conservative',
    usage: 'Technology, finance, healthcare, corporate, social media',
    brands: ['Facebook', 'IBM', 'Ford', 'Samsung', 'PayPal', 'LinkedIn'],
    cultural: 'Protective against evil eye in Middle East; immortality in China',
    palette: '/2563EB-3B82F6-60A5FA-93C5FD-BFDBFE'
  },
  {
    color: 'Purple',
    hex: '#7C3AED',
    emotions: ['Luxury', 'Creativity', 'Wisdom', 'Mystery', 'Spirituality'],
    positive: 'Royal, imaginative, sophisticated, wise, spiritual',
    negative: 'Decadent, moodiness, arrogance, immaturity',
    usage: 'Luxury brands, beauty, creative, spiritual, premium services',
    brands: ['Cadbury', 'Hallmark', 'Yahoo', 'Twitch', 'Roku'],
    cultural: 'Historically associated with royalty due to expensive dye',
    palette: '/7C3AED-8B5CF6-A78BFA-C4B5FD-DDD6FE'
  },
  {
    color: 'Pink',
    hex: '#DB2777',
    emotions: ['Love', 'Femininity', 'Playfulness', 'Nurturing', 'Sweetness'],
    positive: 'Romantic, gentle, compassionate, youthful, fun',
    negative: 'Weak, immature, overly sweet, unserious',
    usage: 'Beauty, fashion, romance, children, breast cancer awareness',
    brands: ['Barbie', 'Victoria\'s Secret', 'T-Mobile', 'Cosmopolitan', 'Lyft'],
    cultural: 'Relatively new gender association (early 20th century)',
    palette: '/DB2777-EC4899-F472B6-F9A8D4-FBCFE8'
  },
  {
    color: 'Black',
    hex: '#171717',
    emotions: ['Power', 'Elegance', 'Sophistication', 'Mystery', 'Authority'],
    positive: 'Luxurious, powerful, timeless, formal, elegant',
    negative: 'Death, evil, mourning, heaviness, cold',
    usage: 'Luxury, fashion, technology, formal, high-end brands',
    brands: ['Chanel', 'Nike', 'Apple', 'Prada', 'Adidas'],
    cultural: 'Mourning in Western cultures; prosperity in some African cultures',
    palette: '/171717-262626-404040-525252-737373'
  },
  {
    color: 'White',
    hex: '#FAFAFA',
    emotions: ['Purity', 'Cleanliness', 'Simplicity', 'Peace', 'Innocence'],
    positive: 'Clean, fresh, simple, peaceful, pure',
    negative: 'Sterile, empty, cold, distant, boring',
    usage: 'Healthcare, technology, minimalist, weddings, clean brands',
    brands: ['Apple', 'Tesla', 'Adidas', 'The North Face', 'Mini'],
    cultural: 'Mourning in many Asian cultures; purity in Western cultures',
    palette: '/FAFAFA-F5F5F5-E5E5E5-D4D4D4-A3A3A3'
  }
];

const CULTURAL_CONSIDERATIONS = [
  {
    color: 'White',
    western: 'Purity, weddings, peace',
    eastern: 'Death, mourning (China, Japan, Korea)',
    middle_east: 'Purity, peace',
    consideration: 'Avoid white in branding for East Asian audiences when associated with celebration'
  },
  {
    color: 'Red',
    western: 'Danger, passion, love',
    eastern: 'Good luck, prosperity, celebration (China)',
    middle_east: 'Danger, caution',
    consideration: 'Highly positive in Chinese markets; use for celebrations and prosperity'
  },
  {
    color: 'Yellow',
    western: 'Happiness, caution, cowardice',
    eastern: 'Royalty, sacred (China), courage (Japan)',
    middle_east: 'Happiness, prosperity',
    consideration: 'Very positive in Eastern cultures; excellent for Asian market brands'
  },
  {
    color: 'Green',
    western: 'Nature, money, envy',
    eastern: 'Eternity, family, health',
    middle_east: 'Sacred in Islam, paradise',
    consideration: 'Handle carefully in Islamic contexts; highly respected color'
  },
  {
    color: 'Blue',
    western: 'Trust, sadness, calm',
    eastern: 'Immortality, healing',
    middle_east: 'Protection, spirituality',
    consideration: 'Universally positive; safe choice for global brands'
  }
];

function ColorPsychologyGuide() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Color Psychology in Design and Branding",
    "description": "Comprehensive guide to color psychology. Learn how colors affect emotions, behavior, and perception in design and marketing.",
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
    { label: 'Color Psychology' }
  ];

  const relatedLinks = [
    { href: '/', label: 'Palette Generator', icon: Palette },
    { href: '/guides/brand-color-palette', label: 'Brand Colors Guide', icon: BookOpen },
    { href: '/guides/color-theory', label: 'Color Theory', icon: BookOpen },
    { href: '/palettes/mood/warm', label: 'Warm Palettes', icon: Palette },
    { href: '/palettes/mood/cool', label: 'Cool Palettes', icon: Palette },
  ];

  return (
    <SEOArticleLayout
      title="Color Psychology Guide - How Colors Affect Emotions & Behavior"
      description="Learn how colors influence emotions, perception, and behavior. Complete guide to color meanings, cultural differences, and psychological effects for designers and marketers."
      keywords="color psychology, color meanings, color emotions, color marketing, color perception, psychological effects of color, color in branding, cultural color meanings, color symbolism"
      canonicalPath="/guides/color-psychology"
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      relatedLinks={relatedLinks}
      lastModified="2025-01-15"
    >
      <PageHeader
        badge="Psychology Guide"
        badgeIcon={Brain}
        title="Color Psychology: How Colors Affect Emotions"
        subtitle="Understand the psychological impact of colors and how to use them effectively in design and branding."
      />

      {/* Table of Contents */}
      <nav className="article-toc">
        <h2>Table of Contents</h2>
        <ol>
          <li><a href="#introduction">Introduction to Color Psychology</a></li>
          <li><a href="#color-meanings">Individual Color Meanings</a></li>
          <li><a href="#cultural">Cultural Considerations</a></li>
          <li><a href="#application">Applying Color Psychology</a></li>
        </ol>
      </nav>

      {/* Introduction */}
      <section id="introduction" className="article-section">
        <h2>Introduction to Color Psychology</h2>
        <p>
          Color psychology studies how colors affect human behavior and emotions. While some 
          responses to color are universal (like red increasing heart rate), many are learned 
          through cultural associations and personal experiences.
        </p>
        <p>
          Understanding color psychology helps designers make intentional choices that support 
          their message. A healthcare brand using calm blues communicates differently than one 
          using energetic oranges—both can be valid choices depending on positioning.
        </p>
        
        <div className="article-callout">
          <Heart size={20} />
          <div>
            <strong>Research shows:</strong> Up to 90% of snap judgments about products can be 
            based on color alone. Color can increase brand recognition by up to 80%.
          </div>
        </div>
      </section>

      {/* Color Meanings */}
      <section id="color-meanings" className="article-section">
        <h2>Individual Color Meanings</h2>
        <p>
          Each color carries distinct psychological associations. Here's a comprehensive 
          breakdown of major colors and their emotional impact.
        </p>

        <div className="color-meanings-list">
          {COLOR_MEANINGS.map((item) => (
            <div key={item.color} className="color-meaning-card" id={item.color.toLowerCase()}>
              <div className="color-meaning-header">
                <div 
                  className="color-meaning-swatch" 
                  style={{ backgroundColor: item.hex }}
                />
                <div>
                  <h3>{item.color}</h3>
                  <span className="color-hex">{item.hex}</span>
                </div>
              </div>
              
              <div className="color-emotions">
                {item.emotions.map((emotion, i) => (
                  <span key={i} className="emotion-tag">{emotion}</span>
                ))}
              </div>
              
              <div className="color-meaning-details">
                <p><strong>Positive associations:</strong> {item.positive}</p>
                <p><strong>Negative associations:</strong> {item.negative}</p>
                <p><strong>Common usage:</strong> {item.usage}</p>
                <p><strong>Famous brands:</strong> {item.brands.join(', ')}</p>
                <p><strong>Cultural note:</strong> {item.cultural}</p>
              </div>
              
              <Link to={item.palette} className="view-palette-link">
                View {item.color} Palette <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Cultural Considerations */}
      <section id="cultural" className="article-section">
        <h2>Cultural Considerations</h2>
        <p>
          Color meanings vary significantly across cultures. What's positive in one region 
          can be negative in another. For global brands, understanding these differences is crucial.
        </p>

        <div className="cultural-table">
          <table>
            <thead>
              <tr>
                <th>Color</th>
                <th>Western</th>
                <th>Eastern Asia</th>
                <th>Middle East</th>
                <th>Key Consideration</th>
              </tr>
            </thead>
            <tbody>
              {CULTURAL_CONSIDERATIONS.map((item) => (
                <tr key={item.color}>
                  <td><strong>{item.color}</strong></td>
                  <td>{item.western}</td>
                  <td>{item.eastern}</td>
                  <td>{item.middle_east}</td>
                  <td><em>{item.consideration}</em></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="article-callout">
          <Globe size={20} />
          <div>
            <strong>Tip:</strong> When designing for international audiences, research 
            color meanings in your target markets and consider using culturally neutral 
            colors like blue, which has positive associations worldwide.
          </div>
        </div>
      </section>

      {/* Application */}
      <section id="application" className="article-section">
        <h2>Applying Color Psychology</h2>
        
        <h3>For Conversions & CTAs</h3>
        <p>
          High-contrast colors like red, orange, and green typically perform well for 
          call-to-action buttons. However, the best color is often one that stands out 
          from your existing palette rather than a universally "best" color.
        </p>

        <h3>For Trust & Credibility</h3>
        <p>
          Blue is the most commonly used color for conveying trust and professionalism. 
          Financial institutions, healthcare, and technology companies frequently use blue 
          to establish credibility.
        </p>

        <h3>For Energy & Urgency</h3>
        <p>
          Warm colors (red, orange, yellow) create energy and urgency. They're effective 
          for sales, limited-time offers, and brands wanting to appear dynamic and exciting.
        </p>

        <h3>For Calm & Wellness</h3>
        <p>
          Cool colors (blue, green, purple) and desaturated tones create calm, peaceful 
          atmospheres. Ideal for healthcare, wellness, and relaxation-focused brands.
        </p>

        <p>
          Explore color palettes organized by mood in our{' '}
          <Link to="/explore">palette directory</Link>:
        </p>
        <ul>
          <li><Link to="/palettes/mood/warm">Warm palettes</Link> for energy and excitement</li>
          <li><Link to="/palettes/mood/cool">Cool palettes</Link> for calm and trust</li>
          <li><Link to="/palettes/mood/vibrant">Vibrant palettes</Link> for attention</li>
          <li><Link to="/palettes/mood/muted">Muted palettes</Link> for sophistication</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="article-cta">
        <h2>Create Psychologically Effective Palettes</h2>
        <p>
          Use our palette generator with mood presets to create colors that evoke the right emotions.
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
          <Link to="/guides/brand-color-palette" className="related-article-card">
            <h3>Brand Colors</h3>
            <p>Apply psychology to your brand identity.</p>
          </Link>
          <Link to="/guides/color-theory" className="related-article-card">
            <h3>Color Theory</h3>
            <p>Create harmonious color combinations.</p>
          </Link>
          <Link to="/guides/web-design-colors" className="related-article-card">
            <h3>Web Design Colors</h3>
            <p>Best practices for digital color usage.</p>
          </Link>
        </div>
      </section>
    </SEOArticleLayout>
  );
}

export default ColorPsychologyGuide;