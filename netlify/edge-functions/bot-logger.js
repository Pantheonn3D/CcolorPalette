export default async (request, context) => {
    const userAgent = request.headers.get("user-agent") || "";
    
    // Regex to match major search engine crawlers:
    // Google, Bing, Yandex, Baidu, DuckDuckGo, Yahoo (Slurp), Sogou, Exabot, Facebook, Twitter
    const botPattern = /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|sogou|exabot|facebookexternalhit|twitterbot/i;
  
    // Check if the User-Agent matches any of the bots above
    if (botPattern.test(userAgent)) {
      // Log the specific bot name and the path they hit
      console.log(`BOT HIT: ${userAgent} visited ${request.url}`);
    }
  
    return context.next();
  };