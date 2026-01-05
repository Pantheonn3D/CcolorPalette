// 1. IMPORT HTMLRewriter EXPLICITLY to fix ReferenceError
import { HTMLRewriter } from "https://deno.land/x/html_rewriter@v0.1.0-pre.17/index.ts";

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/|\/$/g, '');

  // Regex for palette URLs
  const isPalette = /^[0-9a-f]{3,6}(-[0-9a-f]{3,6})+$/i.test(path);

  const response = await context.next();
  
  // Safety Check: Only process HTML
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') || !isPalette) {
    return response;
  }

  // Prepare the new data
  const ogImageUrl = `${url.origin}/.netlify/functions/og-image?colors=${path}`;
  const title = `Color Palette: #${path.split('-')[0].toUpperCase()}...`;

  // Setup the Rewriter
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

  // Transform response
  const newResponse = rewriter.transform(response);
  
  // Strip Gzip headers so bots can read the raw HTML
  const newHeaders = new Headers(newResponse.headers);
  newHeaders.delete('content-encoding'); 
  newHeaders.delete('content-length');

  return new Response(newResponse.body, {
    status: newResponse.status,
    statusText: newResponse.statusText,
    headers: newHeaders
  });
};