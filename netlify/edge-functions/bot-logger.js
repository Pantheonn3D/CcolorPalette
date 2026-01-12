export default async (request, context) => {
  const userAgent = request.headers.get("user-agent") || "";
  const lowerUA = userAgent.toLowerCase();

  // 1. Major Search Engines (CRITICAL FOR SEO)
  // These drive your organic traffic.
  const searchBots = /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|sogou|exabot|teoma|naverbot|seznambot/i;

  // 2. Social Media Preview Bots (CRITICAL FOR SHARING)
  // These visit to generate the OG Image/Card when a link is pasted.
  const socialBots = /facebookexternalhit|twitterbot|linkedinbot|pinterest|slackbot|whatsapp|telegram|discordbot|applebot|skypeuripreview|embedly/i;

  // 3. AI & LLM Scrapers (DATA TRAINING)
  // These scrape content to train AI models (ChatGPT, Claude, etc).
  const aiBots = /gptbot|chatgpt-user|ccbot|anthropic-ai|cohere-ai|google-extended|amazonbot|bytespider/i;

  // 4. SEO & Marketing Tools (COMPETITIVE INTELLIGENCE)
  // These crawl your site to check backlinks, domain authority, etc.
  const toolBots = /ahrefsbot|semrushbot|dotbot|mj12bot|petalbot|serpstatbot|rogerbot|screaming frog/i;

  // 5. Monitoring & Uptime
  // Services that check if your site is online.
  const monitorBots = /uptimerobot|pingdom|statuscake|gtmetrix/i;

  // 6. Generic Scripts (POTENTIAL SCRAPERS)
  // Often used by developers or attackers.
  const scriptBots = /curl|wget|python-requests|postman|insomnia|go-http-client|axios/i;

  // --- DETECTION LOGIC ---

  let botType = null;

  if (searchBots.test(lowerUA)) {
    botType = "SEARCH ENGINE";
  } else if (socialBots.test(lowerUA)) {
    botType = "SOCIAL PREVIEW";
  } else if (aiBots.test(lowerUA)) {
    botType = "AI SCRAPER";
  } else if (toolBots.test(lowerUA)) {
    botType = "SEO TOOL";
  } else if (monitorBots.test(lowerUA)) {
    botType = "MONITORING";
  } else if (scriptBots.test(lowerUA)) {
    botType = "SCRIPT/DEV";
  } else if (/bot|spider|crawl/i.test(lowerUA)) {
    // Catch-all for anything else identifying as a bot
    botType = "GENERIC BOT";
  }

  // --- LOGGING ---
  
  if (botType) {
    // We log the TYPE, the specific PATH, and the full User Agent for debugging
    console.log(`[${botType}] HIT on ${request.url}`);
    console.log(`   └─ Agent: ${userAgent}`);
  }

  return context.next();
};