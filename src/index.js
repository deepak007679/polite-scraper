/**
 * FlyRank Internship · Backend Track · Week 5 · Assignment A9
 * The Polite Scraper — Stage 2: Discover Three Catalogue Pages
 */

const { discoverBooks } = require('./crawler');

async function main() {
  console.log('=== Stage 2: Discover Three Catalogue Pages ===');
  const result = await discoverBooks();
  console.log(`Discovered ${result.uniqueCount} unique book URLs ready for extraction.`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
