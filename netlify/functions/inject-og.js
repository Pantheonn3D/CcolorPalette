export default async (request, context) => {
    const url = new URL(request.url);
    const path = url.pathname.slice(1); // remove leading slash
  
    // Check if the URL is a palette (looks like "HEX-HEX-HEX")
    // e.g. 0D3B27-1F946E...
    const isPalette = /^[0-9A-Fa-f]{6}(-[0-9A-Fa-f]{6})+$/.test(path);
  
    // Get the raw HTML from the origin
    const response = await context.next();
    
    // If it's just the homepage or not a palette, return raw HTML
    if (!isPalette) return response;
  
    // Construct the dynamic image URL
    const ogImageUrl = `${url.origin}/.netlify/functions/og-image?colors=${path}`;
  
    // Use HTMLRewriter to swap the meta tags on the fly
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
      // Optional: Update the card type to large to ensure big image
      .on('meta[name="twitter:card"]', {
        element(element) {
          element.setAttribute('content', 'summary_large_image');
        },
      })
      .transform(response);
  };