import { HTMLRewriter } from "https://deno.land/x/html_rewriter@v0.1.0-pre.17/index.ts";

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/|\/$/g, '');

  // Regex check
  const isPalette = /^[0-9a-f]{3,6}(-[0-9a-f]{3,6})+$/i.test(path);

  const response = await context.next();
  
  // Safety checks
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') || !isPalette) {
    return response;
  }

  // Construct URLs
  // Twitter requires ABSOLUTE URLs
  const ogImageUrl = `${url.origin}/.netlify/functions/og-image?colors=${path}`;
  const title = `Color Palette: #${path.split('-')[0].toUpperCase()}...`;

  // Use HTMLRewriter
  const rewriter = new HTMLRewriter()
    // 1. Standard Open Graph
    .on('meta[property="og:image"]', {
      element(el) { el.setAttribute('content', ogImageUrl); }
    })
    .on('meta[property="og:image:width"]', {
      element(el) { el.setAttribute('content', '1200'); }
    })
    .on('meta[property="og:image:height"]', {
      element(el) { el.setAttribute('content', '630'); }
    })
    .on('meta[property="og:title"]', {
      element(el) { el.setAttribute('content', title); }
    })
    
    // 2. Twitter Specifics (CRITICAL)
    .on('meta[name="twitter:image"]', {
      element(el) { el.setAttribute('content', ogImageUrl); }
    })
    .on('meta[name="twitter:card"]', {
      element(el) { el.setAttribute('content', 'summary_large_image'); }
    })
    .on('meta[name="twitter:title"]', {
      element(el) { el.setAttribute('content', title); }
    });

  const newResponse = rewriter.transform(response);
  
  // 3. Strip compression headers so Twitter bot doesn't choke
  const newHeaders = new Headers(newResponse.headers);
  newHeaders.delete('content-encoding'); 
  newHeaders.delete('content-length');

  return new Response(newResponse.body, {
    status: newResponse.status,
    statusText: newResponse.statusText,
    headers: newHeaders
  });
};