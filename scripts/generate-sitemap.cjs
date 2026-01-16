// scripts/generate-sitemap.cjs
// Run with: node scripts/generate-sitemap.cjs
process.env.GOOGLE_CLOUD_DISABLE_GRPC = 'true'; 
process.env.GOOGLE_CLOUD_USE_REST = 'true';

require('dotenv').config(); 
const fs = require('fs');
const path = require('path');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const DOMAIN = 'https://ccolorpalette.com';
const MIN_QUALITY_SCORE = 60;
const MAX_PALETTES = 5000;

// ============================================
// STATIC PAGES CONFIGURATION
// ============================================

const STATIC_PAGES = [
  // Core Pages
  { path: '/', changefreq: 'daily', priority: 1.0 },
  { path: '/home', changefreq: 'weekly', priority: 0.9 },
  { path: '/explore', changefreq: 'daily', priority: 0.9 },
  
  // Guides (High SEO Value)
  { path: '/guides/color-theory', changefreq: 'monthly', priority: 0.8 },
  { path: '/guides/accessibility-wcag', changefreq: 'monthly', priority: 0.8 },
  { path: '/guides/tailwind-css-colors', changefreq: 'monthly', priority: 0.8 },
  { path: '/guides/brand-color-palette', changefreq: 'monthly', priority: 0.8 },
  { path: '/guides/color-psychology', changefreq: 'monthly', priority: 0.8 },
  { path: '/guides/web-design-colors', changefreq: 'monthly', priority: 0.8 },
  
  // Tools
  { path: '/tools/color-converter', changefreq: 'monthly', priority: 0.7 },
  { path: '/tools/contrast-checker', changefreq: 'monthly', priority: 0.7 },
  
  // Resources
  { path: '/glossary', changefreq: 'monthly', priority: 0.7 },
  { path: '/sitemap', changefreq: 'weekly', priority: 0.5 },
  
  // Legal
  { path: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { path: '/terms', changefreq: 'yearly', priority: 0.3 },
];

// Palette Discovery Pages (Topic Clusters)
const COLOR_FAMILIES = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'teal'];
const MOODS = ['vibrant', 'pastel', 'muted', 'dark', 'warm', 'cool', 'earthy', 'elegant', 'playful', 'bright', 'moody', 'neon', 'retro', 'soft'];
const INDUSTRIES = ['technology', 'healthcare', 'finance', 'food', 'fashion', 'education', 'realestate', 'entertainment'];

// ============================================
// 1. COLOR MATH & SCORING UTILITIES
// ============================================

function hexToHsl(hex) {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) { h = s = 0; } 
  else {
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
}

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const r = srgbToLinear(parseInt(hex.slice(0, 2), 16) / 255);
  const g = srgbToLinear(parseInt(hex.slice(2, 4), 16) / 255);
  const b = srgbToLinear(parseInt(hex.slice(4, 6), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function wcagContrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function scoreHarmony(hsls) {
  if (hsls.length < 2) return 50;
  const hues = hsls.map(c => c.h);
  
  let maxDiff = 0;
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      let diff = Math.abs(hues[i] - hues[j]);
      if (diff > 180) diff = 360 - diff;
      if (diff > maxDiff) maxDiff = diff;
    }
  }

  if (maxDiff < 30) return 90;
  if (maxDiff < 60) return 85;
  if (maxDiff > 150 && maxDiff < 210) return 80;
  
  return 60;
}

function scoreAccessibility(hexColors) {
  let bestContrast = 0;
  for (const hex of hexColors) {
    const onWhite = wcagContrastRatio(hex, 'FFFFFF');
    const onBlack = wcagContrastRatio(hex, '000000');
    bestContrast = Math.max(bestContrast, onWhite, onBlack);
  }
  
  if (bestContrast >= 7) return 100;
  if (bestContrast >= 4.5) return 85;
  if (bestContrast >= 3) return 60;
  return 30;
}

function calculateQualityScore(paletteString) {
  try {
    const hexColors = paletteString.split('-');
    
    if (hexColors.length < 2 || hexColors.length > 10) return 0;
    if (!hexColors.every(h => /^[0-9A-Fa-f]{6}$/.test(h))) return 0;

    const uniqueColors = new Set(hexColors);
    if (uniqueColors.size < hexColors.length) return 40; 

    const hsls = hexColors.map(hexToHsl);
    const harmonyScore = scoreHarmony(hsls);
    const a11yScore = scoreAccessibility(hexColors);

    const finalScore = (harmonyScore * 0.4) + (a11yScore * 0.4) + 20;
    
    return Math.round(finalScore);
  } catch (e) {
    return 0;
  }
}

// ============================================
// 2. READ LOCAL SOURCE FILE
// ============================================

function readDirectoryPalettes() {
  try {
    const filePath = path.join(__dirname, '../src/data/paletteDirectory.js');
    if (!fs.existsSync(filePath)) {
      console.warn('Local directory file not found.');
      return [];
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const arrayMatch = fileContent.match(/export\s+const\s+DIRECTORY_PALETTES\s*=\s*\[([\s\S]*?)\]/);
    
    if (!arrayMatch || !arrayMatch[1]) return [];
    
    const quotedStrings = arrayMatch[1].match(/["']([^"']+)["']/g);
    return quotedStrings ? quotedStrings.map(s => s.slice(1, -1)) : [];
  } catch (error) {
    console.error('Failed to read local directory:', error.message);
    return [];
  }
}

// ============================================
// 3. GA4 ENGAGEMENT DATA
// ============================================

async function fetchGA4EngagementData() {
  if (!process.env.GA4_PROPERTY_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    console.log('ℹ️ Skipping GA4: Missing env variables');
    return new Set();
  }

  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });

    console.log('📊 Connecting to Google Analytics...');
    
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      limit: 2000
    });

    const discovered = new Set();
    
    if (response.rows) {
      response.rows.forEach(row => {
        const pagePath = row.dimensionValues[0].value;
        const match = pagePath.match(/\/([0-9A-Fa-f]{6}(?:-[0-9A-Fa-f]{6})+)/);
        
        if (match) {
          const paletteCode = match[1].toUpperCase();
          if (paletteCode.length >= 13) { 
            discovered.add(paletteCode);
          }
        }
      });
    }

    return discovered;
  } catch (error) {
    console.error('GA4 Fetch Error:', error.message);
    return new Set();
  }
}

// ============================================
// 4. XML GENERATION HELPERS
// ============================================

function generateUrlEntry(pagePath, lastmod, changefreq, priority, imageData = null) {
  let xml = `  <url>
    <loc>${DOMAIN}${pagePath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`;
  
  if (imageData) {
    xml += `
    <image:image>
      <image:loc>${imageData.loc}</image:loc>
      <image:title>${escapeXml(imageData.title)}</image:title>
    </image:image>`;
  }
  
  xml += `
  </url>
`;
  return xml;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================
// 5. MAIN GENERATOR
// ============================================

async function generateSitemap() {
  console.log('\n🚀 Starting Dynamic Sitemap Generation...\n');

  const today = new Date().toISOString().split('T')[0];

  // 1. Get Local Palettes
  const localPalettes = readDirectoryPalettes();
  console.log(`📁 Loaded ${localPalettes.length} curated palettes from file.`);

  // 2. Get GA4 Palettes
  const ga4Palettes = await fetchGA4EngagementData();
  console.log(`📈 Discovered ${ga4Palettes.size} active palettes from GA4.`);

  // 3. Merge & Deduplicate
  const combinedSet = new Set([...localPalettes, ...ga4Palettes]);
  console.log(`🔀 Total candidates: ${combinedSet.size}`);
  
  // 4. Score & Filter
  const finalPalettes = [];
  let rejectedCount = 0;

  for (const code of combinedSet) {
    const score = calculateQualityScore(code);
    if (score >= MIN_QUALITY_SCORE) {
      finalPalettes.push(code);
    } else {
      rejectedCount++;
    }
  }

  const exportList = finalPalettes.slice(0, MAX_PALETTES);
  
  console.log(`✅ Quality Check: Approved ${finalPalettes.length} (Rejected ${rejectedCount} low quality).`);
  if (finalPalettes.length > MAX_PALETTES) {
    console.log(`⚠️ Capped at ${MAX_PALETTES} palettes.`);
  }

  // 5. Generate XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- ============================================
       STATIC PAGES
       ============================================ -->
`;

  // Add static pages
  for (const page of STATIC_PAGES) {
    xml += generateUrlEntry(page.path, today, page.changefreq, page.priority);
  }

  // Add color family pages
  xml += `
  <!-- ============================================
       PALETTES BY COLOR (${COLOR_FAMILIES.length} pages)
       ============================================ -->
`;
  for (const color of COLOR_FAMILIES) {
    xml += generateUrlEntry(
      `/palettes/color/${color}`,
      today,
      'weekly',
      0.7
    );
  }

  // Add mood pages
  xml += `
  <!-- ============================================
       PALETTES BY MOOD (${MOODS.length} pages)
       ============================================ -->
`;
  for (const mood of MOODS) {
    xml += generateUrlEntry(
      `/palettes/mood/${mood}`,
      today,
      'weekly',
      0.7
    );
  }

  // Add industry pages
  xml += `
  <!-- ============================================
       PALETTES BY INDUSTRY (${INDUSTRIES.length} pages)
       ============================================ -->
`;
  for (const industry of INDUSTRIES) {
    xml += generateUrlEntry(
      `/palettes/industry/${industry}`,
      today,
      'weekly',
      0.7
    );
  }

  // Add dynamic palette pages
  xml += `
  <!-- ============================================
       GENERATED PALETTES (${exportList.length} pages)
       ============================================ -->
`;

  for (const palette of exportList) {
    const ogUrl = `${DOMAIN}/.netlify/functions/og-image?colors=${palette}`;
    const colorPreview = palette.split('-').slice(0, 3).map(c => '#' + c).join(' ');
    
    xml += generateUrlEntry(
      `/${palette}`,
      today,
      'monthly',
      0.6,
      {
        loc: ogUrl,
        title: `Color Palette ${colorPreview}`
      }
    );
  }

  xml += `</urlset>`;

  // 6. Calculate totals
  const totalPages = STATIC_PAGES.length + COLOR_FAMILIES.length + MOODS.length + INDUSTRIES.length + exportList.length;

  // 7. Generate JSON for the React Frontend
  const jsonOutputPath = path.join(__dirname, '../src/data/generated-palettes.json');
  fs.writeFileSync(jsonOutputPath, JSON.stringify(exportList, null, 2));
  console.log(`📝 React Data written to ${jsonOutputPath}`);

  // 8. Write sitemap
  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, xml);
  
  console.log(`\n✨ Sitemap successfully written to ${outputPath}`);
  console.log(`📊 Total URLs: ${totalPages}`);
  console.log(`   - Static pages: ${STATIC_PAGES.length}`);
  console.log(`   - Color pages: ${COLOR_FAMILIES.length}`);
  console.log(`   - Mood pages: ${MOODS.length}`);
  console.log(`   - Industry pages: ${INDUSTRIES.length}`);
  console.log(`   - Palette pages: ${exportList.length}`);
}

// Run safely
generateSitemap().catch(error => {
  console.error('❌ Fatal Error:', error);
  process.exit(1);
});