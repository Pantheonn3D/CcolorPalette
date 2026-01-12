// scripts/generate-sitemap.cjs
// Run with: node scripts/generate-sitemap.cjs
process.env.GOOGLE_CLOUD_DISABLE_GRPC = 'true'; 
process.env.GOOGLE_CLOUD_USE_REST = 'true';

require('dotenv').config(); 
const fs = require('fs');
const path = require('path');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const DOMAIN = 'https://ccolorpalette.com';
const MIN_QUALITY_SCORE = 60; // Palettes below this score won't be indexed
const MAX_PALETTES = 5000;    // Hard cap to prevent massive sitemaps

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

// Check if colors follow a harmony (Monochromatic, Analogous, etc)
function scoreHarmony(hsls) {
  if (hsls.length < 2) return 50;
  const hues = hsls.map(c => c.h);
  
  // Calculate max distance between any two hues
  let maxDiff = 0;
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      let diff = Math.abs(hues[i] - hues[j]);
      if (diff > 180) diff = 360 - diff;
      if (diff > maxDiff) maxDiff = diff;
    }
  }

  // Heuristics for harmonies
  if (maxDiff < 30) return 90; // Monochromatic (Very cohesive)
  if (maxDiff < 60) return 85; // Analogous (Pleasing)
  if (maxDiff > 150 && maxDiff < 210) return 80; // Complementary
  
  return 60; // Random/Custom
}

// Ensure text is readable on at least one color
function scoreAccessibility(hexColors) {
  let bestContrast = 0;
  // Check contrast against black/white for text usage
  for (const hex of hexColors) {
    const onWhite = wcagContrastRatio(hex, 'FFFFFF');
    const onBlack = wcagContrastRatio(hex, '000000');
    bestContrast = Math.max(bestContrast, onWhite, onBlack);
  }
  
  if (bestContrast >= 7) return 100; // AAA
  if (bestContrast >= 4.5) return 85; // AA
  if (bestContrast >= 3) return 60; // Large Text AA
  return 30; // Poor accessibility
}

function calculateQualityScore(paletteString) {
  try {
    const hexColors = paletteString.split('-');
    
    // 1. Basic Format Validation
    if (hexColors.length < 2 || hexColors.length > 10) return 0;
    if (!hexColors.every(h => /^[0-9A-Fa-f]{6}$/.test(h))) return 0;

    // 2. Duplicate Check (Penalty for repetitive colors)
    const uniqueColors = new Set(hexColors);
    if (uniqueColors.size < hexColors.length) return 40; 

    // 3. Calculate Metrics
    const hsls = hexColors.map(hexToHsl);
    const harmonyScore = scoreHarmony(hsls);
    const a11yScore = scoreAccessibility(hexColors);

    // 4. Weighted Final Score
    // Harmony (40%) + Accessibility (40%) + Base (20%)
    const finalScore = (harmonyScore * 0.4) + (a11yScore * 0.4) + 20;
    
    return Math.round(finalScore);
  } catch (e) {
    return 0; // Invalid palette
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
    
    // Regex to extract array from "export const DIRECTORY_PALETTES = [...]"
    const arrayMatch = fileContent.match(/export\s+const\s+DIRECTORY_PALETTES\s*=\s*\[([\s\S]*?)\]/);
    
    if (!arrayMatch || !arrayMatch[1]) return [];
    
    // Extract strings inside quotes
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
  // Graceful fallback if credentials aren't set
  if (!process.env.GA4_PROPERTY_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    console.log('ℹSkipping GA4: Missing env variables (GA4_PROPERTY_ID or GOOGLE_APPLICATION_CREDENTIALS_JSON)');
    return new Set();
  }

  try {
    // Parse JSON string from Env Var
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });

    console.log('Connecting to Google Analytics...');
    
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      limit: 2000 // Check last 2000 active pages
    });

    const discovered = new Set();
    
    if (response.rows) {
      response.rows.forEach(row => {
        const pagePath = row.dimensionValues[0].value;
        // Regex to find palette URLs like /3F1349-BB8FE2-31C53C...
        // Matches 6-digit hex codes separated by hyphens (at least 2 colors)
        const match = pagePath.match(/\/([0-9A-Fa-f]{6}(?:-[0-9A-Fa-f]{6})+)/);
        
        if (match) {
          const paletteCode = match[1].toUpperCase();
          // Filter out obvious junk
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
// 4. MAIN GENERATOR
// ============================================

async function generateSitemap() {
  console.log('\nStarting Dynamic Sitemap Generation...\n');

  // 1. Get Local Palettes
  const localPalettes = readDirectoryPalettes();
  console.log(`Loaded ${localPalettes.length} curated palettes from file.`);

  // 2. Get GA4 Palettes
  const ga4Palettes = await fetchGA4EngagementData();
  console.log(`Discovered ${ga4Palettes.size} active palettes from GA4.`);

  // 3. Merge & Deduplicate
  const combinedSet = new Set([...localPalettes, ...ga4Palettes]);
  console.log(`Total candidates: ${combinedSet.size}`);
  
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

  // Cap size if necessary
  const exportList = finalPalettes.slice(0, MAX_PALETTES);
  
  console.log(`Quality Check: Approved ${finalPalettes.length} (Rejected ${rejectedCount} low quality).`);
  if (finalPalettes.length > MAX_PALETTES) {
    console.log(`Capped at ${MAX_PALETTES} palettes.`);
  }

  // 5. Generate XML
  const today = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.w3.org/2000/sitemaps/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Core Pages -->
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${DOMAIN}/home</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${DOMAIN}/explore</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${DOMAIN}/privacy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${DOMAIN}/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- Generated Palettes (${exportList.length}) -->
`;

  exportList.forEach(palette => {
    // Generate an OG Image URL for the image sitemap extension (great for Google Images)
    const ogUrl = `${DOMAIN}/.netlify/functions/og-image?colors=${palette}`;
    
    xml += `  <url>
    <loc>${DOMAIN}/${palette}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <image:image>
      <image:loc>${ogUrl}</image:loc>
      <image:title>Color Palette ${palette.split('-').slice(0, 3).map(c => '#' + c).join(' ')}</image:title>
    </image:image>
  </url>
`;
  });

  xml += `</urlset>`;

  // 6. Generate JSON for the React Frontend
  // This saves the exact same list used in the sitemap to your src folder
  const jsonOutputPath = path.join(__dirname, '../src/data/generated-palettes.json');
  
  fs.writeFileSync(jsonOutputPath, JSON.stringify(exportList, null, 2));
  console.log(`React Data successfully written to ${jsonOutputPath}`);
  
  // ---------------------------------------------------------

  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, xml);
  
  console.log(`\nSitemap successfully written to ${outputPath}`);
}

// Run safely
generateSitemap().catch(error => {
  console.error('Fatal Error:', error);
  process.exit(1);
});