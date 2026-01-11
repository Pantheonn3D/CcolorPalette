// scripts/generate-sitemap.js
// Run with: node scripts/generate-sitemap.js

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://ccolorpalette.com';

// ============================================
// CONFIGURATION (Preserve your existing values)
// ============================================
const MIN_QUALITY_SCORE = 0; // Set your existing value
const MAX_PALETTES = 10000;  // Set your existing value

// ============================================
// 1. READ PALETTES FROM LOCAL SOURCE FILE
// ============================================

/**
 * Reads palette codes from src/data/paletteDirectory.js
 * Uses regex to extract the array since the file uses ES6 export syntax
 * which cannot be directly imported in a Node CommonJS script.
 */
function readDirectoryPalettes() {
  try {
    const filePath = path.join(__dirname, '../src/data/paletteDirectory.js');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Regex to match: export const DIRECTORY_PALETTES = ["...", "...", ...]
    // Captures the content inside the square brackets
    const arrayMatch = fileContent.match(
      /export\s+const\s+DIRECTORY_PALETTES\s*=\s*\[([\s\S]*?)\]/
    );

    if (!arrayMatch || !arrayMatch[1]) {
      console.warn('⚠️  Could not parse DIRECTORY_PALETTES from paletteDirectory.js');
      return [];
    }

    // Extract all quoted strings (handles both "..." and '...')
    const quotedStrings = arrayMatch[1].match(/["']([^"']+)["']/g);

    if (!quotedStrings) {
      console.warn('⚠️  No palette strings found in DIRECTORY_PALETTES');
      return [];
    }

    // Remove surrounding quotes from each match
    return quotedStrings.map(s => s.slice(1, -1));
  } catch (error) {
    console.error('❌ Failed to read paletteDirectory.js:', error.message);
    return [];
  }
}

// ============================================
// 2. GA4 ENGAGEMENT DATA FETCHER
// ============================================

/**
 * Fetches engagement data from GA4.
 * Returns a Map where keys are palette codes (e.g., "AABBCC-112233")
 * and values contain engagement metrics.
 * 
 * TODO: Replace this placeholder with your actual GA4 API implementation.
 */
async function fetchGA4EngagementData() {
  // -------------------------------------------------------
  // PLACEHOLDER: Implement your actual GA4 API call here
  // -------------------------------------------------------
  // Example structure of what this should return:
  // return new Map([
  //   ["AABBCC-112233-445566", { pageViews: 150, avgDuration: 45 }],
  //   ["FF0000-00FF00-0000FF", { pageViews: 89, avgDuration: 30 }],
  // ]);

  // For now, return empty Map (no GA4 discoveries)
  console.log('   (GA4 integration not yet implemented - using placeholder)');
  return new Map();
}

// ============================================
// 3. VALIDATION HELPERS
// ============================================

/**
 * Validates that a palette code matches the expected format.
 * Format: XXXXXX-XXXXXX-... where X is a hex character (0-9, A-F)
 * Must have at least 2 color segments.
 */
function isValidPaletteCode(code) {
  if (!code || typeof code !== 'string') return false;
  
  const segments = code.split('-');
  
  // Must have at least 2 colors
  if (segments.length < 2) return false;
  
  // Each segment must be exactly 6 hex characters
  return segments.every(segment => /^[0-9A-Fa-f]{6}$/.test(segment));
}

// ============================================
// 4. QUALITY FILTER (Preserve your existing logic)
// ============================================

/**
 * Filters palettes based on quality criteria.
 * Replace or extend this with your existing getQualityPalettes logic.
 */
function getQualityPalettes(palettes) {
  // Your existing quality filtering logic goes here
  // For now, just return all valid palettes up to MAX_PALETTES
  return palettes.slice(0, MAX_PALETTES);
}

// ============================================
// 5. MAIN SITEMAP GENERATOR
// ============================================

async function generateSitemap() {
  console.log('🎨 Starting dynamic sitemap generation...\n');

  // --- Step 1: Read from local paletteDirectory.js ---
  console.log('📂 Step 1: Reading local palette directory...');
  const directoryPalettes = readDirectoryPalettes();
  console.log(`   ✓ Found ${directoryPalettes.length} palettes in paletteDirectory.js\n`);

  // --- Step 2: Fetch GA4 discovered palettes ---
  console.log('📊 Step 2: Fetching GA4 engagement data...');
  const ga4EngagementMap = await fetchGA4EngagementData();
  const ga4PaletteCodes = Array.from(ga4EngagementMap.keys());
  console.log(`   ✓ Found ${ga4PaletteCodes.length} palettes from GA4\n`);

  // --- Step 3: Combine, deduplicate, and validate ---
  console.log('🔄 Step 3: Combining and deduplicating...');
  
  // Use a Set for automatic deduplication
  const paletteSet = new Set();
  
  // Add all directory palettes first
  for (const code of directoryPalettes) {
    if (isValidPaletteCode(code)) {
      paletteSet.add(code);
    }
  }
  const afterDirectory = paletteSet.size;

  // Add GA4-discovered palettes that aren't already in the set
  let newFromGA4 = 0;
  for (const code of ga4PaletteCodes) {
    if (isValidPaletteCode(code) && !paletteSet.has(code)) {
      paletteSet.add(code);
      newFromGA4++;
      console.log(`   + Discovered from GA4: ${code}`);
    }
  }

  console.log(`   ✓ ${afterDirectory} valid palettes from directory`);
  console.log(`   ✓ ${newFromGA4} new palettes discovered from GA4`);
  
  // Convert Set to Array
  const ALL_PALETTES = Array.from(paletteSet);
  console.log(`   ✓ Total unique palettes: ${ALL_PALETTES.length}\n`);

  // --- Step 4: Apply quality filters ---
  console.log('⭐ Step 4: Applying quality filters...');
  const qualityPalettes = getQualityPalettes(ALL_PALETTES);
  console.log(`   ✓ ${qualityPalettes.length} palettes passed quality check\n`);

  // --- Step 5: Generate Sitemap XML ---
  console.log('📝 Step 5: Generating sitemap XML...');
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

  <!-- Palette Pages -->
`;

  qualityPalettes.forEach(palette => {
    xml += `  <url>
    <loc>${DOMAIN}/${palette}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <image:image>
      <image:loc>${DOMAIN}/.netlify/functions/og-image?colors=${palette}</image:loc>
      <image:title>Color Palette ${palette.split('-').slice(0, 2).map(c => '#' + c).join(' ')}</image:title>
    </image:image>
  </url>
`;
  });

  xml += `</urlset>`;

  // Write to file
  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, xml);

  // Final summary
  const totalUrls = qualityPalettes.length + 5; // 5 core pages
  console.log(`\n✅ Sitemap generated successfully!`);
  console.log(`   📍 Output: ${outputPath}`);
  console.log(`   📊 Total URLs: ${totalUrls}`);
  console.log(`      - Core pages: 5`);
  console.log(`      - Palette pages: ${qualityPalettes.length}`);
}

// ============================================
// RUN
// ============================================
generateSitemap().catch(error => {
  console.error('❌ Sitemap generation failed:', error);
  process.exit(1);
});