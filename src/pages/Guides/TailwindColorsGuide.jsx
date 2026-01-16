// src/pages/Guides/TailwindColorsGuide.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Palette, 
  Code,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Wind,
  FileCode
} from 'lucide-react';
import { 
  SEOArticleLayout, 
  PageHeader,
} from '../../components/SEOLayout';

const TAILWIND_V4_EXAMPLE = `/* Your CSS file */
@import "tailwindcss";

@theme {
  /* Primary brand colors */
  --color-primary: #2563EB;
  --color-primary-light: #3B82F6;
  --color-primary-dark: #1D4ED8;
  
  /* Accent colors */
  --color-accent: #F59E0B;
  --color-accent-light: #FBBF24;
  
  /* Neutrals */
  --color-surface: #F8FAFC;
  --color-text: #0F172A;
  --color-muted: #64748B;
}

/* Usage in HTML: */
/* <div class="bg-primary text-white"> */
/* <button class="bg-accent hover:bg-accent-light"> */`;

const TAILWIND_V3_CONFIG = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        'primary': {
          DEFAULT: '#2563EB',
          light: '#3B82F6',
          dark: '#1D4ED8',
        },
        // Accent colors
        'accent': {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
        },
        // Neutrals
        'surface': '#F8FAFC',
        'muted': '#64748B',
      },
    },
  },
}

// Usage in HTML:
// <div class="bg-primary text-white">
// <button class="bg-accent hover:bg-accent-light">`;

const TAILWIND_V3_CSS = `/* styles.css */
@layer base {
  :root {
    --color-primary: 37 99 235;
    --color-accent: 245 158 11;
    --color-surface: 248 250 252;
  }
}

/* tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
      },
    },
  },
}

// Supports opacity modifiers: bg-primary/50`;

const COLOR_SCALE_EXAMPLE = `// Creating a full color scale
colors: {
  'brand': {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Base color
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
  },
}

// Usage: bg-brand-500, text-brand-900, border-brand-200`;

const SEMANTIC_NAMING = `// Semantic color naming
colors: {
  // Actions
  'action': {
    primary: '#2563EB',
    secondary: '#64748B', 
    danger: '#DC2626',
    success: '#16A34A',
  },
  
  // Backgrounds
  'bg': {
    default: '#FFFFFF',
    subtle: '#F8FAFC',
    muted: '#F1F5F9',
    inverse: '#0F172A',
  },
  
  // Text
  'text': {
    default: '#0F172A',
    muted: '#64748B',
    subtle: '#94A3B8',
    inverse: '#FFFFFF',
  },
  
  // Borders
  'border': {
    default: '#E2E8F0',
    strong: '#CBD5E1',
  },
}`;

function TailwindColorsGuide() {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyCode = async (code, id) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "How to Use Custom Colors in Tailwind CSS",
    "description": "Complete guide to adding custom color palettes to Tailwind CSS v3 and v4. Learn configuration, naming conventions, and best practices.",
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
    { label: 'Tailwind CSS Colors' }
  ];

  const relatedLinks = [
    { href: '/', label: 'Palette Generator', icon: Palette },
    { href: '/guides/color-theory', label: 'Color Theory Guide', icon: BookOpen },
    { href: '/guides/web-design-colors', label: 'Web Design Colors', icon: BookOpen },
    { href: '/guides/brand-color-palette', label: 'Brand Color Guide', icon: BookOpen },
  ];

  const CodeBlock = ({ code, id, title }) => (
    <div className="code-block">
      {title && <div className="code-title">{title}</div>}
      <div className="code-content">
        <pre><code>{code}</code></pre>
        <button 
          className="code-copy-btn"
          onClick={() => copyCode(code, id)}
        >
          {copiedCode === id ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <SEOArticleLayout
      title="Tailwind CSS Custom Colors Guide - Configuration & Best Practices"
      description="Learn how to add custom color palettes to Tailwind CSS v3 and v4. Includes configuration examples, naming conventions, color scales, and export from palette generators."
      keywords="tailwind css colors, tailwind custom colors, tailwind color palette, tailwind config colors, tailwind v4 colors, tailwind theme colors, tailwind css configuration, tailwind extend colors"
      canonicalPath="/guides/tailwind-css-colors"
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      relatedLinks={relatedLinks}
      lastModified="2025-01-15"
    >
      <PageHeader
        badge="Developer Guide"
        badgeIcon={Wind}
        title="Tailwind CSS Custom Colors: Complete Guide"
        subtitle="Learn how to configure custom color palettes in Tailwind CSS v3 and v4, with naming conventions and best practices."
      />

      {/* Table of Contents */}
      <nav className="article-toc">
        <h2>Table of Contents</h2>
        <ol>
          <li><a href="#overview">Overview</a></li>
          <li><a href="#tailwind-v4">Tailwind CSS v4 (CSS-First)</a></li>
          <li><a href="#tailwind-v3">Tailwind CSS v3 (Config File)</a></li>
          <li><a href="#color-scales">Creating Color Scales</a></li>
          <li><a href="#naming-conventions">Naming Conventions</a></li>
          <li><a href="#export-from-generator">Export from CColorPalette</a></li>
        </ol>
      </nav>

      {/* Overview */}
      <section id="overview" className="article-section">
        <h2>Overview</h2>
        <p>
          Tailwind CSS provides a default color palette, but most projects need custom brand 
          colors. This guide covers how to configure custom colors in both Tailwind v4 (the new 
          CSS-first approach) and v3 (JavaScript config).
        </p>
        <p>
          Our <Link to="/">color palette generator</Link> exports directly to Tailwind format, 
          making it easy to generate harmonious color schemes and integrate them into your project.
        </p>
        
        <div className="article-callout">
          <Wind size={20} />
          <div>
            <strong>Tailwind v4:</strong> Released in late 2024, Tailwind v4 uses a CSS-first 
            configuration approach with <code>@theme</code>. This guide covers both versions.
          </div>
        </div>
      </section>

      {/* Tailwind v4 */}
      <section id="tailwind-v4" className="article-section">
        <h2>Tailwind CSS v4 (CSS-First Configuration)</h2>
        <p>
          Tailwind v4 introduces a new CSS-first approach using <code>@theme</code> directive. 
          Colors are defined directly in your CSS file, making them easier to manage and share.
        </p>

        <CodeBlock 
          code={TAILWIND_V4_EXAMPLE}
          id="v4-example"
          title="Tailwind v4 Color Configuration"
        />

        <h3>Key Benefits of v4 Approach</h3>
        <ul>
          <li><strong>No JavaScript config needed</strong> – Everything in CSS</li>
          <li><strong>Better IDE support</strong> – CSS syntax highlighting works out of the box</li>
          <li><strong>Easier sharing</strong> – Copy/paste CSS between projects</li>
          <li><strong>Dynamic theming</strong> – Change colors with CSS custom properties</li>
        </ul>
      </section>

      {/* Tailwind v3 */}
      <section id="tailwind-v3" className="article-section">
        <h2>Tailwind CSS v3 (Config File)</h2>
        <p>
          In Tailwind v3, colors are configured in <code>tailwind.config.js</code>. You can 
          either extend the default palette or replace it entirely.
        </p>

        <h3>Method 1: Extend Colors</h3>
        <CodeBlock 
          code={TAILWIND_V3_CONFIG}
          id="v3-config"
          title="tailwind.config.js - Extending Colors"
        />

        <h3>Method 2: CSS Variables (Supports Opacity)</h3>
        <p>
          For opacity modifier support (e.g., <code>bg-primary/50</code>), use CSS variables 
          with RGB values:
        </p>
        <CodeBlock 
          code={TAILWIND_V3_CSS}
          id="v3-css"
          title="CSS Variables with Opacity Support"
        />
      </section>

      {/* Color Scales */}
      <section id="color-scales" className="article-section">
        <h2>Creating Color Scales</h2>
        <p>
          For maximum flexibility, create full color scales (50-950) for your primary colors. 
          This gives you tints and shades for different use cases.
        </p>

        <CodeBlock 
          code={COLOR_SCALE_EXAMPLE}
          id="scale-example"
          title="Full Color Scale (50-950)"
        />

        <p>
          Use our <Link to="/">palette generator's</Link> shade picker to generate complete 
          color scales from any base color, then export directly to Tailwind format.
        </p>
      </section>

      {/* Naming Conventions */}
      <section id="naming-conventions" className="article-section">
        <h2>Naming Conventions</h2>
        <p>
          Good naming makes your color system maintainable. There are two main approaches:
        </p>

        <h3>1. Semantic Naming (Recommended)</h3>
        <p>
          Name colors by their purpose, not their appearance. This makes it easier to change 
          colors without updating class names throughout your project.
        </p>
        
        <CodeBlock 
          code={SEMANTIC_NAMING}
          id="semantic"
          title="Semantic Color Naming"
        />

        <h3>2. Color-Based Naming</h3>
        <p>
          Name colors by their actual color (e.g., <code>blue-500</code>, <code>emerald-600</code>). 
          This is simpler but less flexible when rebranding.
        </p>

        <h3>Best Practices</h3>
        <ul>
          <li>Use semantic names for UI colors (primary, secondary, danger, success)</li>
          <li>Use color names for decorative/brand colors if needed</li>
          <li>Always include hover/focus state colors</li>
          <li>Document your color system for team reference</li>
        </ul>
      </section>

      {/* Export from Generator */}
      <section id="export-from-generator" className="article-section">
        <h2>Export from CColorPalette</h2>
        <p>
          Our <Link to="/">palette generator</Link> exports directly to Tailwind format. 
          Here's how to use it:
        </p>

        <ol className="steps-list">
          <li>
            <strong>Generate or customize your palette</strong> using the palette generator
          </li>
          <li>
            <strong>Click the Export button</strong> in the toolbar
          </li>
          <li>
            <strong>Select "Tailwind"</strong> from the export options
          </li>
          <li>
            <strong>Choose your version</strong> (v4 CSS, v3 Config, or v3 Layer)
          </li>
          <li>
            <strong>Select naming scheme</strong> (Smart, Semantic, Numbered, or Indexed)
          </li>
          <li>
            <strong>Copy and paste</strong> into your project
          </li>
        </ol>

        <p>
          The export includes intelligent color names based on the actual colors, making 
          your code more readable than generic names like "color-1" or "color-2".
        </p>
      </section>

      {/* CTA */}
      <section className="article-cta">
        <h2>Generate Tailwind-Ready Palettes</h2>
        <p>
          Create harmonious color palettes and export them directly to Tailwind CSS format.
        </p>
        <Link to="/" className="article-cta-btn">
          <Palette size={20} />
          Open Palette Generator
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* External Resources */}
      <section className="article-section">
        <h2>External Resources</h2>
        <ul className="resource-list">
          <li>
            <a href="https://tailwindcss.com/docs/customizing-colors" target="_blank" rel="noopener noreferrer">
              Tailwind CSS Official Docs - Customizing Colors <ExternalLink size={12} />
            </a>
          </li>
          <li>
            <a href="https://tailwindcss.com/blog/tailwindcss-v4-alpha" target="_blank" rel="noopener noreferrer">
              Tailwind CSS v4 Announcement <ExternalLink size={12} />
            </a>
          </li>
        </ul>
      </section>

      {/* Related Articles */}
      <section className="article-related">
        <h2>Continue Learning</h2>
        <div className="related-articles-grid">
          <Link to="/guides/color-theory" className="related-article-card">
            <h3>Color Theory</h3>
            <p>Create harmonious palettes for your project.</p>
          </Link>
          <Link to="/guides/web-design-colors" className="related-article-card">
            <h3>Web Design Colors</h3>
            <p>Color best practices for web applications.</p>
          </Link>
          <Link to="/guides/accessibility-wcag" className="related-article-card">
            <h3>Accessibility</h3>
            <p>Ensure your Tailwind colors are accessible.</p>
          </Link>
        </div>
      </section>
    </SEOArticleLayout>
  );
}

export default TailwindColorsGuide;