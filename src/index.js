/**
 * FlyRank Internship · Backend Track · Week 5 · Assignment A9
 * The Polite Scraper — Stage 3: Extract Book Details
 */

const { discoverBooks } = require('./crawler');
const { extractAllBooks } = require('./extractor');

async function main() {
  console.log('=== Stage 3: Extract Book Details ===');
  const { bookUrls, urlToSourceMap } = await discoverBooks();
  const rawRecords = await extractAllBooks(bookUrls, urlToSourceMap);

  if (rawRecords.length > 0) {
    console.log('\n--- Sample Raw Record (First Book) ---');
    console.log(JSON.stringify(rawRecords[0], null, 2));
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
