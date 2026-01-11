// netlify/edge-functions/inject-og.js
// This edge function injects ALL SEO meta tags for every page request

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/|\/$/g, ''); // Remove leading/trailing slashes
  
  const response = await context.next();
  
  // Only process HTML responses
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  // ============================================
  // GENERATE SEO DATA BASED ON URL PATH
  // ============================================
  
  const seoData = generateSEOData(path, url.origin);
  
  // ============================================
  // BUILD META TAGS HTML
  // ============================================
  
  const metaTagsHtml = buildMetaTags(seoData);
  const structuredDataHtml = buildStructuredData(seoData);
  
  // ============================================
  // INJECT INTO HTML
  // ============================================
  
  const html = await response.text();
  
  // Find the closing </head> tag and inject our meta tags before it
  const modifiedHtml = html.replace(
    '</head>',
    `${metaTagsHtml}\n${structuredDataHtml}\n</head>`
  );
  
  // Also update the <title> tag
  const finalHtml = modifiedHtml.replace(
    /<title>[^<]*<\/title>/,
    `<title>${seoData.title}</title>`
  );
  
  return new Response(finalHtml, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'content-type': 'text/html; charset=utf-8',
    },
  });
};

// ============================================
// SEO DATA GENERATION
// ============================================

function generateSEOData(path, origin) {
  // Default values for homepage/generator
  let data = {
    title: 'CColorPalette - Free Accessible Color Palette Generator',
    description: 'Create beautiful, accessible color palettes with WCAG contrast checking, color blindness simulation, and export to CSS, Tailwind, SCSS. The best free alternative to Coolors.',
    canonicalUrl: origin,
    ogImage: `${origin}/og-image.png`,
    keywords: 'color palette generator, accessible color tool, WCAG contrast checker, color scheme generator, Coolors alternative, Tailwind colors',
    pageType: 'homepage',
    colors: null,
  };

  // ============================================
  // ROUTE: /home (Marketing Landing Page)
  // ============================================
  if (path === 'home') {
    data = {
      ...data,
      title: 'CColorPalette - The Best Free Color Tool for Designers & Developers',
      description: 'Stop logging in to save colors. CColorPalette is the fast, free, no-login color palette generator for Tailwind CSS, web design, and modern creative projects.',
      canonicalUrl: `${origin}/home`,
      pageType: 'landing',
    };
  }
  
  // ============================================
  // ROUTE: /explore (Directory Page)
  // ============================================
  else if (path === 'explore') {
    data = {
      ...data,
      title: 'Explore All Color Palettes | CColorPalette Directory',
      description: 'Browse our complete directory of 500+ curated color palettes. Find the perfect color scheme for your next web design, branding, or creative project.',
      canonicalUrl: `${origin}/explore`,
      pageType: 'directory',
      keywords: 'color palette directory, browse color schemes, curated palettes, design inspiration',
    };
  }
  
  // ============================================
  // ROUTE: /privacy
  // ============================================
  else if (path === 'privacy') {
    data = {
      ...data,
      title: 'Privacy Policy | CColorPalette',
      description: 'Privacy Policy for CColorPalette - Learn how we protect your privacy and handle data on our free color palette generator.',
      canonicalUrl: `${origin}/privacy`,
      pageType: 'legal',
    };
  }
  
  // ============================================
  // ROUTE: /terms
  // ============================================
  else if (path === 'terms') {
    data = {
      ...data,
      title: 'Terms of Service | CColorPalette',
      description: 'Terms of Service for CColorPalette - Understand the terms and conditions for using our free color palette generator.',
      canonicalUrl: `${origin}/terms`,
      pageType: 'legal',
    };
  }
  
  // ============================================
  // ROUTE: /{hex-codes} (Specific Palette Page)
  // ============================================
  else if (isValidPalettePath(path)) {
    const colors = path.split('-').map(h => h.toUpperCase());
    const colorAnalysis = analyzePalette(colors);
    
    data = {
      title: `${colorAnalysis.primaryHueName} Color Palette: ${colors.length} ${colorAnalysis.harmonyName} Shades | CColorPalette`,
      description: `${colorAnalysis.characterDescription} featuring ${colors.length} ${colorAnalysis.harmonyName} colors. Hex codes: ${colors.slice(0, 3).map(c => '#' + c).join(', ')}${colors.length > 3 ? '...' : ''}. Export to CSS, Tailwind, SCSS.`,
      canonicalUrl: `${origin}/${path}`,
      ogImage: `${origin}/.netlify/functions/og-image?colors=${path}`,
      keywords: generatePaletteKeywords(colors, colorAnalysis),
      pageType: 'palette',
      colors: colors,
      colorAnalysis: colorAnalysis,
    };
  }
  
  // ============================================
  // ROUTE: / (Root - Generator with random palette)
  // ============================================
  else if (path === '') {
    // Root generator page
    data.canonicalUrl = origin;
  }

  return data;
}

// ============================================
// PALETTE ANALYSIS
// ============================================

function isValidPalettePath(path) {
  // Matches: AABBCC or AABBCC-112233 or AABBCC-112233-445566 etc.
  return /^[0-9a-f]{3,6}(-[0-9a-f]{3,6})*$/i.test(path);
}

function analyzePalette(colors) {
  const hsls = colors.map(hexToHsl);
  
  // Get dominant hue
  const dominantHsl = hsls.reduce((prev, curr) => curr.s > prev.s ? curr : prev, hsls[0]);
  const hueInfo = getHueInfo(dominantHsl.h);
  
  // Analyze characteristics
  const avgSaturation = hsls.reduce((a, c) => a + c.s, 0) / hsls.length;
  const avgLightness = hsls.reduce((a, c) => a + c.l, 0) / hsls.length;
  const lightnessRange = Math.max(...hsls.map(c => c.l)) - Math.min(...hsls.map(c => c.l));
  
  // Determine harmony type
  const harmony = detectHarmony(hsls);
  
  // Determine character
  let character = 'balanced';
  if (avgSaturation > 65) character = 'vibrant';
  else if (avgSaturation < 35) character = 'muted';
  else if (avgSaturation < 55 && avgLightness > 72) character = 'pastel';
  else if (avgLightness < 38) character = 'dark';
  else if (avgLightness > 68) character = 'light';
  
  // Build description
  const characterDescriptions = {
    vibrant: 'A bold, high-energy color palette',
    muted: 'A sophisticated, understated color palette',
    pastel: 'A soft, delicate color palette',
    dark: 'A deep, dramatic color palette',
    light: 'A bright, airy color palette',
    balanced: 'A professionally curated color palette',
  };
  
  return {
    primaryHue: hueInfo.primary,
    primaryHueName: capitalize(hueInfo.detailed),
    harmonyName: harmony,
    character: character,
    characterDescription: characterDescriptions[character],
    avgSaturation: Math.round(avgSaturation),
    avgLightness: Math.round(avgLightness),
    lightnessRange: Math.round(lightnessRange),
  };
}

function hexToHsl(hex) {
  // Handle 3-char hex
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: h = 0;
    }
    h *= 360;
  }

  return { h, s: s * 100, l: l * 100 };
}

function getHueInfo(h) {
  const hueMap = [
    { range: [0, 15], primary: 'red', detailed: 'crimson' },
    { range: [15, 40], primary: 'orange', detailed: 'burnt orange' },
    { range: [40, 65], primary: 'yellow', detailed: 'golden' },
    { range: [65, 90], primary: 'green', detailed: 'lime' },
    { range: [90, 150], primary: 'green', detailed: 'emerald' },
    { range: [150, 180], primary: 'teal', detailed: 'teal' },
    { range: [180, 210], primary: 'cyan', detailed: 'cyan' },
    { range: [210, 250], primary: 'blue', detailed: 'azure' },
    { range: [250, 280], primary: 'purple', detailed: 'violet' },
    { range: [280, 320], primary: 'magenta', detailed: 'magenta' },
    { range: [320, 345], primary: 'pink', detailed: 'rose' },
    { range: [345, 360], primary: 'red', detailed: 'ruby' },
  ];

  const normalized = ((h % 360) + 360) % 360;
  return hueMap.find(entry => normalized >= entry.range[0] && normalized < entry.range[1]) || hueMap[0];
}

function detectHarmony(hsls) {
  if (hsls.length < 2) return 'single';

  const hues = hsls.map(c => c.h);
  const pairs = [];

  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      let diff = Math.abs(hues[i] - hues[j]);
      if (diff > 180) diff = 360 - diff;
      pairs.push(diff);
    }
  }

  const maxDiff = Math.max(...pairs);
  const avgDiff = pairs.reduce((a, b) => a + b, 0) / pairs.length;

  if (maxDiff < 25) return 'monochromatic';
  if (maxDiff < 60) return 'analogous';
  if (avgDiff > 100 && avgDiff < 140) return 'triadic';
  if (maxDiff > 150 && maxDiff < 210) return 'complementary';
  if (maxDiff >= 130 && maxDiff <= 170) return 'split-complementary';
  return 'curated';
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function generatePaletteKeywords(colors, analysis) {
  const keywords = [
    `${analysis.primaryHue} color palette`,
    `${analysis.primaryHue} color scheme`,
    `${colors.length} color palette`,
    `${analysis.primaryHue} hex codes`,
    `${analysis.harmonyName} color palette`,
    `${analysis.harmonyName} ${analysis.primaryHue} colors`,
    `${analysis.character} ${analysis.primaryHue} palette`,
    `${analysis.primaryHue} web design colors`,
    `${analysis.primaryHue} branding palette`,
    `${analysis.primaryHue} ui colors`,
    `free color palette generator`,
  ];
  return keywords.join(', ');
}

// ============================================
// BUILD HTML TAGS
// ============================================

function buildMetaTags(seoData) {
  const tags = [];
  
  // Essential Meta
  tags.push(`<meta name="description" content="${escapeHtml(seoData.description)}" />`);
  tags.push(`<meta name="keywords" content="${escapeHtml(seoData.keywords)}" />`);
  tags.push(`<meta name="author" content="CColorPalette" />`);
  tags.push(`<meta name="robots" content="index, follow" />`);
  
  // Canonical
  tags.push(`<link rel="canonical" href="${seoData.canonicalUrl}" />`);
  
  // Open Graph
  tags.push(`<meta property="og:type" content="website" />`);
  tags.push(`<meta property="og:url" content="${seoData.canonicalUrl}" />`);
  tags.push(`<meta property="og:title" content="${escapeHtml(seoData.title)}" />`);
  tags.push(`<meta property="og:description" content="${escapeHtml(seoData.description)}" />`);
  tags.push(`<meta property="og:image" content="${seoData.ogImage}" />`);
  tags.push(`<meta property="og:image:width" content="1200" />`);
  tags.push(`<meta property="og:image:height" content="630" />`);
  tags.push(`<meta property="og:site_name" content="CColorPalette" />`);
  
  // Twitter Card
  tags.push(`<meta name="twitter:card" content="summary_large_image" />`);
  tags.push(`<meta name="twitter:url" content="${seoData.canonicalUrl}" />`);
  tags.push(`<meta name="twitter:title" content="${escapeHtml(seoData.title)}" />`);
  tags.push(`<meta name="twitter:description" content="${escapeHtml(seoData.description)}" />`);
  tags.push(`<meta name="twitter:image" content="${seoData.ogImage}" />`);
  
  return `<!-- SEO Meta Tags (Injected by Edge Function) -->\n${tags.join('\n')}`;
}

function buildStructuredData(seoData) {
  // Base WebApplication schema (for all pages)
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CColorPalette",
    "alternateName": "CColor Palette Generator",
    "url": "https://ccolorpalette.com",
    "description": "Free accessible color palette generator with WCAG contrast checking, color blindness simulation, and export to CSS, Tailwind, SCSS, JSON.",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Color palette generation",
      "WCAG accessibility contrast checker",
      "Color blindness simulation",
      "CSS variables export",
      "Tailwind config export",
      "SCSS variables export",
      "JSON export with metadata",
      "PNG and SVG export",
      "Shareable palette URLs"
    ]
  };

  const schemas = [webAppSchema];
  
  // Add palette-specific schema
  if (seoData.pageType === 'palette' && seoData.colors) {
    const paletteSchema = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": seoData.title,
      "description": seoData.description,
      "url": seoData.canonicalUrl,
      "creator": {
        "@type": "Organization",
        "name": "CColorPalette"
      },
      "keywords": seoData.keywords,
      "about": seoData.colors.map((hex, i) => ({
        "@type": "Thing",
        "name": `Color ${i + 1}`,
        "description": `#${hex}`,
        "identifier": `#${hex}`
      }))
    };
    schemas.push(paletteSchema);
  }
  
  // Add FAQ schema for landing/homepage
  if (seoData.pageType === 'landing' || seoData.pageType === 'homepage') {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is CColorPalette?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CColorPalette is a free online color palette generator that helps designers create accessible color schemes with WCAG contrast checking and color blindness simulation."
          }
        },
        {
          "@type": "Question",
          "name": "Is CColorPalette free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, CColorPalette is completely free to use with no account required. Generate unlimited color palettes and export in any format."
          }
        },
        {
          "@type": "Question",
          "name": "Can I export colors to Tailwind CSS?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, CColorPalette exports directly to Tailwind CSS v4 config format, CSS variables, SCSS variables, JSON with full metadata, and downloadable PNG/SVG files."
          }
        }
      ]
    };
    schemas.push(faqSchema);
  }
  
  return schemas.map(schema => 
    `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
  ).join('\n');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const config = {
  path: "/*"
};