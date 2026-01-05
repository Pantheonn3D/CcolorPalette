export default async (request, context) => {
    const url = new URL(request.url);
    
    // Get path and remove leading/trailing slashes
    const path = url.pathname.replace(/^\/|\/$/g, '');
  
    // Regex to match: 
    // 1. Starts with 3 or 6 char hex
    // 2. Followed by hyphens and more hexes
    // 3. Case insensitive (i flag)
    const paletteRegex = /^([0-9a-f]{3,6})(-[0-9a-f]{3,6})+$/i;
    
    const isPalette = paletteRegex.test(path);
  
    // DEBUG: Check your Netlify Function logs to see this
    console.log(`[Edge] Checking path: "${path}" | Is Palette? ${isPalette}`);
  
    const response = await context.next();
  
    // If not a palette URL, return original HTML
    if (!isPalette) return response;
  
    // Construct the dynamic image URL
    const ogImageUrl = `${url.origin}/.netlify/functions/og-image?colors=${path}`;
    
    // Force large card explicitly
    const cardType = 'summary_large_image';
  
    return new HTMLRewriter()
      .on('meta[property="og:image"]', {
        element(element) {
          element.setAttribute('content', ogImageUrl);
        },
      })
      .on('meta[name="twitter:image"]', {
        element(element) {
          element.setAttribute('content', ogImageUrl);
        },
      })
      .on('meta[name="twitter:card"]', {
        element(element) {
          element.setAttribute('content', cardType);
        },
      })
      .transform(response);
  };