/**
 * FlyRank Internship · Backend Track · Week 5 · Assignment A9
 * The Polite Scraper — Stage 1: Fetch Once, Cache Once
 */

const { fetchWithCache } = require('./fetcher');

const PAGE_1_URL = 'https://books.toscrape.com/catalogue/page-1.html';

async function main() {
  console.log('=== Stage 1: Fetch Once, Cache Once ===');
  const result = await fetchWithCache(PAGE_1_URL, 'catalogue-page-1.html');
  console.log(`Response size: ${result.size} bytes (Cached: ${result.fromCache})`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
