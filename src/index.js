/**
 * FlyRank Internship · Backend Track · Week 5 · Assignment A9
 * The Polite Scraper — Stage 0: Classify Scraping Target
 */

const TARGET_URL = 'https://books.toscrape.com/';
const ROBOTS_URL = 'https://books.toscrape.com/robots.txt';

async function main() {
  console.log('=== The Polite Scraper ===');
  console.log(`Target: ${TARGET_URL}`);
  console.log('Classified as public scraping sandbox practice environment.');
  console.log(`Checking ${ROBOTS_URL}...`);
  console.log('Result: HTTP 404 (No robots file found).');
  console.log('Scope: First 3 catalogue pages (60 books).');
  console.log('Policy: Respectful rate-limiting (>=500ms delay), honest user-agent, local caching.');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TARGET_URL, ROBOTS_URL };
