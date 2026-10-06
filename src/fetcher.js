const fs = require('fs');
const path = require('path');

const USER_AGENT = 'FlyRankInternship-A9/1.0 (+https://github.com/deepak007679/polite-scraper)';
const TIMEOUT_MS = 10000;
const CACHE_DIR = path.join(__dirname, '..', 'cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Polite fetcher with local disk caching, timeout, and status validation.
 * @param {string} url - Target URL
 * @param {string} cacheFilename - Local cache filename
 * @returns {Promise<{ html: string, fromCache: boolean, size: number }>}
 */
async function fetchWithCache(url, cacheFilename) {
  const cachePath = path.join(CACHE_DIR, cacheFilename);

  // Check cache first
  if (fs.existsSync(cachePath)) {
    const cachedHtml = fs.readFileSync(cachePath, 'utf-8');
    console.log(`[CACHE HIT] ${url} (${Buffer.byteLength(cachedHtml, 'utf-8')} bytes read from cache/${cacheFilename})`);
    return { html: cachedHtml, fromCache: true, size: Buffer.byteLength(cachedHtml, 'utf-8') };
  }

  // Live fetch with timeout and polite User-Agent
  console.log(`[FETCH] ${url}`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml'
      },
      signal: controller.signal
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch ${url} - HTTP status ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    fs.writeFileSync(cachePath, html, 'utf-8');
    const size = Buffer.byteLength(html, 'utf-8');
    console.log(`[FETCHED] ${url} (status: 200, ${size} bytes saved to cache/${cacheFilename})`);

    return { html, fromCache: false, size };
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  fetchWithCache,
  USER_AGENT,
  TIMEOUT_MS,
  CACHE_DIR
};
