import { HTMLRewriter } from "https://deno.land/x/html_rewriter@v0.1.0-pre.17/index.ts";

export default async (request, context) => {
  const url = new URL(request.url);
  // Remove leading/trailing slashes
  const path = url.pathname.replace(/^\/|\/$/g, '');

  const response = await context.next();
  
  // Safety check: Ensure it's HTML
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  // --- DEFINITIONS ---
  let pageTitle = "CColorPalette - Free Accessible Color Palette Generator";
  let pageDescription = "Create beautiful, accessible color palettes with WCAG contrast checking, color blindness simulation, and export to CSS, Tailwind, SCSS.";
  let ogImageUrl = `${url.origin}/og-image.png`; // Default static image
  let canonicalUrl = `${url.origin}/`; // Default to root

  // 1. IS THIS THE "HOME" (Marketing) PAGE?
  if (path === 'home') {
    pageTitle = "CColorPalette - The Best Free Color Tool for Developers";
    pageDescription = "Stop logging in to save colors. CColorPalette is the fast, free, no-login generator for Tailwind CSS and modern web design.";
    canonicalUrl = `${url.origin}/home`;
    // We keep the default static og-image for the homepage
  } 
  
  // 2. IS THIS A SPECIFIC PALETTE URL? (e.g. AABBCC-112233)
  else if (/^[0-9a-f]{3,6}(-[0-9a-f]{3,6})+$/i.test(path)) {
    const hexCodes = path.split('-');
    const colorString = hexCodes.map(h => '#' + h.toUpperCase()).join(', ');
    
    pageTitle = `Color Palette: ${hexCodes.slice(0, 3).map(h => '#' + h).join(' ')}... | CColorPalette`;
    pageDescription = `Free color palette featuring ${colorString}. Export to Tailwind, CSS, and SCSS instantly. Accessible and WCAG compliant.`;
    ogImageUrl = `${url.origin}/.netlify/functions/og-image?colors=${path}`;
    canonicalUrl = `${url.origin}/${path}`;
  }

  // 3. IS THIS THE ROOT GENERATOR? (path is empty)
  else if (path === '') {
    // We leave the defaults (defined at top), BUT we ensure canonical is set to root
    canonicalUrl = `${url.origin}/`;
  }
  
  // --- REWRITE HTML ---
  const rewriter = new HTMLRewriter()
    // Meta Images
    .on('meta[property="og:image"]', {
      element(el) { el.setAttribute('content', ogImageUrl); }
    })
    .on('meta[name="twitter:image"]', {
      element(el) { el.setAttribute('content', ogImageUrl); }
    })
    .on('meta[name="twitter:card"]', {
      element(el) { el.setAttribute('content', 'summary_large_image'); }
    })
    // Title & Description
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
    // Canonical & URLs (CRITICAL FIX)
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
  
  // Strip Gzip headers
  const newHeaders = new Headers(newResponse.headers);
  newHeaders.delete('content-encoding'); 
  newHeaders.delete('content-length');

  return new Response(newResponse.body, {
    status: newResponse.status,
    statusText: newResponse.statusText,
    headers: newHeaders
  });
};