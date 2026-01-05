import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/Frame4ico.png';
import {
  // Only import icons we actually use
  Sparkles,
  Zap,
  Palette,
  Lock,
  Download,
  Eye,
  Accessibility,
  Share2,
  History,
  Shuffle,
  Code,
  FileCode,
  Image,
  Braces,
  Wind,
  Copy,
  Check,
  ArrowRight,
  ArrowDown,
  Globe,
  Paintbrush,
  Smartphone,
  Megaphone,
  Home,
  Camera,
  Film,
  BarChart3,
  Gamepad2,
  ShoppingBag,
  BookOpen,
  GraduationCap,
  Move,
  Plus,
  Sliders,
  Blend,
  CircleDot,
  Layers,
  Contrast,
  Triangle,
  GitBranch,
  Keyboard,
  ChevronDown,
  CheckCircle,
  XCircle,
  Link2,
  Menu,
  X,
  ExternalLink,
  SwatchBook,
} from 'lucide-react';
import './LandingPage.css';

// FAQ Data
const FAQ_DATA = [
  {
    question: "What is CColorPalette and how does it work?",
    answer: "CColorPalette is a free online color palette generator that creates beautiful, harmonious color schemes instantly. Simply press spacebar or tap the generate button to create a new palette. The tool uses advanced color theory algorithms to ensure every palette is visually appealing and professionally balanced. You can lock colors you like, adjust individual shades, check accessibility compliance, and export to CSS, Tailwind, JSON, SVG, PNG, and more."
  },
  {
    question: "How do I generate a new color palette?",
    answer: "Generating a new palette is incredibly simple. On desktop, press the spacebar anywhere on the page. On mobile, tap the 'Tap to generate' button at the top of the screen. Each press creates a completely new, harmonious color combination. If you find colors you like, click the lock icon to keep them while regenerating the rest."
  },
  {
    question: "Can I customize the color generation method?",
    answer: "Yes! Open the Method panel to choose from six harmony modes: Auto (random harmony), Monochromatic (single hue variations), Analogous (adjacent hues), Complementary (opposite hues), Split Complementary (opposite + adjacent), and Triadic (three-way split). You can also set mood preferences (Pastel, Vibrant, Muted, Dark) and adjust contrast requirements."
  },
  {
    question: "What export formats does CColorPalette support?",
    answer: "CColorPalette supports comprehensive export options: CSS Custom Properties (variables), Tailwind CSS configuration, SCSS variables and maps, JSON with full metadata, JavaScript objects, SVG vector graphics, and PNG images optimized for social media sharing. Each format includes proper naming conventions and can be customized before export."
  },
  {
    question: "Is CColorPalette free to use?",
    answer: "Yes, CColorPalette is completely free to use with no signup required. All features including palette generation, accessibility checking, export options, and URL sharing are available at no cost. We believe professional color tools should be accessible to everyone."
  },
  {
    question: "How does the accessibility checker work?",
    answer: "The accessibility panel shows WCAG 2.1 contrast ratios for text on each color against both black and white backgrounds. It displays pass/fail badges for AA and AAA compliance levels. It also shows contrast ratios between adjacent colors in your palette. Additionally, you can simulate how your palette appears to people with different types of color blindness including Protanopia, Deuteranopia, Tritanopia, and Achromatopsia."
  },
  {
    question: "Can I save and share my color palettes?",
    answer: "Absolutely! Every palette has a unique URL that encodes all your colors. Simply bookmark the page or copy the URL to save your work. You can share this URL with anyone, and they'll see your exact palette. The URL format is clean and readable, using hex codes separated by dashes (e.g., /A1B2C3-D4E5F6-...)."
  },
  {
    question: "How do I adjust a specific color in my palette?",
    answer: "Click the shade picker icon (SwatchBook) on any color to reveal a range of lighter and darker variations. Hover or tap to preview shades, then click to select. This lets you fine-tune individual colors while maintaining harmony with the rest of your palette."
  },
  {
    question: "Can I reorder colors in my palette?",
    answer: "Yes! Use the drag handle (arrows icon) on any color to drag and drop it to a new position. On mobile, simply drag colors up or down. The palette URL updates automatically to reflect the new order."
  },
  {
    question: "What color spaces does CColorPalette use?",
    answer: "CColorPalette generates colors using HSL (Hue, Saturation, Lightness) for optimal harmony while providing exports in HEX, RGB, HSL, and OKLCH formats. The internal algorithms apply vibrancy corrections to avoid muddy colors and ensure perceptually pleasing results across all hue ranges."
  },
  {
    question: "How many colors can I have in a palette?",
    answer: "Palettes support 2 to 8 colors. Start with the default 5 colors, then use the + buttons between colors to add more, or the X button on individual colors to remove them. The minimum is 2 colors to maintain a functional palette."
  },
  {
    question: "Does CColorPalette work offline?",
    answer: "CColorPalette is a web application that works entirely in your browser. While you need an internet connection to load the page initially, the color generation and all features work client-side, meaning the app remains responsive even with a slow connection."
  },
  {
    question: "Can I use CColorPalette for commercial projects?",
    answer: "Yes! All palettes generated with CColorPalette can be used freely in personal and commercial projects without attribution. The colors you create are yours to use however you like."
  },
  {
    question: "What makes CColorPalette different from other color tools?",
    answer: "CColorPalette combines instant generation (just press spacebar) with professional features: multiple harmony modes, accessibility checking, color blindness simulation, shade picking, and comprehensive export options. The URL-based saving means no accounts or logins needed. The interface is clean and distraction-free, letting you focus on finding the perfect colors."
  },
  {
    question: "How does the undo/redo feature work?",
    answer: "CColorPalette maintains a history of up to 50 palette states. Use Ctrl+Z (or Cmd+Z on Mac) to undo, and Ctrl+Y (or Cmd+Shift+Z) to redo. You can also open the History panel to see visual thumbnails of all your previous palettes and click any to restore it."
  },
];

// Color theory content sections
const COLOR_THEORY_SECTIONS = [
  {
    id: 'harmony',
    icon: Blend,
    title: 'Color Harmony',
    subtitle: 'The Science of Colors That Work Together',
    content: `Color harmony refers to the pleasing arrangement of colors that creates a sense of order and aesthetic appeal. When colors are harmonious, they create visual coherence and balance that feels natural to the human eye.

The foundation of color harmony lies in the color wheel, a circular diagram that shows relationships between colors. Colors positioned in specific geometric relationships on the wheel naturally complement each other, creating different types of harmonies that evoke distinct emotional responses.`
  },
  {
    id: 'monochromatic',
    icon: CircleDot,
    title: 'Monochromatic Harmony',
    subtitle: 'Variations of a Single Hue',
    content: `Monochromatic color schemes use variations of a single hue, created by adjusting saturation and lightness values. This approach guarantees harmony because all colors share the same base hue.

Monochromatic palettes are elegant, sophisticated, and easy to create. They work exceptionally well for minimalist designs, text-heavy layouts, and brands seeking a refined, understated aesthetic.`
  },
  {
    id: 'analogous',
    icon: Layers,
    title: 'Analogous Harmony',
    subtitle: 'Adjacent Colors on the Wheel',
    content: `Analogous color schemes combine colors that sit next to each other on the color wheel, typically spanning 60-90 degrees. These combinations feel natural and organic because they're often found together in nature.

The key to successful analogous palettes is choosing one dominant color and using the others as accents. This creates depth and richness while maintaining harmony.`
  },
  {
    id: 'complementary',
    icon: Contrast,
    title: 'Complementary Harmony',
    subtitle: 'Opposite Colors Create Energy',
    content: `Complementary colors sit directly opposite each other on the color wheel, creating maximum contrast and visual tension. When placed side by side, they intensify each other, making both appear more vibrant.

This high contrast makes complementary schemes attention-grabbing and energetic. They're excellent for call-to-action elements, sports branding, and any design that needs to stand out.`
  },
  {
    id: 'triadic',
    icon: Triangle,
    title: 'Triadic Harmony',
    subtitle: 'Three Colors in Perfect Balance',
    content: `Triadic color schemes use three colors equally spaced around the color wheel, forming an equilateral triangle. This creates a balanced yet vibrant palette with more variety than analogous schemes.

Triadic palettes are playful, rich, and visually stimulating. They work well for children's products, creative industries, and designs requiring diverse color options.`
  },
  {
    id: 'split-complementary',
    icon: GitBranch,
    title: 'Split Complementary',
    subtitle: 'Contrast with More Flexibility',
    content: `Split complementary schemes take one base color and pair it with the two colors adjacent to its complement. This provides the visual interest of complementary contrast with more nuance.

This approach is often considered the best of both worlds—it offers contrast without the intense tension of pure complementary colors.`
  },
];

// Use case data
const USE_CASES = [
  {
    icon: Globe,
    title: 'Web Design',
    description: 'Create cohesive color systems for websites. Export directly to CSS variables or Tailwind configuration.',
  },
  {
    icon: Paintbrush,
    title: 'Brand Identity',
    description: 'Develop distinctive brand color palettes that communicate your values and resonate with your audience.',
  },
  {
    icon: Smartphone,
    title: 'App Design',
    description: 'Design accessible, engaging color schemes for iOS, Android, and cross-platform applications.',
  },
  {
    icon: Megaphone,
    title: 'Marketing',
    description: 'Create eye-catching palettes for social media graphics, advertisements, and promotional content.',
  },
  {
    icon: Home,
    title: 'Interior Design',
    description: 'Explore color combinations for rooms, furniture, and decor. Visualize before committing.',
  },
  {
    icon: Camera,
    title: 'Photography',
    description: 'Develop color grading presets and plan styled shoots with harmonious background palettes.',
  },
  {
    icon: Film,
    title: 'Video & Film',
    description: 'Create color scripts for video production, motion graphics, and film color correction.',
  },
  {
    icon: BarChart3,
    title: 'Data Visualization',
    description: 'Generate accessible, distinguishable color scales for charts, graphs, and infographics.',
  },
  {
    icon: Gamepad2,
    title: 'Game Design',
    description: 'Design immersive game palettes for environments, characters, and UI elements.',
  },
  {
    icon: ShoppingBag,
    title: 'E-commerce',
    description: 'Create product photography backgrounds and seasonal promotional color themes.',
  },
  {
    icon: BookOpen,
    title: 'Publishing',
    description: 'Develop consistent color schemes for books, magazines, and digital publications.',
  },
  {
    icon: GraduationCap,
    title: 'Education',
    description: 'Create engaging, accessible palettes for educational materials and e-learning platforms.',
  },
];

// Feature data
const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Generation',
    description: 'Press spacebar to generate beautiful color palettes instantly. No waiting, no complexity.',
  },
  {
    icon: Lock,
    title: 'Lock Colors',
    description: 'Found a color you love? Lock it in place while regenerating the rest of your palette.',
  },
  {
    icon: SwatchBook,
    title: 'Shade Picker',
    description: 'Fine-tune any color with the shade picker. Choose from 20 lighter and darker variations.',
  },
  {
    icon: Accessibility,
    title: 'Accessibility Checker',
    description: 'Check WCAG contrast ratios instantly. Ensure your palettes work for everyone.',
  },
  {
    icon: Eye,
    title: 'Color Blindness Simulation',
    description: 'Preview how your palette appears to people with different types of color vision.',
  },
  {
    icon: Sparkles,
    title: 'Harmony Modes',
    description: 'Choose from 6 color harmony modes: Auto, Monochromatic, Analogous, Complementary, Split, Triadic.',
  },
  {
    icon: Download,
    title: 'Export Anywhere',
    description: 'Export to CSS, Tailwind, SCSS, JSON, JavaScript, SVG, and PNG formats.',
  },
  {
    icon: Share2,
    title: 'URL Sharing',
    description: 'Every palette has a unique URL. Share or bookmark to save your work instantly.',
  },
  {
    icon: History,
    title: 'History & Undo',
    description: 'Browse up to 50 previous palettes. Undo and redo with keyboard shortcuts.',
  },
  {
    icon: Move,
    title: 'Drag to Reorder',
    description: 'Drag and drop colors to rearrange them in any order you prefer.',
  },
  {
    icon: Plus,
    title: 'Add & Remove Colors',
    description: 'Create palettes with 2 to 8 colors. Add bridge colors between existing ones.',
  },
  {
    icon: Sliders,
    title: 'Mood Controls',
    description: 'Set mood preferences: Pastel, Vibrant, Muted, or Dark. Control minimum contrast.',
  },
];

// Export formats data
const EXPORT_FORMATS = [
  {
    icon: FileCode,
    title: 'CSS Variables',
    description: 'Export as CSS custom properties ready for your stylesheets.',
    example: `:root {\n  --color-1: #E63946;\n  --color-2: #F1FAEE;\n}`,
  },
  {
    icon: Wind,
    title: 'Tailwind CSS',
    description: 'Generate Tailwind config or @layer base declarations.',
    example: `colors: {\n  'primary': '#E63946',\n  'secondary': '#F1FAEE',\n}`,
  },
  {
    icon: Code,
    title: 'SCSS Variables',
    description: 'Export as SCSS variables and maps for Sass projects.',
    example: `$primary: #E63946;\n$secondary: #F1FAEE;`,
  },
  {
    icon: Braces,
    title: 'JSON',
    description: 'Full metadata export with hex, RGB, HSL values.',
    example: `{\n  "palette": [\n    {"hex": "#E63946"}\n  ]\n}`,
  },
  {
    icon: FileCode,
    title: 'JavaScript',
    description: 'Export as a JavaScript object for your codebase.',
    example: `const palette = {\n  primary: '#E63946',\n};`,
  },
  {
    icon: Image,
    title: 'PNG Image',
    description: 'Download as a 1200x630 PNG for social sharing.',
    example: null,
  },
  {
    icon: FileCode,
    title: 'SVG Graphic',
    description: 'Vector graphic for Figma, Sketch, or Illustrator.',
    example: null,
  },
  {
    icon: Link2,
    title: 'URL Link',
    description: 'Copy the palette URL to share or bookmark.',
    example: null,
  },
];

// Competitor comparison
const COMPARISONS = [
  { feature: 'Instant spacebar generation', ccolorpalette: true, coolors: true, adobe: false, paletton: false },
  { feature: 'No account required', ccolorpalette: true, coolors: true, adobe: false, paletton: true },
  { feature: 'URL-based palette saving', ccolorpalette: true, coolors: true, adobe: false, paletton: false },
  { feature: 'Color blindness simulation', ccolorpalette: true, coolors: true, adobe: false, paletton: false },
  { feature: 'WCAG contrast checking', ccolorpalette: true, coolors: true, adobe: false, paletton: false },
  { feature: 'Tailwind CSS export', ccolorpalette: true, coolors: false, adobe: false, paletton: false },
  { feature: 'Shade/tint picker', ccolorpalette: true, coolors: true, adobe: false, paletton: true },
  { feature: 'Harmony mode selection', ccolorpalette: true, coolors: false, adobe: true, paletton: true },
  { feature: 'Mobile-optimized UI', ccolorpalette: true, coolors: true, adobe: false, paletton: false },
  { feature: 'Completely free', ccolorpalette: true, coolors: false, adobe: false, paletton: true },
];

// SEO content sections with icons
const SEO_SECTIONS = [
  {
    icon: Palette,
    title: 'What is a Color Palette Generator?',
    content: 'A color palette generator is a tool that creates coordinated sets of colors that work well together. These tools use color theory principles—like complementary, analogous, and triadic harmonies—to produce combinations that are visually pleasing and professionally balanced. Color palette generators save hours of manual experimentation and help ensure consistent, cohesive designs.',
  },
  {
    icon: Zap,
    title: 'Why Use CColorPalette?',
    content: 'CColorPalette stands out from alternatives like Coolors, Adobe Color, and Paletton by combining speed, simplicity, and professional features. With instant spacebar generation, no account requirements, comprehensive accessibility checking, and exports to CSS, Tailwind, JSON, and image formats, CColorPalette provides everything you need without unnecessary complexity.',
  },
  {
    icon: Sparkles,
    title: 'Color Palette Generation Methods',
    content: 'The tool supports six harmony modes: Auto randomly selects a harmony for variety, Monochromatic creates variations of a single hue, Analogous uses adjacent colors on the color wheel, Complementary pairs opposite colors for maximum contrast, Split Complementary offers balanced contrast with more flexibility, and Triadic distributes three colors evenly around the wheel.',
  },
  {
    icon: Accessibility,
    title: 'Accessibility and Color Blindness',
    content: 'Creating accessible color palettes is essential for inclusive design. CColorPalette includes built-in WCAG contrast checking that instantly calculates contrast ratios and displays pass/fail badges for AA and AAA compliance. The color blindness simulator lets you preview how your palette appears to people with Protanopia, Deuteranopia, Tritanopia, and Achromatopsia.',
  },
  {
    icon: Code,
    title: 'Export Formats for Developers',
    content: 'CColorPalette exports to formats that integrate directly into your workflow. CSS Custom Properties can be dropped into any stylesheet. Tailwind CSS configuration generates ready-to-use color definitions. SCSS exports include both individual variables and palette maps. JSON exports contain full metadata including hex, RGB, and HSL values.',
  },
  {
    icon: Link2,
    title: 'URL-Based Palette Saving',
    content: 'Every palette generates a unique URL that encodes all your colors. The format is human-readable, using hex codes separated by dashes (e.g., /E63946-F1FAEE-A8DADC). This means you can bookmark palettes, share them via any medium, and return to your exact colors without creating an account.',
  },
];

// Stats
const STATS = [
  { value: '∞', label: 'Possible Palettes' },
  { value: '8', label: 'Max Colors' },
  { value: '6', label: 'Harmony Modes' },
  { value: '8', label: 'Export Formats' },
];

// Navigation links
const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#export', label: 'Export' },
  { href: '#accessibility', label: 'Accessibility' },
  { href: '#faq', label: 'FAQ' },
];

const TRENDING_PALETTES = [
  "4E1730-992852-D8243A-DB8F7B-F2D7C7",
  "111F4B-2165A0-21A2D5-73D1E8-D9F4F2",
  "385214-76A219-A5E423-80AE4B-EFF4E6",
  "3E140F-74371F-D58F23-EEE08F-EFEFD2",
  "290E1A-9A276A-E32EB0-E696ED-ECD3F3",
  "144B24-249040-38CE94-F7E3F1-E2719D",
  "102A38-22978B-46D3C4-71E7C3-CDE9DB",
  "2A0F16-7F232C-E6253A-DE7E87-EECAD0",
  "310B12-A02821-DF5341-CCEBEC-7FD5DC",
  "335115-608F24-D2DC56-E3DC7B-F0EDD1",
  "102A18-289A5E-41D597-6CEADC-DAF1F5",
  "445018-7B9723-B8D94E-E3F09D-EAF2CE",
  "0E1D35-16629D-3EB2E1-8CE8E7-D9F5F4",
  "39121B-87204B-A72649-4CE0CD",
  "103C0F-2AA02C-78C57C-EDF7ED",
  "3C1112-6D301A-BB502A-D36327-E1B56F-E8DA8D-F9F7EB"
];

function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [copiedExample, setCopiedExample] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const copyExample = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedExample(index);
      setTimeout(() => setCopiedExample(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const scrollToSection = (href) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-container">
        <Link to="/" className="header-logo">
          <img src={logo} alt="CColorPalette" className="header-logo-img" />
          <span className="header-logo-text">CColorPalette</span>
        </Link>

          {/* Desktop Navigation */}
          <nav className="header-nav">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="header-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <button className="btn-primary btn-small" onClick={() => navigate('/')}>
              <Palette size={16} />
              <span>Open Generator</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="mobile-nav">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="mobile-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
              >
                {link.label}
              </a>
            ))}
            <button className="btn-primary btn-full" onClick={() => navigate('/')}>
              <Palette size={18} />
              <span>Open Generator</span>
            </button>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Free Color Palette Generator</span>
          </div>

          <h1 className="hero-title">
            Create Beautiful Color Palettes
            <span className="hero-title-accent"> in Seconds</span>
          </h1>

          <p className="hero-subtitle">
            The fastest way to generate harmonious color schemes for web design,
            branding, UI/UX, and creative projects. Press spacebar to generate.
            No signup required.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary btn-large" onClick={() => navigate('/')}>
              <Palette size={20} />
              <span>Open Generator</span>
            </button>
            <a href="#features" className="btn-secondary btn-large" onClick={(e) => { e.preventDefault(); scrollToSection('#features'); }}>
              <span>Learn More</span>
              <ArrowDown size={18} />
            </a>
          </div>

          <div className="hero-hint">
            <Keyboard size={16} />
            <span>Press <kbd>Space</kbd> to generate • <kbd>L</kbd> to lock • <kbd>Ctrl+Z</kbd> to undo</span>
          </div>
        </div>

        {/* Hero Screenshot */}
        <div className="hero-screenshot">
          <div className="screenshot-browser">
            <div className="browser-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="browser-url">ccolorpalette.com/E63946-F1FAEE-A8DADC-457B9D-1D3557</div>
          </div>
          <div className="screenshot-image">
            <div className="screenshot-placeholder">
              <div className="placeholder-colors">
                <div style={{ backgroundColor: '#E63946' }}></div>
                <div style={{ backgroundColor: '#F1FAEE' }}></div>
                <div style={{ backgroundColor: '#A8DADC' }}></div>
                <div style={{ backgroundColor: '#457B9D' }}></div>
                <div style={{ backgroundColor: '#1D3557' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-section">
        <div className="stats-container">
          {STATS.map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* === NEW: Trending Palettes Section === */}
      <section className="trending-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Inspiration</span>
            <h2 className="section-title">Trending Color Palettes</h2>
            <p className="section-subtitle">
              Hand-picked color combinations to jumpstart your next project.
            </p>
          </div>

          <div className="trending-grid">
            {TRENDING_PALETTES.map((paletteString, index) => {
              // Split the string into individual hex codes
              const colors = paletteString.split('-');
              
              return (
                <a 
                  key={index} 
                  href={`/${paletteString}`}
                  className="palette-card"
                  aria-label={`Open palette ${paletteString}`}
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
                  <div className="palette-info">
                    <span className="palette-name">#{colors[0]}</span>
                    <div className="palette-arrow">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
          
          <div className="cta-center" style={{ marginTop: 'var(--space-8)' }}>
             <a href="/explore" className="btn-secondary">Browse All Palettes</a>
          </div>
        </div>
      </section>
      {/* === END NEW SECTION === */}

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2 className="section-title">Everything You Need to Create Perfect Palettes</h2>
            <p className="section-subtitle">
              Professional color tools designed for speed and simplicity. No learning curve, no clutter, just colors.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon size={24} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">How It Works</span>
            <h2 className="section-title">Generate Palettes in Three Simple Steps</h2>
            <p className="section-subtitle">
              From inspiration to export in under 30 seconds. It's really that easy.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <Shuffle size={32} />
              </div>
              <h3 className="step-title">Generate</h3>
              <p className="step-description">
                Press spacebar or tap the generate button. A new harmonious palette appears instantly.
                Keep generating until you find colors that inspire you.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <Sliders size={32} />
              </div>
              <h3 className="step-title">Customize</h3>
              <p className="step-description">
                Lock colors you love, adjust shades, choose harmony modes, and fine-tune your palette.
                Drag to reorder. Add or remove colors as needed.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <Download size={32} />
              </div>
              <h3 className="step-title">Export</h3>
              <p className="step-description">
                Copy CSS, Tailwind config, JSON, or download as PNG/SVG. Share via URL or bookmark.
                Your palette is ready for any project.
              </p>
            </div>
          </div>

          <div className="cta-center">
            <button className="btn-primary btn-large" onClick={() => navigate('/')}>
              <Zap size={20} />
              <span>Try It Now — It's Free</span>
            </button>
          </div>
        </div>
      </section>

      {/* Export Formats Section */}
      <section id="export" className="export-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Export Formats</span>
            <h2 className="section-title">Export to Any Format You Need</h2>
            <p className="section-subtitle">
              From CSS variables to social media images, export your palette in the format that works for your workflow.
            </p>
          </div>

          <div className="export-grid">
            {EXPORT_FORMATS.map((format, index) => (
              <div key={index} className="export-card">
                <div className="export-header">
                  <div className="export-icon">
                    <format.icon size={20} />
                  </div>
                  <h3 className="export-title">{format.title}</h3>
                </div>
                <p className="export-description">{format.description}</p>
                {format.example && (
                  <div className="export-example">
                    <pre><code>{format.example}</code></pre>
                    <button
                      className="copy-btn"
                      onClick={() => copyExample(format.example, index)}
                      aria-label="Copy code"
                    >
                      {copiedExample === index ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Section */}
      <section id="accessibility" className="accessibility-section">
        <div className="section-container">
          <div className="a11y-content">
            <div className="a11y-text">
              <span className="section-badge">Accessibility</span>
              <h2 className="section-title">Design for Everyone</h2>
              <p className="section-subtitle">
                Built-in accessibility tools help you create palettes that work for all users,
                including those with color vision deficiencies.
              </p>

              <ul className="a11y-features">
                <li>
                  <CheckCircle size={20} />
                  <span><strong>WCAG Contrast Checking</strong> — Instant pass/fail ratings for text accessibility</span>
                </li>
                <li>
                  <CheckCircle size={20} />
                  <span><strong>Color Blindness Simulation</strong> — Preview Protanopia, Deuteranopia, Tritanopia, Achromatopsia</span>
                </li>
                <li>
                  <CheckCircle size={20} />
                  <span><strong>Adjacent Contrast</strong> — Ensure neighboring colors are distinguishable</span>
                </li>
                <li>
                  <CheckCircle size={20} />
                  <span><strong>AA & AAA Compliance</strong> — Meet international web accessibility standards</span>
                </li>
              </ul>

              <button className="btn-primary" onClick={() => navigate('/')}>
                <Eye size={20} />
                <span>Check Accessibility</span>
              </button>
            </div>

            <div className="a11y-visual">
              <div className="a11y-preview">
                <div className="a11y-panel-mock">
                  <div className="panel-mock-header">
                    <Eye size={16} />
                    <span>Accessibility</span>
                  </div>
                  <div className="contrast-mock">
                    <div className="contrast-item-mock">
                      <div className="swatch-mock" style={{ backgroundColor: '#E63946', color: '#fff' }}>Aa</div>
                      <div className="contrast-info-mock">
                        <span className="contrast-hex-mock">#E63946</span>
                        <span className="contrast-ratio-mock">4.5:1</span>
                      </div>
                      <div className="badge-mock pass">AA</div>
                    </div>
                    <div className="contrast-item-mock">
                      <div className="swatch-mock" style={{ backgroundColor: '#457B9D', color: '#fff' }}>Aa</div>
                      <div className="contrast-info-mock">
                        <span className="contrast-hex-mock">#457B9D</span>
                        <span className="contrast-ratio-mock">5.2:1</span>
                      </div>
                      <div className="badge-mock pass">AA</div>
                    </div>
                    <div className="contrast-item-mock">
                      <div className="swatch-mock" style={{ backgroundColor: '#1D3557', color: '#fff' }}>Aa</div>
                      <div className="contrast-info-mock">
                        <span className="contrast-hex-mock">#1D3557</span>
                        <span className="contrast-ratio-mock">12.8:1</span>
                      </div>
                      <div className="badge-mock pass">AAA</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Color Theory Section */}
      <section id="theory" className="theory-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Color Theory</span>
            <h2 className="section-title">Understanding Color Harmony</h2>
            <p className="section-subtitle">
              Learn the principles behind beautiful color combinations. CColorPalette applies these
              rules automatically, but understanding them helps you make better creative decisions.
            </p>
          </div>

          <div className="theory-grid">
            {COLOR_THEORY_SECTIONS.map((section) => (
              <div key={section.id} className="theory-card">
                <div className="theory-icon">
                  <section.icon size={24} />
                </div>
                <h3 className="theory-title">{section.title}</h3>
                <span className="theory-subtitle">{section.subtitle}</span>
                <p className="theory-content">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="use-cases-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Use Cases</span>
            <h2 className="section-title">Colors for Every Creative Project</h2>
            <p className="section-subtitle">
              Whether you're designing a website, building a brand, or decorating a room,
              CColorPalette helps you find the perfect colors.
            </p>
          </div>

          <div className="use-cases-grid">
            {USE_CASES.map((useCase, index) => (
              <div key={index} className="use-case-card">
                <div className="use-case-icon">
                  <useCase.icon size={24} />
                </div>
                <h3 className="use-case-title">{useCase.title}</h3>
                <p className="use-case-description">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="comparison-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Comparison</span>
            <h2 className="section-title">How CColorPalette Compares</h2>
            <p className="section-subtitle">
              See how we stack up against other popular color tools.
            </p>
          </div>

          <div className="comparison-table-wrapper">
            {/* Removed the scroll-hint divs - using CSS pseudo-elements instead */}
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>
                    <div className="table-brand ours">
                      <Palette size={16} />
                      CColorPalette
                    </div>
                  </th>
                  <th>Coolors</th>
                  <th>Adobe Color</th>
                  <th>Paletton</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map((row, index) => (
                  <tr key={index}>
                    <td className="feature-cell">{row.feature}</td>
                    <td>
                      {row.ccolorpalette ? (
                        <CheckCircle size={18} className="check-yes" />
                      ) : (
                        <XCircle size={18} className="check-no" />
                      )}
                    </td>
                    <td>
                      {row.coolors ? (
                        <CheckCircle size={18} className="check-yes" />
                      ) : (
                        <XCircle size={18} className="check-no" />
                      )}
                    </td>
                    <td>
                      {row.adobe ? (
                        <CheckCircle size={18} className="check-yes" />
                      ) : (
                        <XCircle size={18} className="check-no" />
                      )}
                    </td>
                    <td>
                      {row.paletton ? (
                        <CheckCircle size={18} className="check-yes" />
                      ) : (
                        <XCircle size={18} className="check-no" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">FAQ</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Everything you need to know about using CColorPalette.
            </p>
          </div>

          <div className="faq-list">
            {FAQ_DATA.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${openFaq === index ? 'open' : ''}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={20} className="faq-chevron" />
                </button>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content Section - Improved Layout */}
      <section className="seo-content-section">
        <div className="section-container">
          <div className="seo-header">
            <h2 className="seo-main-title">About CColorPalette: The Free Online Color Palette Generator</h2>
            <p className="seo-intro">
              CColorPalette is a free, browser-based color palette generator designed for designers, developers,
              artists, and anyone who works with color. Unlike traditional color pickers that require manual
              selection, CColorPalette generates complete, harmonious color schemes with a single keypress.
            </p>
          </div>

          <div className="seo-grid">
            {SEO_SECTIONS.map((section, index) => (
              <div key={index} className="seo-card">
                <div className="seo-card-icon">
                  <section.icon size={20} />
                </div>
                <h3 className="seo-card-title">{section.title}</h3>
                <p className="seo-card-content">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="seo-keywords-section">
            <h3>Related Topics</h3>
            <div className="seo-keywords-list">
              {[
                'color palette generator',
                'color scheme creator',
                'hex color picker',
                'CSS color variables',
                'Tailwind CSS colors',
                'WCAG contrast checker',
                'color blindness simulator',
                'accessible color palette',
                'color harmony',
                'complementary colors',
                'analogous colors',
                'web design colors',
                'brand color palette',
                'UI color scheme',
              ].map((keyword, index) => (
                <span key={index} className="seo-keyword-tag">{keyword}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Create Beautiful Colors?</h2>
            <p className="cta-subtitle">
              Start generating palettes in seconds. No signup. No limits. Completely free.
            </p>
            <button className="btn-primary btn-large btn-cta" onClick={() => navigate('/')}>
              <Palette size={24} />
              <span>Open Color Generator</span>
              <ArrowRight size={20} />
            </button>
            <span className="cta-hint">Press spacebar to generate your first palette</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-brand">
            <div className="footer-logo">
              <img src={logo} alt="CColorPalette" className="footer-logo-img" />
              <span className="footer-logo-text">CColorPalette</span>
            </div>
              <p className="footer-tagline">
                The free color palette generator for designers and developers.
              </p>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <Link to="/">Generator</Link>
                <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('#features'); }}>Features</a>
                <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('#faq'); }}>FAQ</a>
              </div>
              <div className="footer-column">
                <h4>Resources</h4>
                <a href="#theory" onClick={(e) => { e.preventDefault(); scrollToSection('#theory'); }}>Color Theory</a>
                <a href="#use-cases" onClick={(e) => { e.preventDefault(); scrollToSection('#use-cases'); }}>Use Cases</a>
                <a href="#export" onClick={(e) => { e.preventDefault(); scrollToSection('#export'); }}>Export Formats</a>
              </div>
              <div className="footer-column">
                <h4>Legal</h4>
                <a href="/privacy">Privacy Policy</a>
                <a href="/terms">Terms of Service</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} CColorPalette. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;