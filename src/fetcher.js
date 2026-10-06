const fs = require('fs');
const path = require('path');

const USER_AGENT = 'FlyRankInternship-A9/1.0 (+https://github.com/deepak007679/polite-scraper)';
const TIMEOUT_MS = 8000;
const CACHE_DIR = path.join(__dirname, '..', 'cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Polite fetcher with caching, timeout, and failure retry semantics.
 * @param {string} url - Target URL
 * @param {string} cacheFilename - Local cache filename
 * @param {number} [retryCount=1] - Number of retries on 5xx/timeout
 * @returns {Promise<{ html: string, fromCache: boolean, size: number }>}
 */
async function fetchWithCache(url, cacheFilename, retryCount = 1) {
  const cachePath = path.join(CACHE_DIR, cacheFilename);

  // Check cache first
  if (fs.existsSync(cachePath)) {
    const cachedHtml = fs.readFileSync(cachePath, 'utf-8');
    return { html: cachedHtml, fromCache: true, size: Buffer.byteLength(cachedHtml, 'utf-8') };
  }

  // Attempt live request
  for (let attempt = 0; attempt <= retryCount; attempt++) {
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

      // Do NOT retry 404 Not Found or 403 Forbidden
      if (response.status === 404) {
        throw new Error(`HTTP 404 Not Found - page does not exist (${url})`);
      }
      if (response.status === 403) {
        throw new Error(`HTTP 403 Forbidden - permission denied (${url})`);
      }

      // Retry on 5xx server errors
      if (response.status >= 500 && response.status < 600) {
        if (attempt < retryCount) {
          console.warn(`[RETRY] Server error ${response.status} on ${url}. Retrying once after 1000ms...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        throw new Error(`HTTP ${response.status} Server Error on ${url}`);
      }

      if (response.status !== 200) {
        throw new Error(`Unexpected HTTP status ${response.status} on ${url}`);
      }

      const html = await response.text();
      fs.writeFileSync(cachePath, html, 'utf-8');
      const size = Buffer.byteLength(html, 'utf-8');
      return { html, fromCache: false, size };
    } catch (err) {
      if (err.name === 'AbortError') {
        if (attempt < retryCount) {
          console.warn(`[RETRY] Timeout (${TIMEOUT_MS}ms) on ${url}. Retrying once...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        throw new Error(`Request timed out after ${TIMEOUT_MS}ms (${url})`);
      }
      // Re-throw non-retryable errors (e.g. 404, 403) immediately
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

module.exports = {
  fetchWithCache,
  USER_AGENT,
  TIMEOUT_MS,
  CACHE_DIR
};
