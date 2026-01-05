export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/|\/$/g, '');

  // Regex for palette URLs
  const isPalette = /^[0-9a-f]{3,6}(-[0-9a-f]{3,6})+$/i.test(path);

  // Get the response
  const response = await context.next();
  
  // 1. Safety Check: Only process HTML
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') || !isPalette) {
    return response;
  }

  // 2. Prepare the new data
  const ogImageUrl = `${url.origin}/.netlify/functions/og-image?colors=${path}`;
  const title = `Color Palette: #${path.split('-')[0].toUpperCase()}...`;

  // 3. Setup the Rewriter
  const rewriter = new HTMLRewriter()
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
        element.setAttribute('content', 'summary_large_image');
      },
    })
    .on('meta[property="og:title"]', {
      element(element) {
        element.setAttribute('content', title);
      },
    });

  // 4. CRITICAL FIX: Transform response and strip encoding headers
  const newResponse = rewriter.transform(response);
  
  // We must clone the headers to modify them safely
  const newHeaders = new Headers(newResponse.headers);
  newHeaders.delete('content-encoding'); 
  newHeaders.delete('content-length');

  // Return the cleaned response
  return new Response(newResponse.body, {
    status: newResponse.status,
    statusText: newResponse.statusText,
    headers: newHeaders
  });
};