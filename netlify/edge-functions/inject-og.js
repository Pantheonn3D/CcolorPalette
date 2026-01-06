import { HTMLRewriter } from "https://deno.land/x/html_rewriter@v0.1.0-pre.17/index.ts";

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/|\/$/g, '');

  const isPalette = /^[0-9a-f]{3,6}(-[0-9a-f]{3,6})+$/i.test(path);

  const response = await context.next();
  
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') || !isPalette) {
    return response;
  }

  // Define Data
  const hexCodes = path.split('-');
  const colorString = hexCodes.map(h => '#' + h.toUpperCase()).join(', ');
  
  const ogImageUrl = `${url.origin}/.netlify/functions/og-image?colors=${path}`;
  const canonicalUrl = `${url.origin}/${path}`;
  const pageTitle = `Color Palette: ${hexCodes.slice(0, 3).map(h => '#' + h).join(' ')}... | CColorPalette`;
  const pageDescription = `Free color palette featuring ${colorString}. Export to Tailwind, CSS, and SCSS instantly. Accessible and WCAG compliant.`;

  // Rewrite HTML
  const rewriter = new HTMLRewriter()
    // Images
    .on('meta[property="og:image"]', {
      element(el) { el.setAttribute('content', ogImageUrl); }
    })
    .on('meta[name="twitter:image"]', {
      element(el) { el.setAttribute('content', ogImageUrl); }
    })
    .on('meta[name="twitter:card"]', {
      element(el) { el.setAttribute('content', 'summary_large_image'); }
    })
    // Title & Desc
    .on('meta[property="og:title"]', {
      element(el) { el.setAttribute('content', pageTitle); }
    })
    .on('meta[property="og:description"]', {
      element(el) { el.setAttribute('content', pageDescription); }
    })
    .on('title', {
      element(el) { el.setInnerContent(pageTitle); }
    })
    .on('meta[name="description"]', {
      element(el) { el.setAttribute('content', pageDescription); }
    })
    // URLs (The Final Fix)
    .on('link[rel="canonical"]', {
      element(el) { el.setAttribute('href', canonicalUrl); }
    })
    .on('meta[property="og:url"]', {
      element(el) { el.setAttribute('content', canonicalUrl); }
    })
    .on('meta[name="twitter:url"]', {
      element(el) { el.setAttribute('content', canonicalUrl); }
    });

  const newResponse = rewriter.transform(response);
  const newHeaders = new Headers(newResponse.headers);
  newHeaders.delete('content-encoding'); 
  newHeaders.delete('content-length');

  return new Response(newResponse.body, {
    status: newResponse.status,
    statusText: newResponse.statusText,
    headers: newHeaders
  });
};