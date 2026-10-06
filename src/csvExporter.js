const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'output');

/**
 * Exports validated book records to CSV format.
 * Flattens nested or nullable values and escapes special characters.
 * @param {object[]} records
 * @returns {string} Path to written CSV
 */
function exportToCsv(records) {
  if (!records || records.length === 0) return null;

  const headers = [
    'title',
    'product_url',
    'price_gbp',
    'price_text',
    'in_stock',
    'stock_count',
    'rating_numeric',
    'rating_text',
    'description',
    'source_page',
    'fetched_at'
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = [headers.join(',')];
  for (const record of records) {
    const row = headers.map((header) => escapeCsv(record[header]));
    rows.push(row.join(','));
  }

  const csvContent = rows.join('\n');
  const csvPath = path.join(OUTPUT_DIR, 'books.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf-8');
  console.log(`Exported ${records.length} records to output/books.csv`);

  return csvPath;
}

module.exports = { exportToCsv };
