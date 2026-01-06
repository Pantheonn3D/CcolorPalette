import { HTMLRewriter } from "https://deno.land/x/html_rewriter@v0.1.0-pre.17/index.ts";

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/|\/$/g, '');

  // Regex check for palette
  const isPalette = /^[0-9a-f]{3,6}(-[0-9a-f]{3,6})+$/i.test(path);

  const response = await context.next();
  
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') || !isPalette) {
    return response;
  }

  // --- 1. GENERATE DYNAMIC METADATA ---
  const hexCodes = path.split('-');
  const colorString = hexCodes.map(h => '#' + h.toUpperCase()).join(', ');
  
  // Dynamic URL
  const ogImageUrl = `${url.origin}/.netlify/functions/og-image?colors=${path}`;
  const canonicalUrl = `${url.origin}/${path}`;
  
  // Dynamic Text
  const pageTitle = `Color Palette: ${hexCodes.slice(0, 3).map(h => '#' + h).join(' ')}... | CColorPalette`;
  const pageDescription = `Free color palette featuring ${colorString}. Export to Tailwind, CSS, and SCSS instantly. Accessible and WCAG compliant.`;

  // --- 2. REWRITE HTML ---
  const rewriter = new HTMLRewriter()
    // A. Social Tags (Already working)
    .on('meta[property="og:image"]', {
      element(el) { el.setAttribute('content', ogImageUrl); }
    })
    .on('meta[name="twitter:image"]', {
      element(el) { el.setAttribute('content', ogImageUrl); }
    })
    .on('meta[name="twitter:card"]', {
      element(el) { el.setAttribute('content', 'summary_large_image'); }
    })
    .on('meta[property="og:title"]', {
      element(el) { el.setAttribute('content', pageTitle); }
    })
    .on('meta[property="og:description"]', {
      element(el) { el.setAttribute('content', pageDescription); }
    })

    // B. SEO Tags (Fixing for Bing/Curl)
    .on('title', {
      element(el) { el.setInnerContent(pageTitle); }
    })
    .on('meta[name="description"]', {
      element(el) { el.setAttribute('content', pageDescription); }
    })
    .on('link[rel="canonical"]', {
      element(el) { el.setAttribute('href', canonicalUrl); }
    });

  // Transform and strip gzip
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