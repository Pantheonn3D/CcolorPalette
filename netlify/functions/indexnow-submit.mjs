const HOST = "ccolorpalette.com";
const KEY = "55ce78d5f6084943a0d286416ebf48e6";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const DEFAULT_SITEMAP = `https://${HOST}/sitemap.xml`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH_SIZE = 10_000; // IndexNow limit per POST

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1].trim());
}

function dedupe(arr) {
  return [...new Set(arr)];
}

async function fetchText(url, timeoutMs = 15000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);

  try {
    const res = await fetch(url, { redirect: "follow", signal: ac.signal });
    if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

// Handles both <urlset> and <sitemapindex>
async function getAllUrlsFromSitemap(sitemapUrl, visited = new Set()) {
  if (visited.has(sitemapUrl)) return [];
  visited.add(sitemapUrl);

  const xml = await fetchText(sitemapUrl);
  const locs = extractLocs(xml);

  if (xml.includes("<sitemapindex")) {
    const all = [];
    for (const child of locs) {
      const childUrls = await getAllUrlsFromSitemap(child, visited);
      all.push(...childUrls);
    }
    return all;
  }

  return locs;
}

async function submitIndexNow(urlList) {
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => "");
  if (!(res.status === 200 || res.status === 202)) {
    throw new Error(`IndexNow failed ${res.status}: ${text.slice(0, 500)}`);
  }
  return { status: res.status, body: text.slice(0, 500) };
}

export const handler = async (event) => {
  // Optional: protect the endpoint
  const required = process.env.INDEXNOW_SUBMIT_TOKEN;
  const token = event.queryStringParameters?.token;
  if (required && token !== required) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const sitemapUrl = event.queryStringParameters?.sitemap || DEFAULT_SITEMAP;

  try {
    const urls = await getAllUrlsFromSitemap(sitemapUrl);
    const filtered = urls.filter((u) => u.startsWith(`https://${HOST}/`) || u.startsWith(`http://${HOST}/`));
    const finalUrls = dedupe(filtered);

    const results = [];
    for (let i = 0; i < finalUrls.length; i += BATCH_SIZE) {
      const batch = finalUrls.slice(i, i + BATCH_SIZE);
      results.push(await submitIndexNow(batch));
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sitemapUrl, urlCount: finalUrls.length, batches: results }, null, 2),
    };
  } catch (e) {
    return { statusCode: 500, body: String(e?.stack || e) };
  }
};
