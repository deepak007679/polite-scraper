/**
 * FlyRank Internship · Backend Track · Week 5 · Assignment A9
 * The Polite Scraper — Stage 4: Validate Normalized Records
 */

const { discoverBooks } = require('./crawler');
const { extractAllBooks } = require('./extractor');
const { processAndStoreRecords } = require('./normalizer');

async function main() {
  console.log('=== Stage 4: Validate Normalized Records ===');
  const { bookUrls, urlToSourceMap } = await discoverBooks();
  const rawRecords = await extractAllBooks(bookUrls, urlToSourceMap);
  const result = processAndStoreRecords(rawRecords);

  console.log(`\nCHECKPOINT: books.json has ${result.validCount} records.`);
  if (result.validCount > 0) {
    const sample = result.books[0];
    console.log(`Verification: price_gbp=${sample.price_gbp} (type: ${typeof sample.price_gbp}), url starts with https: ${sample.product_url.startsWith('https://')}`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
