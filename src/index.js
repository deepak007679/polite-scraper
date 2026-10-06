/**
 * FlyRank Internship · Backend Track · Week 5 · Assignment A9
 * The Polite Scraper — Main Pipeline
 */

const { discoverBooks } = require('./crawler');
const { extractAllBooks } = require('./extractor');
const { processAndStoreRecords } = require('./normalizer');
const { RunReporter } = require('./reporter');
const { exportToCsv } = require('./csvExporter');
const { detectChanges } = require('./changeDetector');

const DELIBERATELY_BROKEN_URL = 'https://books.toscrape.com/catalogue/deliberately-broken-page-404_9999/index.html';

async function runPipeline({ injectFailure = true } = {}) {
  console.log('=== Starting Polite Scraping Pipeline ===\n');
  const reporter = new RunReporter();

  // 1. Discover catalogue pages (up to 3 pages)
  const { bookUrls, urlToSourceMap } = await discoverBooks();

  // 2. Inject one deliberate broken URL to prove failure resilience without crashing
  const urlsToProcess = [...bookUrls];
  if (injectFailure) {
    console.log(`\n[FAILURE RESILIENCE TEST] Injecting 1 broken URL: ${DELIBERATELY_BROKEN_URL}`);
    urlsToProcess.push(DELIBERATELY_BROKEN_URL);
  }

  // 3. Extract raw records (isolated per book)
  const rawRecords = await extractAllBooks(urlsToProcess, urlToSourceMap, reporter);

  // 4. Clean, validate, and store records idempotently
  const result = processAndStoreRecords(rawRecords);
  reporter.setRecordStats(result.validCount, result.invalidCount);

  // 5. Extras: CSV export and hash-based change detection
  exportToCsv(result.books);
  detectChanges(result.books);

  // 6. Save comprehensive run report
  const report = reporter.saveReport();

  console.log(`\nCHECKPOINT SUMMARY:`);
  console.log(`- books.json holds: ${result.validCount} valid unique records`);
  console.log(`- failed_pages: ${report.failed_pages} (handled politely without crashing)`);
  console.log(`- CSV exported: output/books.csv`);

  return { result, report };
}

if (require.main === module) {
  runPipeline({ injectFailure: true }).catch(console.error);
}

module.exports = { runPipeline, DELIBERATELY_BROKEN_URL };
