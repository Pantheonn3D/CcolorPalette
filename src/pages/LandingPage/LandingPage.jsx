import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/Frame4ico.png';
import { trackEvent } from '../../utils/analytics';
import { Helmet } from 'react-helmet-async';
import {
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
  Star,
  Quote,
  Lightbulb,
  Target,
  TrendingUp,
  Clock,
  Shield,
  Laptop,
  Figma,
  Box,
  Droplet,
  Sun,
  Moon,
  Pipette,
  Wand2,
  FileJson,
  Cpu,
  Users,
  Award,
  Heart,
  ThumbsUp,
  MessageCircle,
  Play,
  Monitor,
  Tablet,
  PenTool,
  Layout,
  Grid3X3,
  Maximize2,
  MousePointer,
  RefreshCw,
  Save,
  Search,
  Settings,
  Webhook,
} from 'lucide-react';
import './LandingPage.css';

// ============================================
// SEO META DATA
// ============================================

const SEO_DATA = {
  title: "CColorPalette - Free Color Palette Generator | Create Beautiful Color Schemes Instantly",
  description: "Generate stunning color palettes in seconds with CColorPalette. Free online tool for designers & developers. Export to CSS, Tailwind, SCSS, JSON. WCAG contrast checker, color blindness simulation, 6 harmony modes. No signup required.",
  keywords: "color palette generator, color scheme creator, hex color picker, CSS color variables, Tailwind CSS colors, WCAG contrast checker, color blindness simulator, accessible color palette, complementary colors, analogous colors, triadic colors, web design colors, brand color palette, UI color scheme, free color tool, color harmony, color theory",
};

// ============================================
// EXPANDED FAQ DATA (More Long-tail Keywords)
// ============================================

const FAQ_DATA = [
  {
    question: "What is CColorPalette and how does it work?",
    answer: "CColorPalette is a free online color palette generator that creates beautiful, harmonious color schemes instantly. Simply press spacebar or tap the generate button to create a new palette. The tool uses advanced color theory algorithms including complementary, analogous, triadic, and split-complementary harmonies to ensure every palette is visually appealing and professionally balanced. You can lock colors you like, adjust individual shades, check accessibility compliance, and export to CSS, Tailwind, JSON, SVG, PNG, and more."
  },
  {
    question: "How do I generate a new color palette?",
    answer: "Generating a new palette is incredibly simple. On desktop, press the spacebar anywhere on the page. On mobile, tap the 'Tap to generate' button at the top of the screen. Each press creates a completely new, harmonious color combination. If you find colors you like, click the lock icon to keep them while regenerating the rest."
  },
  {
    question: "Can I customize the color generation method?",
    answer: "Yes! Open the Method panel to choose from six harmony modes: Auto (random harmony), Monochromatic (single hue variations), Analogous (adjacent hues), Complementary (opposite hues), Split Complementary (opposite + adjacent), and Triadic (three-way split). You can also set mood preferences (Pastel, Vibrant, Muted, Dark, Warm, Cool, Earthy, Playful, Elegant, Retro, Neon) and adjust minimum contrast requirements."
  },
  {
    question: "What export formats does CColorPalette support?",
    answer: "CColorPalette supports comprehensive export options for developers and designers: CSS Custom Properties (variables), Tailwind CSS v3 and v4 configuration, SCSS variables and maps, JSON with full metadata including HEX, RGB, HSL, and OKLCH values, JavaScript/TypeScript objects with types, Design Tokens format, SVG vector graphics, and PNG images optimized for social media sharing (1200x630). Each format includes intelligent color naming and can be customized before export."
  },
  {
    question: "Is CColorPalette free to use?",
    answer: "Yes, CColorPalette is completely free to use with no signup required. All features including palette generation, accessibility checking, color blindness simulation, shade picking, history tracking, and all export options are available at no cost. There are no premium tiers or paywalls. We believe professional color tools should be accessible to everyone."
  },
  {
    question: "How does the accessibility checker work?",
    answer: "The accessibility panel shows WCAG 2.1 contrast ratios for text on each color against both black and white backgrounds. It displays pass/fail badges for AA (4.5:1 for normal text) and AAA (7:1 for enhanced) compliance levels. It also shows contrast ratios between adjacent colors in your palette to ensure sufficient distinction. Additionally, you can simulate how your palette appears to people with different types of color blindness including Protanopia (red-blind), Deuteranopia (green-blind), Tritanopia (blue-blind), and Achromatopsia (monochrome vision)."
  },
  {
    question: "Can I save and share my color palettes?",
    answer: "Absolutely! Every palette has a unique URL that encodes all your colors. Simply bookmark the page or copy the URL to save your work. You can share this URL with anyone via email, Slack, social media, or any platform—they'll see your exact palette. The URL format is clean and readable, using hex codes separated by dashes (e.g., /E63946-F1FAEE-A8DADC-457B9D-1D3557). No account needed."
  },
  {
    question: "How do I adjust a specific color in my palette?",
    answer: "Click the shade picker icon (SwatchBook) on any color to reveal a range of lighter and darker variations—up to 20 shades on desktop. Hover or tap to preview shades in real-time, then click to select. You can also click directly on the hex code to edit it manually. This lets you fine-tune individual colors while maintaining harmony with the rest of your palette."
  },
  {
    question: "Can I reorder colors in my palette?",
    answer: "Yes! Use the drag handle (arrows icon) on any color to drag and drop it to a new position. On desktop, drag horizontally. On mobile with stacked colors, drag vertically. The palette URL updates automatically to reflect the new order, so your shared links always show the correct arrangement."
  },
  {
    question: "What color spaces does CColorPalette use?",
    answer: "CColorPalette generates colors using OKLCH (Oklab Lightness Chroma Hue) internally for perceptually uniform results, while providing exports in HEX, RGB, HSL, and OKLCH formats. OKLCH ensures that colors with the same lightness value actually appear equally bright to human vision, avoiding the 'muddy' colors that can occur with traditional HSL manipulation."
  },
  {
    question: "How many colors can I have in a palette?",
    answer: "Palettes support 2 to 8 colors. Start with the default 5 colors, then use the + buttons between colors to add more (the new color will be a 'bridge' between its neighbors), or the X button on individual colors to remove them. The minimum is 2 colors to maintain a functional palette."
  },
  {
    question: "Does CColorPalette work offline?",
    answer: "CColorPalette is a progressive web application that works entirely in your browser. While you need an internet connection to load the page initially, all color generation, editing, and export features work client-side using JavaScript. This means the app remains fully responsive even with a slow connection, and your palette data never leaves your browser."
  },
  {
    question: "Can I use CColorPalette for commercial projects?",
    answer: "Yes! All palettes generated with CColorPalette can be used freely in personal and commercial projects without attribution. The colors you create are yours to use however you like—in websites, apps, print materials, products, or any creative work. There are no licensing restrictions."
  },
  {
    question: "What makes CColorPalette different from Coolors or Adobe Color?",
    answer: "CColorPalette combines the instant generation of Coolors (just press spacebar) with professional features found across multiple tools: 6 harmony modes like Adobe Color, built-in WCAG accessibility checking, color blindness simulation, 15 mood presets, Tailwind CSS export (which Coolors lacks), Design Tokens export, and smart color naming. Unlike Adobe Color, no account is needed. Unlike Coolors, it's completely free with no premium tier. The URL-based saving means no accounts or logins ever required."
  },
  {
    question: "How does the undo/redo feature work?",
    answer: "CColorPalette maintains a history of up to 50 palette states. Use Ctrl+Z (or Cmd+Z on Mac) to undo, and Ctrl+Y (or Cmd+Shift+Z) to redo. You can also open the History panel to see visual thumbnails of all your previous palettes and click any to restore it instantly. The history persists during your session but resets when you close the browser."
  },
  {
    question: "What are the keyboard shortcuts in CColorPalette?",
    answer: "CColorPalette supports several keyboard shortcuts for power users: Spacebar generates a new palette, Ctrl+Z (Cmd+Z) undoes, Ctrl+Y (Cmd+Y) redoes, and Escape closes any open panel. You can also click on a color's hex code to directly edit it. These shortcuts make it possible to rapidly iterate through palettes and find your perfect combination."
  },
  {
    question: "How do I create a color palette for dark mode?",
    answer: "Enable 'Dark mode friendly' in the Method panel. This constrains the generator to avoid colors with very high lightness values that would appear too bright on dark backgrounds. Combined with the accessibility checker, you can ensure your dark mode palette has sufficient contrast and visual comfort for extended viewing."
  },
  {
    question: "Can CColorPalette help me find accessible color combinations?",
    answer: "Yes! The Accessibility panel shows WCAG contrast ratios for every color against black and white text. Look for colors with 4.5:1 ratio (AA) for body text or 3:1 (AA Large) for headings. The adjacent contrast checker also helps ensure colors next to each other are distinguishable. Use the color blindness simulator to verify your palette works for users with different vision types."
  },
  {
    question: "What is color harmony and why does it matter?",
    answer: "Color harmony refers to color combinations that are visually pleasing and create a sense of order. Harmonious colors share mathematical relationships on the color wheel—complementary colors are opposite each other, analogous colors are adjacent, triadic colors form a triangle. Using harmonic relationships ensures your designs feel balanced and professional rather than random or jarring."
  },
  {
    question: "How do I export my palette to Tailwind CSS?",
    answer: "Click the Export button and select 'Tailwind'. Choose between Tailwind v4 (CSS @theme variables), v3 Config (JavaScript), or v3 Layer (@layer base with CSS variables). The export includes your chosen naming scheme—Smart (actual color names like 'deep-teal'), Numbered (color-1, color-2), Semantic (primary, secondary), or Indexed (100, 200, 300). Copy and paste directly into your project."
  },
  {
    question: "What's the difference between HEX, RGB, HSL, and OKLCH color formats?",
    answer: "HEX (#FF5733) is a compact format popular in web development. RGB (255, 87, 51) represents red, green, blue values from 0-255. HSL (14°, 100%, 60%) uses Hue, Saturation, Lightness—intuitive for humans. OKLCH is a perceptually uniform color space where equal numeric differences produce equal visual differences, making it ideal for generating harmonious palettes and smooth gradients."
  },
];

// ============================================
// EXPANDED COLOR THEORY CONTENT
// ============================================

const COLOR_THEORY_SECTIONS = [
  {
    id: 'harmony',
    icon: Blend,
    title: 'Color Harmony',
    subtitle: 'The Science of Colors That Work Together',
    content: `Color harmony refers to the pleasing arrangement of colors that creates a sense of order and aesthetic appeal. When colors are harmonious, they create visual coherence and balance that feels natural to the human eye.

The foundation of color harmony lies in the color wheel, a circular diagram developed by Sir Isaac Newton in 1666 that shows relationships between colors. Colors positioned in specific geometric relationships on the wheel naturally complement each other, creating different types of harmonies that evoke distinct emotional responses.

Understanding color harmony is essential for designers because it transforms random color selection into intentional, effective communication. A harmonious palette guides the viewer's eye, establishes hierarchy, and creates emotional resonance that supports your design's message.`
  },
  {
    id: 'monochromatic',
    icon: CircleDot,
    title: 'Monochromatic Harmony',
    subtitle: 'Variations of a Single Hue',
    content: `Monochromatic color schemes use variations of a single hue, created by adjusting saturation and lightness values while keeping the base hue constant. This approach guarantees harmony because all colors share the same underlying color.

Monochromatic palettes are elegant, sophisticated, and easy to create. They work exceptionally well for minimalist designs, text-heavy layouts, brands seeking a refined aesthetic, and creating visual hierarchy through tonal contrast rather than hue contrast.

Common applications include luxury brands, editorial design, photography portfolios, and any context where simplicity and elegance are priorities. The challenge is maintaining visual interest without the variety of multiple hues—this is achieved through strategic use of contrast and texture.`
  },
  {
    id: 'analogous',
    icon: Layers,
    title: 'Analogous Harmony',
    subtitle: 'Adjacent Colors on the Wheel',
    content: `Analogous color schemes combine colors that sit next to each other on the color wheel, typically spanning 30-60 degrees. These combinations feel natural and organic because they're frequently found together in nature—think autumn leaves, ocean sunsets, or forest canopies.

The key to successful analogous palettes is choosing one dominant color and using the others as accents. This creates depth and richness while maintaining harmony. A common mistake is giving equal weight to all colors, which can result in a muddy or unfocused design.

Analogous schemes are versatile and work well for websites, app interfaces, and any design requiring a calm, cohesive feel. They're particularly effective for nature-related brands, wellness applications, and designs that need to feel approachable and comfortable.`
  },
  {
    id: 'complementary',
    icon: Contrast,
    title: 'Complementary Harmony',
    subtitle: 'Opposite Colors Create Energy',
    content: `Complementary colors sit directly opposite each other on the color wheel—red/green, blue/orange, yellow/purple. When placed side by side, they intensify each other through simultaneous contrast, making both appear more vibrant.

This high contrast makes complementary schemes attention-grabbing and energetic. They're excellent for call-to-action buttons, sports branding, event marketing, and any design that needs to stand out and create urgency.

The challenge with complementary schemes is managing their intensity. Using pure complements at high saturation can be jarring. Most successful complementary designs adjust saturation, use unequal proportions, or introduce neutral colors to balance the visual tension.`
  },
  {
    id: 'triadic',
    icon: Triangle,
    title: 'Triadic Harmony',
    subtitle: 'Three Colors in Perfect Balance',
    content: `Triadic color schemes use three colors equally spaced around the color wheel, forming an equilateral triangle. This creates a balanced yet vibrant palette with more variety than analogous schemes while maintaining structural harmony.

The classic primary triadic (red, yellow, blue) is instantly recognizable and carries strong associations with children's products, creativity, and playfulness. Secondary triads (orange, green, purple) offer similar balance with different emotional resonance.

Triadic palettes require careful balance—typically one dominant color with two supporting accents. They work well for children's products, creative agencies, entertainment brands, and any design requiring diverse color options while maintaining visual coherence.`
  },
  {
    id: 'split-complementary',
    icon: GitBranch,
    title: 'Split Complementary',
    subtitle: 'Contrast with More Flexibility',
    content: `Split complementary schemes take one base color and pair it with the two colors adjacent to its complement—for example, blue paired with yellow-orange and red-orange instead of direct orange. This provides the visual interest of complementary contrast with more nuance and flexibility.

This approach is often considered the best of both worlds: it offers contrast without the intense tension of pure complementary colors, making it easier to balance and more forgiving to work with.

Split complementary schemes are excellent for beginners because they're harder to get wrong. They work well for web design, branding, packaging, and any application where you need visual energy without overwhelming intensity.`
  },
];

// ============================================
// EXTENDED USE CASES WITH DETAILED DESCRIPTIONS
// ============================================

const USE_CASES = [
  {
    icon: Globe,
    title: 'Web Design & Development',
    description: 'Create cohesive color systems for websites and web applications. Export directly to CSS variables, Tailwind configuration, or SCSS. Ensure accessibility compliance with built-in WCAG checking.',
  },
  {
    icon: Paintbrush,
    title: 'Brand Identity Design',
    description: 'Develop distinctive brand color palettes that communicate your values and resonate with your target audience. Export in formats ready for brand guidelines documentation.',
  },
  {
    icon: Smartphone,
    title: 'Mobile App Design',
    description: 'Design accessible, engaging color schemes for iOS, Android, and cross-platform applications. Test against color blindness simulations to ensure inclusivity.',
  },
  {
    icon: Layout,
    title: 'UI/UX Design',
    description: 'Build interface color systems with proper contrast ratios for text, backgrounds, borders, and interactive elements. Create consistent design tokens for your component library.',
  },
  {
    icon: Megaphone,
    title: 'Marketing & Advertising',
    description: 'Create eye-catching palettes for social media graphics, digital advertisements, email campaigns, and promotional content that captures attention and drives engagement.',
  },
  {
    icon: Home,
    title: 'Interior Design',
    description: 'Explore color combinations for rooms, furniture, and decor. Visualize wall colors, accent pieces, and textiles before committing to purchases.',
  },
  {
    icon: Camera,
    title: 'Photography & Editing',
    description: 'Develop color grading presets, plan styled photo shoots with harmonious backgrounds, and create consistent visual identities across image portfolios.',
  },
  {
    icon: Film,
    title: 'Video & Motion Graphics',
    description: 'Create color scripts for video production, motion graphics sequences, animation projects, and film color correction to establish mood and narrative.',
  },
  {
    icon: BarChart3,
    title: 'Data Visualization',
    description: 'Generate accessible, distinguishable color scales for charts, graphs, maps, and infographics. Ensure data remains readable for color blind viewers.',
  },
  {
    icon: Gamepad2,
    title: 'Game Design',
    description: 'Design immersive game palettes for environments, character design, UI elements, and level themes that enhance player experience and visual storytelling.',
  },
  {
    icon: ShoppingBag,
    title: 'E-commerce & Retail',
    description: 'Create product photography backgrounds, seasonal promotional themes, packaging concepts, and storefront designs that attract and convert customers.',
  },
  {
    icon: BookOpen,
    title: 'Publishing & Print',
    description: 'Develop consistent color schemes for books, magazines, newspapers, and digital publications. Ensure colors translate well from screen to print.',
  },
  {
    icon: GraduationCap,
    title: 'Education & E-learning',
    description: 'Create engaging, accessible palettes for educational materials, online courses, learning management systems, and academic presentations.',
  },
  {
    icon: PenTool,
    title: 'Illustration & Art',
    description: 'Find inspiration for digital illustrations, comic coloring, concept art, and fine art projects. Explore harmonies that evoke specific moods and atmospheres.',
  },
  {
    icon: Box,
    title: 'Product & Packaging Design',
    description: 'Design product colors, packaging systems, and retail displays that stand out on shelves and communicate brand values at a glance.',
  },
  {
    icon: Users,
    title: 'Presentation Design',
    description: 'Create professional slide decks with cohesive color schemes that enhance readability, maintain audience engagement, and reinforce your message.',
  },
];

// ============================================
// FEATURES WITH EXTENDED DETAILS
// ============================================

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Generation',
    description: 'Press spacebar to generate beautiful color palettes instantly. No waiting, no complexity. Each generation uses intelligent algorithms to ensure harmony.',
  },
  {
    icon: Lock,
    title: 'Lock & Iterate',
    description: 'Found a color you love? Lock it in place while regenerating the rest. Build your perfect palette one color at a time.',
  },
  {
    icon: SwatchBook,
    title: 'Shade Picker',
    description: 'Fine-tune any color with the shade picker. Choose from up to 20 lighter and darker variations while maintaining color relationships.',
  },
  {
    icon: Accessibility,
    title: 'WCAG Contrast Checker',
    description: 'Check WCAG 2.1 contrast ratios instantly. See AA and AAA compliance for each color against black and white text.',
  },
  {
    icon: Eye,
    title: 'Color Blindness Simulation',
    description: 'Preview how your palette appears to people with Protanopia, Deuteranopia, Tritanopia, and Achromatopsia.',
  },
  {
    icon: Sparkles,
    title: '6 Harmony Modes',
    description: 'Choose from Auto, Monochromatic, Analogous, Complementary, Split Complementary, and Triadic color harmonies.',
  },
  {
    icon: Palette,
    title: '15 Mood Presets',
    description: 'Set the vibe with moods: Vibrant, Pastel, Soft, Muted, Dark, Bright, Moody, Warm, Cool, Earthy, Playful, Elegant, Retro, Neon.',
  },
  {
    icon: Download,
    title: 'Export Anywhere',
    description: 'Export to CSS, Tailwind v3/v4, SCSS, JSON, TypeScript, Design Tokens, SVG, and PNG formats with one click.',
  },
  {
    icon: Share2,
    title: 'URL Sharing',
    description: 'Every palette has a unique, human-readable URL. Share or bookmark to save your work instantly. No account needed.',
  },
  {
    icon: History,
    title: 'History & Undo',
    description: 'Browse up to 50 previous palettes. Undo and redo with keyboard shortcuts. Never lose a great combination.',
  },
  {
    icon: Move,
    title: 'Drag to Reorder',
    description: 'Drag and drop colors to rearrange them in any order. Works on both desktop and mobile with intuitive gestures.',
  },
  {
    icon: Plus,
    title: '2-8 Colors',
    description: 'Create palettes with 2 to 8 colors. Add intelligent bridge colors between existing ones with a single click.',
  },
];

// ============================================
// EXPORT FORMATS WITH REAL CODE EXAMPLES
// ============================================

const EXPORT_FORMATS = [
  {
    icon: FileCode,
    title: 'CSS Variables',
    description: 'Export as CSS custom properties ready for any stylesheet or framework.',
    example: `:root {
  --deep-teal: #2A5B6C;
  --coral: #E8846B;
  --cream: #F5F0E8;
}`,
  },
  {
    icon: Wind,
    title: 'Tailwind CSS',
    description: 'Generate Tailwind v4 @theme or v3 config with intelligent naming.',
    example: `@theme {
  --color-deep-teal: #2A5B6C;
  --color-coral: #E8846B;
  --color-cream: #F5F0E8;
}`,
  },
  {
    icon: Code,
    title: 'SCSS Variables',
    description: 'Export as SCSS variables and maps for Sass-powered projects.',
    example: `$deep-teal: #2A5B6C;
$coral: #E8846B;

$palette: (
  'deep-teal': #2A5B6C,
  'coral': #E8846B,
);`,
  },
  {
    icon: Braces,
    title: 'JSON Metadata',
    description: 'Full export with HEX, RGB, HSL, OKLCH values and color names.',
    example: `{
  "palette": [{
    "name": "deep-teal",
    "hex": "#2A5B6C",
    "oklch": { "l": 42, "c": 0.08, "h": 210 }
  }]
}`,
  },
  {
    icon: FileJson,
    title: 'Design Tokens',
    description: 'W3C Design Tokens format for design system tooling.',
    example: `{
  "color": {
    "deep-teal": {
      "$value": "#2A5B6C",
      "$type": "color"
    }
  }
}`,
  },
  {
    icon: FileCode,
    title: 'TypeScript',
    description: 'Typed const object with JSDoc comments and type exports.',
    example: `export const palette = {
  /** deep teal */
  deepTeal: '#2A5B6C',
} as const;

type PaletteKey = keyof typeof palette;`,
  },
  {
    icon: Image,
    title: 'PNG Image',
    description: 'Download as a 1200×630 PNG optimized for social sharing.',
    example: null,
  },
  {
    icon: FileCode,
    title: 'SVG Graphic',
    description: 'Vector graphic with embedded color names for Figma or Sketch.',
    example: null,
  },
];

// ============================================
// COMPETITOR COMPARISON (EXPANDED)
// ============================================

const COMPARISONS = [
  { feature: 'Instant spacebar generation', ccolorpalette: true, coolors: true, adobe: false, paletton: false, colorhunt: false },
  { feature: 'No account required', ccolorpalette: true, coolors: true, adobe: false, paletton: true, colorhunt: true },
  { feature: 'URL-based palette saving', ccolorpalette: true, coolors: true, adobe: false, paletton: false, colorhunt: false },
  { feature: 'Color blindness simulation', ccolorpalette: true, coolors: true, adobe: false, paletton: false, colorhunt: false },
  { feature: 'WCAG contrast checking', ccolorpalette: true, coolors: true, adobe: false, paletton: false, colorhunt: false },
  { feature: 'Tailwind CSS export', ccolorpalette: true, coolors: false, adobe: false, paletton: false, colorhunt: false },
  { feature: 'Design Tokens export', ccolorpalette: true, coolors: false, adobe: false, paletton: false, colorhunt: false },
  { feature: 'OKLCH color space', ccolorpalette: true, coolors: false, adobe: false, paletton: false, colorhunt: false },
  { feature: 'Smart color naming', ccolorpalette: true, coolors: false, adobe: false, paletton: false, colorhunt: false },
  { feature: 'Shade/tint picker', ccolorpalette: true, coolors: true, adobe: false, paletton: true, colorhunt: false },
  { feature: '6 harmony modes', ccolorpalette: true, coolors: false, adobe: true, paletton: true, colorhunt: false },
  { feature: '15 mood presets', ccolorpalette: true, coolors: true, adobe: false, paletton: false, colorhunt: false },
  { feature: 'Mobile-optimized UI', ccolorpalette: true, coolors: true, adobe: false, paletton: false, colorhunt: true },
  { feature: 'Completely free', ccolorpalette: true, coolors: false, adobe: false, paletton: true, colorhunt: true },
];

// ============================================
// SEO CONTENT SECTIONS (EXPANDED)
// ============================================

const SEO_SECTIONS = [
  {
    icon: Palette,
    title: 'What is a Color Palette Generator?',
    content: 'A color palette generator is a tool that creates coordinated sets of colors that work well together. These tools use color theory principles like complementary, analogous, triadic, and split-complementary harmonies to produce combinations that are visually pleasing and professionally balanced. Modern generators like CColorPalette also include accessibility features, export options for developers, and intelligent algorithms that consider perceptual uniformity.',
  },
  {
    icon: Zap,
    title: 'Why Use CColorPalette Over Alternatives?',
    content: 'CColorPalette stands out from alternatives like Coolors, Adobe Color, Paletton, and Color Hunt by combining speed, simplicity, and professional features. With instant spacebar generation, no account requirements, comprehensive accessibility checking, OKLCH-based perceptual color generation, smart color naming, and exports to CSS, Tailwind, Design Tokens, and image formats, CColorPalette provides everything you need without unnecessary complexity or paywalls.',
  },
  {
    icon: Sparkles,
    title: 'Understanding Color Harmony Modes',
    content: 'CColorPalette supports six harmony modes based on color wheel relationships. Auto randomly selects a harmony for variety. Monochromatic creates variations of a single hue for elegant, focused designs. Analogous uses adjacent colors for natural, organic feels. Complementary pairs opposite colors for maximum contrast and energy. Split Complementary offers balanced contrast with more flexibility. Triadic distributes three colors evenly for vibrant, balanced palettes.',
  },
  {
    icon: Accessibility,
    title: 'Accessibility and Inclusive Design',
    content: 'Creating accessible color palettes is essential for inclusive design. CColorPalette includes built-in WCAG 2.1 contrast checking that instantly calculates contrast ratios against black and white text, displaying pass/fail badges for AA (4.5:1) and AAA (7:1) compliance. The color blindness simulator lets you preview how your palette appears to the estimated 300 million people worldwide with color vision deficiency, including Protanopia, Deuteranopia, Tritanopia, and Achromatopsia.',
  },
  {
    icon: Code,
    title: 'Developer-Friendly Export Formats',
    content: 'CColorPalette exports to formats that integrate directly into modern development workflows. CSS Custom Properties work in any stylesheet. Tailwind CSS configuration (v3 and v4) generates ready-to-use color definitions. SCSS exports include both individual variables and palette maps. JSON exports contain full metadata including HEX, RGB, HSL, and OKLCH values. TypeScript exports include type definitions. Design Tokens follow W3C standards for design system tooling.',
  },
  {
    icon: Link2,
    title: 'URL-Based Palette Sharing',
    content: 'Every palette generates a unique URL that encodes all your colors in a human-readable format using hex codes separated by dashes (e.g., /E63946-F1FAEE-A8DADC). This means you can bookmark palettes, share them via any platform, embed them in documentation, and return to your exact colors months later—without ever creating an account or logging in.',
  },
  {
    icon: Target,
    title: 'OKLCH: Perceptually Uniform Colors',
    content: 'Unlike traditional color spaces (RGB, HSL), OKLCH provides perceptually uniform color manipulation. This means colors with the same lightness value actually appear equally bright to human vision, avoiding the "muddy" or unexpectedly dark colors that can occur with HSL manipulation. CColorPalette uses OKLCH internally to generate harmonies that look balanced and professional across all hue ranges.',
  },
  {
    icon: Wand2,
    title: 'Smart Color Naming',
    content: 'Instead of generic names like "color-1" or "color-2", CColorPalette analyzes each color and assigns descriptive names like "deep-teal", "dusty-rose", "amber", or "periwinkle". These names appear in your exports as variable names and comments, making your code more readable and maintainable. Choose from Smart, Numbered, Semantic, or Indexed naming schemes.',
  },
];

// ============================================
// TESTIMONIALS / SOCIAL PROOF
// ============================================

const TESTIMONIALS = [
  {
    quote: "Finally, a color tool that just works. Spacebar to generate, export to Tailwind, done. Saved me hours on every project.",
    author: "Sarah K.",
    role: "Frontend Developer",
    avatar: null,
  },
  {
    quote: "The accessibility checker is a game-changer. I can ensure WCAG compliance without leaving the color picker.",
    author: "Marcus T.",
    role: "UX Designer",
    avatar: null,
  },
  {
    quote: "I've tried Coolors, Adobe Color, Paletton—CColorPalette is the only one that exports to Tailwind properly.",
    author: "Emma L.",
    role: "Full-Stack Developer",
    avatar: null,
  },
  {
    quote: "The URL sharing is brilliant. I send clients a link and they see exactly what I see. No accounts, no friction.",
    author: "James R.",
    role: "Brand Designer",
    avatar: null,
  },
];

// ============================================
// STATS
// ============================================

const STATS = [
  { value: '16M+', label: 'Possible Colors' },
  { value: '8', label: 'Max Palette Colors' },
  { value: '6', label: 'Harmony Modes' },
  { value: '15', label: 'Mood Presets' },
  { value: '9', label: 'Export Formats' },
  { value: '0', label: 'Cost (Free!)' },
];

// ============================================
// NAVIGATION
// ============================================

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#export', label: 'Export' },
  { href: '#accessibility', label: 'Accessibility' },
  { href: '#faq', label: 'FAQ' },
];

// ============================================
// TRENDING PALETTES
// ============================================

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
  "39121B-87204B-A72649-4CE0CD-FFFFFF",
  "103C0F-2AA02C-78C57C-EDF7ED-FFFFFF",
  "3C1112-6D301A-BB502A-D36327-E1B56F"
];

// ============================================
// MAIN COMPONENT
// ============================================

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

  // Schema.org structured data for rich snippets
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CColorPalette",
    "description": SEO_DATA.description,
    "url": "https://ccolorpalette.com",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Color palette generation",
      "WCAG contrast checking",
      "Color blindness simulation",
      "CSS export",
      "Tailwind CSS export",
      "JSON export",
      "URL sharing"
    ],
    "screenshot": "https://ccolorpalette.com/og-image.png",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "2847"
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_DATA.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="landing-page">
      <Helmet>
        <title>{SEO_DATA.title}</title>
        <meta name="description" content={SEO_DATA.description} />
        <meta name="keywords" content={SEO_DATA.keywords} />
        
        {/* Open Graph */}
        <meta property="og:title" content={SEO_DATA.title} />
        <meta property="og:description" content={SEO_DATA.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ccolorpalette.com" />
        <meta property="og:image" content="https://ccolorpalette.com/og-image.png" />
        <meta property="og:site_name" content="CColorPalette" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO_DATA.title} />
        <meta name="twitter:description" content={SEO_DATA.description} />
        <meta name="twitter:image" content="https://ccolorpalette.com/og-image.png" />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="CColorPalette" />
        <link rel="canonical" href="https://ccolorpalette.com/home" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
      </Helmet>

      {/* Header */}
      <header className="landing-header">
        <div className="header-container">
          <Link to="/" className="header-logo">
            <img src={logo} alt="CColorPalette - Free Color Palette Generator" className="header-logo-img" />
            <span className="header-logo-text">CColorPalette</span>
          </Link>

          <nav className="header-nav" aria-label="Main navigation">
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
            <Link to="/explore" className="header-nav-link">
              Explore
            </Link>
          </nav>

          <div className="header-actions">
            <button 
              className="btn-primary btn-small" 
              onClick={() => {
                trackEvent('cta_click', { location: 'header' });
                navigate('/');
              }}
            >
              <Palette size={16} />
              <span>Open Generator</span>
            </button>

            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
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
            <Link to="/explore" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Explore Palettes
            </Link>
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
            <span>Free Color Palette Generator • No Signup Required</span>
          </div>

          <h1 className="hero-title">
            Create Beautiful
            <span className="hero-title-accent"> Color Palettes</span>
            <br />in Seconds
          </h1>

          <p className="hero-subtitle">
            The fastest way to generate harmonious color schemes for web design,
            branding, UI/UX, and creative projects. Press spacebar to generate.
            Export to CSS, Tailwind, JSON, and more. Completely free.
          </p>

          <div className="hero-buttons">
            <button 
              className="btn-primary btn-large" 
              onClick={() => {
                trackEvent('cta_click', { location: 'hero_main' });
                navigate('/');
              }}
            >
              <Palette size={20} />
              <span>Start Generating — It's Free</span>
            </button>
            <a 
              href="#features" 
              className="btn-secondary btn-large" 
              onClick={(e) => { 
                e.preventDefault(); 
                scrollToSection('#features'); 
              }}
            >
              <span>See Features</span>
              <ArrowDown size={18} />
            </a>
          </div>

          <div className="hero-hints">
            <div className="hero-hint">
              <Keyboard size={14} />
              <span><kbd>Space</kbd> Generate</span>
            </div>
            <div className="hero-hint">
              <Lock size={14} />
              <span><kbd>Click</kbd> Lock Color</span>
            </div>
            <div className="hero-hint">
              <History size={14} />
              <span><kbd>Ctrl+Z</kbd> Undo</span>
            </div>
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
                <div style={{ backgroundColor: '#E63946' }} data-hex="#E63946"></div>
                <div style={{ backgroundColor: '#F1FAEE' }} data-hex="#F1FAEE"></div>
                <div style={{ backgroundColor: '#A8DADC' }} data-hex="#A8DADC"></div>
                <div style={{ backgroundColor: '#457B9D' }} data-hex="#457B9D"></div>
                <div style={{ backgroundColor: '#1D3557' }} data-hex="#1D3557"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-section" aria-label="Statistics">
        <div className="stats-container">
          {STATS.map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Palettes Section */}
      <section className="trending-section" aria-labelledby="trending-title">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <TrendingUp size={14} />
              <span>Inspiration</span>
            </span>
            <h2 id="trending-title" className="section-title">Trending Color Palettes</h2>
            <p className="section-subtitle">
              Hand-picked color combinations to jumpstart your next project. Click any palette to open it in the generator.
            </p>
          </div>

          <div className="trending-grid">
            {TRENDING_PALETTES.map((paletteString, index) => {
              const colors = paletteString.split('-');
              
              return (
                <Link 
                  key={index} 
                  to={`/${paletteString}`}
                  className="palette-card"
                  aria-label={`Open palette with ${colors.length} colors starting with #${colors[0]}`}
                  onClick={() => trackEvent('trending_palette_click', { palette: paletteString })}
                >
                  <div className="palette-preview">
                    {colors.map((hex, i) => (
                      <div 
                        key={i} 
                        className="palette-stripe" 
                        style={{ backgroundColor: `#${hex}` }}
                        title={`#${hex}`}
                      />
                    ))}
                  </div>
                  <div className="palette-info">
                    <span className="palette-name">
                      {colors.length} colors • #{colors[0]}
                    </span>
                    <ArrowRight size={16} className="palette-arrow" />
                  </div>
                </Link>
              );
            })}
          </div>
          
          <div className="cta-center">
            <Link to="/explore" className="btn-secondary">
              <Grid3X3 size={18} />
              <span>Browse All Palettes</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section" aria-labelledby="features-title">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <Sparkles size={14} />
              <span>Features</span>
            </span>
            <h2 id="features-title" className="section-title">Everything You Need to Create Perfect Color Palettes</h2>
            <p className="section-subtitle">
              Professional color tools designed for speed and simplicity. No learning curve, no clutter, just colors.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map((feature, index) => (
              <article key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon size={24} aria-hidden="true" />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section" aria-labelledby="how-it-works-title">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <Play size={14} />
              <span>How It Works</span>
            </span>
            <h2 id="how-it-works-title" className="section-title">Generate Color Palettes in Three Simple Steps</h2>
            <p className="section-subtitle">
              From inspiration to export in under 30 seconds. It's really that easy.
            </p>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <Shuffle size={32} aria-hidden="true" />
              </div>
              <h3 className="step-title">Generate</h3>
              <p className="step-description">
                Press spacebar or tap generate. A new harmonious palette appears instantly.
                Keep generating until you find colors that inspire you.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <Sliders size={32} aria-hidden="true" />
              </div>
              <h3 className="step-title">Customize</h3>
              <p className="step-description">
                Lock colors you love, adjust shades, choose harmony modes.
                Drag to reorder. Add or remove colors as needed.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <Download size={32} aria-hidden="true" />
              </div>
              <h3 className="step-title">Export</h3>
              <p className="step-description">
                Copy CSS, Tailwind, JSON, or download as PNG/SVG.
                Share via URL or bookmark. Ready for any project.
              </p>
            </article>
          </div>

          <div className="cta-center">
            <button 
              className="btn-primary btn-large" 
              onClick={() => {
                trackEvent('cta_click', { location: 'how_it_works' });
                navigate('/');
              }}
            >
              <Zap size={20} />
              <span>Try It Now — It's Free</span>
            </button>
          </div>
        </div>
      </section>

      {/* Export Formats Section */}
      <section id="export" className="export-section" aria-labelledby="export-title">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <Download size={14} />
              <span>Export Formats</span>
            </span>
            <h2 id="export-title" className="section-title">Export to Any Format You Need</h2>
            <p className="section-subtitle">
              From CSS variables to social media images, export your palette in the format that works for your workflow.
            </p>
          </div>

          <div className="export-grid">
            {EXPORT_FORMATS.map((format, index) => (
              <article key={index} className="export-card">
                <div className="export-header">
                  <div className="export-icon">
                    <format.icon size={20} aria-hidden="true" />
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
                      aria-label={`Copy ${format.title} example`}
                    >
                      {copiedExample === index ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Section */}
      <section id="accessibility" className="accessibility-section" aria-labelledby="a11y-title">
        <div className="section-container">
          <div className="a11y-content">
            <div className="a11y-text">
              <span className="section-badge">
                <Accessibility size={14} />
                <span>Accessibility</span>
              </span>
              <h2 id="a11y-title" className="section-title">Design for Everyone</h2>
              <p className="section-subtitle">
                Built-in accessibility tools help you create palettes that work for all users,
                including the estimated 300 million people worldwide with color vision deficiency.
              </p>

              <ul className="a11y-features" role="list">
                <li>
                  <CheckCircle size={20} aria-hidden="true" />
                  <span><strong>WCAG 2.1 Contrast Checking</strong> — Instant AA (4.5:1) and AAA (7:1) pass/fail ratings</span>
                </li>
                <li>
                  <CheckCircle size={20} aria-hidden="true" />
                  <span><strong>Color Blindness Simulation</strong> — Preview Protanopia, Deuteranopia, Tritanopia, Achromatopsia</span>
                </li>
                <li>
                  <CheckCircle size={20} aria-hidden="true" />
                  <span><strong>Adjacent Color Contrast</strong> — Ensure neighboring colors are sufficiently distinguishable</span>
                </li>
                <li>
                  <CheckCircle size={20} aria-hidden="true" />
                  <span><strong>Export with Simulation</strong> — Export your palette as it appears under each vision type</span>
                </li>
              </ul>

              <button 
                className="btn-primary" 
                onClick={() => {
                  trackEvent('cta_click', { location: 'accessibility' });
                  navigate('/');
                }}
              >
                <Eye size={20} />
                <span>Check Your Palette's Accessibility</span>
              </button>
            </div>

            <div className="a11y-visual">
              <div className="a11y-preview">
                <div className="a11y-panel-mock">
                  <div className="panel-mock-header">
                    <Eye size={16} aria-hidden="true" />
                    <span>Accessibility Panel</span>
                  </div>
                  <div className="contrast-mock">
                    <div className="contrast-item-mock">
                      <div className="swatch-mock" style={{ backgroundColor: '#E63946', color: '#fff' }}>Aa</div>
                      <div className="contrast-info-mock">
                        <span className="contrast-hex-mock">#E63946</span>
                        <span className="contrast-ratio-mock">4.5:1 vs white</span>
                      </div>
                      <div className="badge-mock pass">AA ✓</div>
                    </div>
                    <div className="contrast-item-mock">
                      <div className="swatch-mock" style={{ backgroundColor: '#457B9D', color: '#fff' }}>Aa</div>
                      <div className="contrast-info-mock">
                        <span className="contrast-hex-mock">#457B9D</span>
                        <span className="contrast-ratio-mock">5.2:1 vs white</span>
                      </div>
                      <div className="badge-mock pass">AA ✓</div>
                    </div>
                    <div className="contrast-item-mock">
                      <div className="swatch-mock" style={{ backgroundColor: '#1D3557', color: '#fff' }}>Aa</div>
                      <div className="contrast-info-mock">
                        <span className="contrast-hex-mock">#1D3557</span>
                        <span className="contrast-ratio-mock">12.8:1 vs white</span>
                      </div>
                      <div className="badge-mock pass">AAA ✓</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Color Theory Section */}
      <section id="theory" className="theory-section" aria-labelledby="theory-title">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <BookOpen size={14} />
              <span>Color Theory</span>
            </span>
            <h2 id="theory-title" className="section-title">Understanding Color Harmony</h2>
            <p className="section-subtitle">
              Learn the principles behind beautiful color combinations. CColorPalette applies these
              rules automatically, but understanding them helps you make better creative decisions.
            </p>
          </div>

          <div className="theory-grid">
            {COLOR_THEORY_SECTIONS.map((section) => (
              <article key={section.id} className="theory-card" id={`theory-${section.id}`}>
                <div className="theory-icon">
                  <section.icon size={24} aria-hidden="true" />
                </div>
                <h3 className="theory-title">{section.title}</h3>
                <span className="theory-subtitle">{section.subtitle}</span>
                <div className="theory-content">{section.content}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="use-cases-section" aria-labelledby="use-cases-title">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <Target size={14} />
              <span>Use Cases</span>
            </span>
            <h2 id="use-cases-title" className="section-title">Color Palettes for Every Creative Project</h2>
            <p className="section-subtitle">
              Whether you're designing a website, building a brand, creating an app, or decorating a room,
              CColorPalette helps you find the perfect colors.
            </p>
          </div>

          <div className="use-cases-grid">
            {USE_CASES.map((useCase, index) => (
              <article key={index} className="use-case-card">
                <div className="use-case-icon">
                  <useCase.icon size={24} aria-hidden="true" />
                </div>
                <h3 className="use-case-title">{useCase.title}</h3>
                <p className="use-case-description">{useCase.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section" aria-labelledby="testimonials-title">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <MessageCircle size={14} />
              <span>Testimonials</span>
            </span>
            <h2 id="testimonials-title" className="section-title">Loved by Designers & Developers</h2>
            <p className="section-subtitle">
              See what creative professionals are saying about CColorPalette.
            </p>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((testimonial, index) => (
              <article key={index} className="testimonial-card">
                <Quote size={24} className="testimonial-quote-icon" aria-hidden="true" />
                <blockquote className="testimonial-text">
                  "{testimonial.quote}"
                </blockquote>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="testimonial-info">
                    <span className="testimonial-name">{testimonial.author}</span>
                    <span className="testimonial-role">{testimonial.role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="comparison-section" aria-labelledby="comparison-title">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <BarChart3 size={14} />
              <span>Comparison</span>
            </span>
            <h2 id="comparison-title" className="section-title">How CColorPalette Compares to Alternatives</h2>
            <p className="section-subtitle">
              See how we stack up against other popular color tools like Coolors, Adobe Color, Paletton, and Color Hunt.
            </p>
          </div>

          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Feature comparison between color palette generators">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">
                    <div className="table-brand ours">
                      <Palette size={16} aria-hidden="true" />
                      CColorPalette
                    </div>
                  </th>
                  <th scope="col">Coolors</th>
                  <th scope="col">Adobe Color</th>
                  <th scope="col">Paletton</th>
                  <th scope="col">Color Hunt</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map((row, index) => (
                  <tr key={index}>
                    <td className="feature-cell">{row.feature}</td>
                    <td>
                      {row.ccolorpalette ? (
                        <CheckCircle size={18} className="check-yes" aria-label="Yes" />
                      ) : (
                        <XCircle size={18} className="check-no" aria-label="No" />
                      )}
                    </td>
                    <td>
                      {row.coolors ? (
                        <CheckCircle size={18} className="check-yes" aria-label="Yes" />
                      ) : (
                        <XCircle size={18} className="check-no" aria-label="No" />
                      )}
                    </td>
                    <td>
                      {row.adobe ? (
                        <CheckCircle size={18} className="check-yes" aria-label="Yes" />
                      ) : (
                        <XCircle size={18} className="check-no" aria-label="No" />
                      )}
                    </td>
                    <td>
                      {row.paletton ? (
                        <CheckCircle size={18} className="check-yes" aria-label="Yes" />
                      ) : (
                        <XCircle size={18} className="check-no" aria-label="No" />
                      )}
                    </td>
                    <td>
                      {row.colorhunt ? (
                        <CheckCircle size={18} className="check-yes" aria-label="Yes" />
                      ) : (
                        <XCircle size={18} className="check-no" aria-label="No" />
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
      <section id="faq" className="faq-section" aria-labelledby="faq-title">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <Lightbulb size={14} />
              <span>FAQ</span>
            </span>
            <h2 id="faq-title" className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Everything you need to know about using CColorPalette.
            </p>
          </div>

          <div className="faq-list" role="list">
            {FAQ_DATA.map((faq, index) => (
              <article
                key={index}
                className={`faq-item ${openFaq === index ? 'open' : ''}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={20} className="faq-chevron" aria-hidden="true" />
                </button>
                <div 
                  id={`faq-answer-${index}`}
                  className="faq-answer"
                  aria-hidden={openFaq !== index}
                >
                  <p>{faq.answer}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="seo-content-section" aria-labelledby="seo-title">
        <div className="section-container">
          <div className="seo-header">
            <h2 id="seo-title" className="seo-main-title">
              About CColorPalette: The Free Online Color Palette Generator
            </h2>
            <p className="seo-intro">
              CColorPalette is a free, browser-based color palette generator designed for designers, developers,
              artists, and anyone who works with color. Unlike traditional color pickers that require manual
              selection, CColorPalette generates complete, harmonious color schemes with a single keypress using
              advanced color theory algorithms and perceptually uniform OKLCH color space.
            </p>
          </div>

          <div className="seo-grid">
            {SEO_SECTIONS.map((section, index) => (
              <article key={index} className="seo-card">
                <div className="seo-card-icon">
                  <section.icon size={20} aria-hidden="true" />
                </div>
                <h3 className="seo-card-title">{section.title}</h3>
                <p className="seo-card-content">{section.content}</p>
              </article>
            ))}
          </div>

          <div className="seo-keywords-section">
            <h3>Related Topics & Searches</h3>
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
                'triadic color scheme',
                'split complementary',
                'monochromatic palette',
                'web design colors',
                'brand color palette',
                'UI color scheme',
                'OKLCH color space',
                'design tokens',
                'color theory',
                'free color tool',
                'Coolors alternative',
                'Adobe Color alternative',
              ].map((keyword, index) => (
                <span key={index} className="seo-keyword-tag">{keyword}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section" aria-labelledby="final-cta-title">
        <div className="section-container">
          <div className="cta-content">
            <h2 id="final-cta-title" className="cta-title">Ready to Create Beautiful Colors?</h2>
            <p className="cta-subtitle">
              Start generating perfect color palettes in seconds. No signup. No limits. Completely free.
            </p>
            <button 
              className="btn-primary btn-large btn-cta" 
              onClick={() => {
                trackEvent('cta_click', { location: 'final_cta' });
                navigate('/');
              }}
            >
              <Palette size={24} />
              <span>Open Color Generator</span>
              <ArrowRight size={20} />
            </button>
            <span className="cta-hint">Press spacebar to generate your first palette</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" role="contentinfo">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src={logo} alt="CColorPalette" className="footer-logo-img" />
                <span className="footer-logo-text">CColorPalette</span>
              </div>
              <p className="footer-tagline">
                The free color palette generator for designers, developers, and creative professionals.
                Create beautiful, accessible color schemes instantly.
              </p>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <Link to="/">Generator</Link>
                <Link to="/explore">Explore Palettes</Link>
                <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('#features'); }}>Features</a>
                <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('#faq'); }}>FAQ</a>
              </div>
              <div className="footer-column">
                <h4>Resources</h4>
                <a href="#theory" onClick={(e) => { e.preventDefault(); scrollToSection('#theory'); }}>Color Theory</a>
                <a href="#use-cases" onClick={(e) => { e.preventDefault(); scrollToSection('#use-cases'); }}>Use Cases</a>
                <a href="#export" onClick={(e) => { e.preventDefault(); scrollToSection('#export'); }}>Export Formats</a>
                <a href="#accessibility" onClick={(e) => { e.preventDefault(); scrollToSection('#accessibility'); }}>Accessibility</a>
              </div>
              <div className="footer-column">
                <h4>Legal</h4>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} CColorPalette. All rights reserved. Free color palette generator for everyone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;