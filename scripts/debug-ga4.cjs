// scripts/debug-ga4.cjs
// Run with: node scripts/debug-ga4.cjs

require('dotenv').config();
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

async function debugGA4() {
  // 1. Check Credentials
  if (!process.env.GA4_PROPERTY_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    console.error('❌ Error: Missing credentials in .env file.');
    console.log('   Make sure GA4_PROPERTY_ID and GOOGLE_APPLICATION_CREDENTIALS_JSON are set.');
    return;
  }

  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });

    console.log('📡 Connecting to Google Analytics...');
    console.log(`   Property ID: ${process.env.GA4_PROPERTY_ID}`);
    console.log('   Time Range: Last 30 Days');

    // 2. Fetch Data
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      limit: 100 // Show top 100 pages
    });

    console.log('\n--- RAW URL ANALYSIS ---');

    if (!response.rows || response.rows.length === 0) {
      console.log('⚠️  No traffic data returned from GA4.');
      console.log('   (This is normal if the property was just connected. Data takes 24-48h to appear)');
      return;
    }

    // 3. Analyze Each URL
    response.rows.forEach(row => {
      const rawPath = row.dimensionValues[0].value;
      const views = row.metricValues[0].value;
      
      // This is the EXACT regex used in your main sitemap script
      const match = rawPath.match(/\/([0-9A-Fa-f]{6}(?:-[0-9A-Fa-f]{6})+)/);

      if (match) {
        const extractedCode = match[1].toUpperCase();
        console.log(`✅ MATCHED:  "${rawPath}" (${views} views)`);
        console.log(`   -> Extracted for Sitemap: "${extractedCode}"`);
      } else {
        // These are pages like /explore, /home, or bad URLs
        console.log(`❌ IGNORED:  "${rawPath}" (${views} views)`);
      }
    });

    console.log('\n--------------------------');
    console.log('ℹ️  "MATCHED" means it would be added to your sitemap.');
    console.log('ℹ️  "IGNORED" means the script correctly identified it as a non-palette page.');

  } catch (error) {
    console.error('❌ API Error:', error.message);
  }
}

debugGA4();