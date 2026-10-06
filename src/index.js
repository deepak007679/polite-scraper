/**
 * FlyRank Internship · Backend Track · Week 5 · Assignment A9
 * The Polite Scraper — Stage 5: Survive Failures, Report the Run
 */

const { discoverBooks } = require('./crawler');
const { extractAllBooks } = require('./extractor');
const { processAndStoreRecords } = require('./normalizer');
const { RunReporter } = require('./reporter');

const DELIBERATELY_BROKEN_URL = 'https://books.toscrape.com/catalogue/deliberately-broken-page-404_9999/index.html';

async function runPipeline({ injectFailure = false } = {}) {
  console.log('=== Starting Polite Scraping Pipeline ===');
  const reporter = new RunReporter();

  // 1. Discover catalogue
  const { bookUrls, urlToSourceMap } = await discoverBooks();

  // 2. Inject deliberate broken URL for Stage 5 test if requested
  const urlsToProcess = [...bookUrls];
  if (injectFailure) {
    console.log(`[TEST INJECTION] Adding one deliberate broken URL to prove failure resilience: ${DELIBERATELY_BROKEN_URL}`);
    urlsToProcess.push(DELIBERATELY_BROKEN_URL);
  }

  // 3. Extract raw records (isolated per page)
  const rawRecords = await extractAllBooks(urlsToProcess, urlToSourceMap, reporter);

  // 4. Clean, validate, and store records
  const result = processAndStoreRecords(rawRecords);
  reporter.setRecordStats(result.validCount, result.invalidCount);

  // 5. Save run report
  const report = reporter.saveReport();

  console.log(`\nCHECKPOINT: books.json holds ${result.validCount} good records, failed_pages: ${report.failed_pages}`);
  return { result, report };
}

if (require.main === module) {
  // Run with failure injection to fulfill Stage 5 checkpoint
  runPipeline({ injectFailure: true }).catch(console.error);
}

module.exports = { runPipeline, DELIBERATELY_BROKEN_URL };
