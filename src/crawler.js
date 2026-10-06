const cheerio = require('cheerio');
const { fetchWithCache } = require('./fetcher');

const START_URL = 'https://books.toscrape.com/catalogue/page-1.html';
const MAX_CATALOGUE_PAGES = 3;
const POLITENESS_DELAY_MS = 600;

/**
 * Discover book links across the first 3 catalogue pages.
 * @returns {Promise<{ bookUrls: string[], cataloguePagesCount: number }>}
 */
async function discoverBooks(startUrl = START_URL, maxPages = MAX_CATALOGUE_PAGES) {
  let currentUrl = startUrl;
  let pageIndex = 1;
  const discoveredUrls = [];
  const uniqueUrlsSet = new Set();

  while (currentUrl && pageIndex <= maxPages) {
    const cacheFilename = `catalogue-page-${pageIndex}.html`;
    const { html, fromCache } = await fetchWithCache(currentUrl, cacheFilename);

    // Parse HTML with Cheerio
    const $ = cheerio.load(html);

    // Extract book links
    const pageBooks = [];
    $('article.product_pod h3 a').each((_, el) => {
      const relativeHref = $(el).attr('href');
      if (relativeHref) {
        // Resolve absolute URL properly using new URL()
        const absoluteUrl = new URL(relativeHref, currentUrl).href;
        pageBooks.push(absoluteUrl);
        discoveredUrls.push(absoluteUrl);
        uniqueUrlsSet.add(absoluteUrl);
      }
    });

    console.log(`Page ${pageIndex} (${currentUrl}): found ${pageBooks.length} books.`);

    // Find next page link
    const nextHref = $('li.next a').attr('href');
    if (nextHref && pageIndex < maxPages) {
      currentUrl = new URL(nextHref, currentUrl).href;
      pageIndex++;

      // Polite delay between real network requests
      if (!fromCache) {
        await new Promise((resolve) => setTimeout(resolve, POLITENESS_DELAY_MS));
      }
    } else {
      break;
    }
  }

  const result = {
    cataloguePagesCount: pageIndex,
    discoveredCount: discoveredUrls.length,
    uniqueCount: uniqueUrlsSet.size,
    bookUrls: Array.from(uniqueUrlsSet)
  };

  console.log(`CHECKPOINT: catalogue_pages=${result.cataloguePagesCount}, discovered=${result.discoveredCount}, unique_urls=${result.uniqueCount}`);
  return result;
}

module.exports = {
  discoverBooks,
  START_URL,
  MAX_CATALOGUE_PAGES,
  POLITENESS_DELAY_MS
};
