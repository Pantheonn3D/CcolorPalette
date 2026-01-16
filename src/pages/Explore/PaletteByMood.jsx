// src/pages/Explore/PaletteByMood.jsx
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Palette, 
  ArrowRight, 
  Sparkles,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { SiteHeader, SiteFooter, Breadcrumbs } from '../../components/SEOLayout';
import { hexToHsl } from '../../utils/colorUtils';
import GENERATED_PALETTES from '../../data/generated-palettes.json';

const MOOD_DATA = {
  vibrant: {
    name: 'Vibrant',
    description: 'Bold, saturated colors that demand attention. Vibrant palettes are energetic, exciting, and memorable. Perfect for brands that want to stand out and make a strong visual impact.',
    characteristics: 'High saturation (60%+), medium-high lightness, bold contrasts',
    useCases: ['Youth brands', 'Sports & fitness', 'Entertainment', 'Food & beverage', 'Event marketing'],
    filter: (hsl) => hsl.s > 60 && hsl.l > 35 && hsl.l < 75,
    relatedMoods: ['bright', 'playful', 'neon'],
    psychology: 'Vibrant colors increase arousal and energy levels. They\'re attention-grabbing and convey confidence and excitement.'
  },
  pastel: {
    name: 'Pastel',
    description: 'Soft, light colors with low saturation. Pastel palettes feel gentle, approachable, and calming. Ideal for wellness brands, baby products, and feminine aesthetics.',
    characteristics: 'Low-medium saturation (20-50%), high lightness (70%+)',
    useCases: ['Baby products', 'Wellness & spa', 'Wedding planning', 'Bakeries', 'Fashion'],
    filter: (hsl) => hsl.s < 55 && hsl.l > 70,
    relatedMoods: ['soft', 'elegant', 'warm'],
    psychology: 'Pastels have a calming effect and are perceived as non-threatening. They evoke nostalgia, tenderness, and comfort.'
  },
  muted: {
    name: 'Muted',
    description: 'Desaturated, sophisticated colors. Muted palettes feel mature, refined, and timeless. Perfect for luxury brands, professional services, and editorial design.',
    characteristics: 'Low saturation (under 40%), varied lightness, subtle contrasts',
    useCases: ['Luxury brands', 'Professional services', 'Editorial', 'Art galleries', 'Architecture'],
    filter: (hsl) => hsl.s < 40 && hsl.l > 25 && hsl.l < 75,
    relatedMoods: ['elegant', 'earthy', 'dark'],
    psychology: 'Muted colors convey sophistication and restraint. They\'re perceived as more timeless and less trendy than saturated alternatives.'
  },
  dark: {
    name: 'Dark Mode',
    description: 'Deep, rich colors with low lightness. Dark palettes are dramatic, powerful, and modern. Ideal for tech products, gaming, nightlife, and premium brands.',
    characteristics: 'Low lightness (under 35%), varied saturation, high contrast with light accents',
    useCases: ['Technology', 'Gaming', 'Nightclubs', 'Premium brands', 'Cinema'],
    filter: (hsl) => hsl.l < 40,
    relatedMoods: ['moody', 'elegant', 'muted'],
    psychology: 'Dark colors convey power, elegance, and mystery. They create focus and reduce eye strain in digital interfaces.'
  },
  warm: {
    name: 'Warm',
    description: 'Reds, oranges, and yellows that evoke warmth and energy. Warm palettes feel inviting, comfortable, and stimulating. Great for food, hospitality, and community brands.',
    characteristics: 'Hues from 0° to 60° (red through yellow), varied saturation and lightness',
    useCases: ['Restaurants', 'Hospitality', 'Community organizations', 'Autumn campaigns', 'Home & living'],
    filter: (hsl) => (hsl.h >= 0 && hsl.h <= 60) || hsl.h >= 340,
    relatedMoods: ['vibrant', 'earthy', 'playful'],
    psychology: 'Warm colors increase heart rate and create urgency. They\'re associated with energy, passion, and comfort.'
  },
  cool: {
    name: 'Cool',
    description: 'Blues, greens, and purples that evoke calm and professionalism. Cool palettes feel trustworthy, peaceful, and refreshing. Perfect for healthcare, finance, and tech.',
    characteristics: 'Hues from 170° to 280° (cyan through purple), clean and refreshing feel',
    useCases: ['Healthcare', 'Finance', 'Technology', 'Environmental', 'Professional services'],
    filter: (hsl) => hsl.h >= 170 && hsl.h <= 280,
    relatedMoods: ['muted', 'elegant', 'dark'],
    psychology: 'Cool colors lower heart rate and create calm. They\'re associated with trust, stability, and professionalism.'
  },
  earthy: {
    name: 'Earthy',
    description: 'Natural browns, greens, and terracotta tones. Earthy palettes feel organic, grounded, and sustainable. Ideal for outdoor brands, organic products, and eco-friendly businesses.',
    characteristics: 'Browns, olive greens, terracotta, muted oranges; low-medium saturation',
    useCases: ['Organic products', 'Outdoor brands', 'Sustainable businesses', 'Coffee shops', 'Furniture'],
    filter: (hsl) => (hsl.h >= 20 && hsl.h <= 120) && hsl.s < 60 && hsl.l < 65,
    relatedMoods: ['warm', 'muted', 'natural'],
    psychology: 'Earthy colors ground us and connect to nature. They convey authenticity, reliability, and environmental consciousness.'
  },
  elegant: {
    name: 'Elegant',
    description: 'Sophisticated, refined color combinations. Elegant palettes are timeless, luxurious, and polished. Perfect for high-end brands, fashion, and premium services.',
    characteristics: 'Balanced saturation, often includes neutrals, classic color combinations',
    useCases: ['Luxury brands', 'Fashion', 'Jewelry', 'Fine dining', 'Premium services'],
    filter: (hsl) => hsl.s >= 20 && hsl.s <= 60 && hsl.l >= 25 && hsl.l <= 70,
    relatedMoods: ['muted', 'dark', 'cool'],
    psychology: 'Elegant colors convey quality and exclusivity. They suggest taste, refinement, and attention to detail.'
  },
  playful: {
    name: 'Playful',
    description: 'Fun, energetic colors that inspire creativity and joy. Playful palettes are cheerful, imaginative, and youthful. Great for children\'s brands, games, and creative agencies.',
    characteristics: 'High saturation, varied hues, often includes multiple bright colors',
    useCases: ['Children\'s products', 'Games & toys', 'Creative agencies', 'Party supplies', 'Education'],
    filter: (hsl) => hsl.s > 50 && hsl.l > 45 && hsl.l < 80,
    relatedMoods: ['vibrant', 'warm', 'bright'],
    psychology: 'Playful colors stimulate creativity and positive emotions. They\'re associated with fun, youth, and imagination.'
  },
  bright: {
    name: 'Bright',
    description: 'High-luminosity colors that feel fresh and energetic. Bright palettes are optimistic, clean, and modern. Ideal for health, technology, and lifestyle brands.',
    characteristics: 'High lightness (65%+), medium-high saturation, clean and airy feel',
    useCases: ['Health & fitness', 'Technology', 'Lifestyle brands', 'Summer campaigns', 'Clean beauty'],
    filter: (hsl) => hsl.l > 65 && hsl.s > 35,
    relatedMoods: ['pastel', 'vibrant', 'playful'],
    psychology: 'Bright colors convey optimism and clarity. They\'re perceived as fresh, clean, and forward-thinking.'
  },
  moody: {
    name: 'Moody',
    description: 'Deep, atmospheric colors with emotional depth. Moody palettes are dramatic, artistic, and evocative. Perfect for editorial, cinema, and brands with strong personality.',
    characteristics: 'Low-medium lightness, rich undertones, dramatic contrasts',
    useCases: ['Editorial', 'Cinema & film', 'Art & photography', 'Music industry', 'Fashion'],
    filter: (hsl) => hsl.l < 50 && hsl.l > 15,
    relatedMoods: ['dark', 'elegant', 'muted'],
    psychology: 'Moody colors create emotional depth and intrigue. They suggest complexity, artistry, and sophistication.'
  },
  neon: {
    name: 'Neon',
    description: 'Electric, high-intensity colors that glow. Neon palettes are bold, futuristic, and attention-demanding. Great for nightlife, gaming, and brands targeting young audiences.',
    characteristics: 'Maximum saturation, medium-high lightness, electric quality',
    useCases: ['Nightlife', 'Gaming', 'Music festivals', 'Streetwear', 'Youth marketing'],
    filter: (hsl) => hsl.s > 80 && hsl.l > 45 && hsl.l < 75,
    relatedMoods: ['vibrant', 'playful', 'dark'],
    psychology: 'Neon colors demand attention and create excitement. They\'re associated with nightlife, technology, and rebellion.'
  },
  retro: {
    name: 'Retro',
    description: 'Vintage-inspired colors with nostalgic appeal. Retro palettes feel warm, familiar, and distinctive. Perfect for brands leveraging nostalgia or vintage aesthetics.',
    characteristics: 'Slightly desaturated, warm undertones, 70s/80s inspired',
    useCases: ['Vintage brands', 'Diners & cafes', 'Music & vinyl', 'Craft products', 'Heritage brands'],
    filter: (hsl) => hsl.s >= 30 && hsl.s <= 70 && hsl.l >= 35 && hsl.l <= 65,
    relatedMoods: ['warm', 'earthy', 'muted'],
    psychology: 'Retro colors trigger nostalgia and positive memories. They convey authenticity, craftsmanship, and timelessness.'
  },
  soft: {
    name: 'Soft',
    description: 'Gentle, understated colors that feel calm and approachable. Soft palettes are soothing, friendly, and unobtrusive. Ideal for wellness, meditation, and comfort-focused brands.',
    characteristics: 'Low-medium saturation, medium-high lightness, gentle transitions',
    useCases: ['Wellness & meditation', 'Skincare', 'Baby products', 'Sleep products', 'Comfort brands'],
    filter: (hsl) => hsl.s < 50 && hsl.l > 60,
    relatedMoods: ['pastel', 'elegant', 'muted'],
    psychology: 'Soft colors reduce stress and create comfort. They\'re perceived as non-threatening, gentle, and nurturing.'
  }
};

// Convert hex string to HSL
const getHslFromHex = (hex) => {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
    h *= 360;
  }
  
  return { h, s: s * 100, l: l * 100 };
};

function PaletteByMood() {
  const { mood } = useParams();
  const moodData = MOOD_DATA[mood?.toLowerCase()];

  const matchingPalettes = useMemo(() => {
    if (!moodData) return [];
    
    return GENERATED_PALETTES.filter(paletteString => {
      const colors = paletteString.split('-');
      // Check if majority of colors match the mood filter
      const matchCount = colors.filter(hex => {
        const hsl = getHslFromHex(hex);
        return moodData.filter(hsl);
      }).length;
      return matchCount >= Math.ceil(colors.length / 2);
    }).slice(0, 100);
  }, [moodData]);

  if (!moodData) {
    return (
      <div className="palette-by-mood-page">
        <SiteHeader />
        <main className="not-found-content">
          <h1>Mood Not Found</h1>
          <p>Try one of these moods:</p>
          <div className="mood-links">
            {Object.keys(MOOD_DATA).map(m => (
              <Link key={m} to={`/palettes/mood/${m}`}>
                {MOOD_DATA[m].name}
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
    "name": `${moodData.name} Color Palettes`,
    "description": moodData.description,
    "url": `https://ccolorpalette.com/palettes/mood/${mood}`,
    "numberOfItems": matchingPalettes.length
  };

  const breadcrumbs = [
    { label: 'Home', href: '/home' },
    { label: 'Explore', href: '/explore' },
    { label: `${moodData.name} Palettes` }
  ];

  return (
    <div className="palette-by-mood-page">
      <Helmet>
      <title>{`${moodData.name} Color Palettes - ${matchingPalettes.length}+ ${moodData.name} Color Schemes | CColorPalette`}</title>
        <meta 
          name="description" 
          content={`Browse ${matchingPalettes.length}+ ${moodData.name.toLowerCase()} color palettes. ${moodData.description.slice(0, 100)}...`} 
        />
        <meta 
          name="keywords" 
          content={`${moodData.name.toLowerCase()} color palette, ${moodData.name.toLowerCase()} colors, ${moodData.name.toLowerCase()} color scheme, ${moodData.name.toLowerCase()} aesthetic, ${moodData.name.toLowerCase()} design colors`} 
        />
        <link rel="canonical" href={`https://ccolorpalette.com/palettes/mood/${mood}`} />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <SiteHeader />

      <main className="mood-page-main">
        <div className="mood-page-breadcrumbs">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Hero */}
        <header className="mood-page-hero">
          <span className="hero-badge">
            <Sparkles size={14} />
            {matchingPalettes.length}+ Palettes
          </span>
          <h1>{moodData.name} Color Palettes</h1>
          <p>{moodData.description}</p>
        </header>

        <div className="mood-page-content">
          {/* Sidebar */}
          <aside className="mood-page-sidebar">
            <div className="sidebar-section">
              <h3>Characteristics</h3>
              <p>{moodData.characteristics}</p>
            </div>

            <div className="sidebar-section">
              <h3>Best Used For</h3>
              <ul>
                {moodData.useCases.map((useCase, i) => (
                  <li key={i}>{useCase}</li>
                ))}
              </ul>
            </div>

            <div className="sidebar-section">
              <h3>Psychology</h3>
              <p>{moodData.psychology}</p>
              <Link to="/guides/color-psychology" className="sidebar-link">
                Learn more about color psychology <ChevronRight size={14} />
              </Link>
            </div>

            <div className="sidebar-section">
              <h3>Related Moods</h3>
              <div className="related-moods">
                {moodData.relatedMoods.map(m => (
                  <Link key={m} to={`/palettes/mood/${m}`} className="mood-tag">
                    {MOOD_DATA[m]?.name || m}
                  </Link>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Browse Other Moods</h3>
              <div className="other-moods-grid">
                {Object.keys(MOOD_DATA).filter(m => m !== mood).slice(0, 8).map(m => (
                  <Link key={m} to={`/palettes/mood/${m}`} className="other-mood-link">
                    {MOOD_DATA[m].name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Palette Grid */}
          <section className="palettes-section">
            <h2>{matchingPalettes.length} {moodData.name} Palettes</h2>
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
                  <Link to="/">generate custom {moodData.name.toLowerCase()} palettes</Link>.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* SEO Content */}
        <section className="mood-page-seo">
          <h2>About {moodData.name} Color Palettes</h2>
          <p>
            {moodData.name} color palettes are characterized by {moodData.characteristics.toLowerCase()}. 
            These colors are ideal for {moodData.useCases.slice(0, 3).join(', ').toLowerCase()} and similar applications.
          </p>
          <p>
            Create your own {moodData.name.toLowerCase()} palette using our{' '}
            <Link to="/">color palette generator</Link> with the "{moodData.name}" mood preset. 
            Each generated palette follows <Link to="/guides/color-theory">color theory principles</Link>{' '}
            to ensure visual harmony.
          </p>
          
          <div className="seo-internal-links">
            <h3>Related Resources</h3>
            <ul>
              <li><Link to="/guides/color-psychology">Color Psychology Guide</Link></li>
              <li><Link to="/guides/color-theory">Color Theory Fundamentals</Link></li>
              <li><Link to="/guides/brand-color-palette">Creating Brand Palettes</Link></li>
              <li><Link to="/explore">Browse All Palettes</Link></li>
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default PaletteByMood;