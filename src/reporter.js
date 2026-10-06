const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'output');

class RunReporter {
  constructor() {
    this.startTime = new Date();
    this.pagesFetched = 0;
    this.cacheHits = 0;
    this.validRecords = 0;
    this.invalidRecords = 0;
    this.failedPages = 0;
    this.failedUrls = [];
  }

  recordPageFetch(fromCache) {
    if (fromCache) {
      this.cacheHits++;
    } else {
      this.pagesFetched++;
    }
  }

  recordPageFailure(url, error) {
    this.failedPages++;
    this.failedUrls.push({
      url,
      reason: error.message || String(error)
    });
  }

  setRecordStats(valid, invalid) {
    this.validRecords = valid;
    this.invalidRecords = invalid;
  }

  saveReport() {
    const endTime = new Date();
    const durationMs = endTime.getTime() - this.startTime.getTime();

    const report = {
      start_time: this.startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_ms: durationMs,
      pages_fetched: this.pagesFetched,
      cache_hits: this.cacheHits,
      valid_records: this.validRecords,
      invalid_records: this.invalidRecords,
      failed_pages: this.failedPages,
      failed_urls: this.failedUrls
    };

    const reportPath = path.join(OUTPUT_DIR, 'run-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\nRun report written to output/run-report.json:`);
    console.log(JSON.stringify(report, null, 2));

    return report;
  }
}

module.exports = { RunReporter };
