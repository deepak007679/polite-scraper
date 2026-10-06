const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SNAPSHOT_PATH = path.join(__dirname, '..', 'output', '.snapshot.json');

/**
 * Computes hash-based change detection across runs.
 * @param {object[]} currentRecords
 * @returns {{ newCount: number, changedCount: number, unchangedCount: number, removedCount: number }}
 */
function detectChanges(currentRecords) {
  let previousSnapshot = {};
  if (fs.existsSync(SNAPSHOT_PATH)) {
    try {
      previousSnapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf-8'));
    } catch (_) {
      previousSnapshot = {};
    }
  }

  const currentSnapshot = {};
  let newCount = 0;
  let changedCount = 0;
  let unchangedCount = 0;

  for (const record of currentRecords) {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify({
        title: record.title,
        price_gbp: record.price_gbp,
        stock_count: record.stock_count,
        rating_numeric: record.rating_numeric,
        description: record.description
      }))
      .digest('hex');

    currentSnapshot[record.product_url] = hash;

    if (!previousSnapshot[record.product_url]) {
      newCount++;
    } else if (previousSnapshot[record.product_url] !== hash) {
      changedCount++;
    } else {
      unchangedCount++;
    }
  }

  let removedCount = 0;
  for (const prevUrl of Object.keys(previousSnapshot)) {
    if (!currentSnapshot[prevUrl]) {
      removedCount++;
    }
  }

  // Save current snapshot
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(currentSnapshot, null, 2), 'utf-8');

  const report = { newCount, changedCount, unchangedCount, removedCount };
  console.log(`Change Detection: ${newCount} new, ${changedCount} changed, ${unchangedCount} unchanged, ${removedCount} removed.`);
  return report;
}

module.exports = { detectChanges };
