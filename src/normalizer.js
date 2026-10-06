const fs = require('fs');
const path = require('path');
const { BookSchema, RATING_MAP } = require('./schema');

const OUTPUT_DIR = path.join(__dirname, '..', 'output');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Normalizes a raw scraped record.
 * @param {object} raw
 * @returns {object}
 */
function normalizeRecord(raw) {
  // 1. Clean numeric price
  const cleanPriceStr = (raw.price_text || '').replace(/[^0-9.]/g, '');
  const price_gbp = cleanPriceStr ? parseFloat(cleanPriceStr) : null;

  // 2. Parse stock count from availability text
  const stockMatch = (raw.availability_text || '').match(/\((\d+)\s+available\)/i);
  const stock_count = stockMatch ? parseInt(stockMatch[1], 10) : null;
  const in_stock = (raw.availability_text || '').toLowerCase().includes('in stock');

  // 3. Map rating
  const rating_numeric = raw.rating_text ? (RATING_MAP[raw.rating_text] || null) : null;

  return {
    title: (raw.title || '').trim(),
    product_url: (raw.product_url || '').trim(),
    price_text: (raw.price_text || '').trim(),
    price_gbp: price_gbp,
    availability_text: (raw.availability_text || '').trim(),
    in_stock,
    stock_count,
    rating_text: raw.rating_text || null,
    rating_numeric,
    description: raw.description ? raw.description.trim() : null,
    source_page: (raw.source_page || '').trim(),
    fetched_at: raw.fetched_at || new Date().toISOString()
  };
}

/**
 * Validates normalized records against schema and stores them idempotently.
 * @param {object[]} rawRecords - Array of raw book records
 * @returns {{ validCount: number, invalidCount: number, books: object[], errors: object[] }}
 */
function processAndStoreRecords(rawRecords) {
  const booksMap = new Map(); // Keyed by canonical product_url for deduplication & idempotency
  const errors = [];

  for (const raw of rawRecords) {
    const normalized = normalizeRecord(raw);
    const parseResult = BookSchema.safeParse(normalized);

    if (parseResult.success) {
      // Canonical product_url ensures idempotent storage (no duplicates)
      booksMap.set(normalized.product_url, parseResult.data);
    } else {
      errors.push({
        record: raw,
        reasons: parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
      });
    }
  }

  const validBooks = Array.from(booksMap.values());

  // Store output/books.json
  const booksPath = path.join(OUTPUT_DIR, 'books.json');
  fs.writeFileSync(booksPath, JSON.stringify(validBooks, null, 2), 'utf-8');

  // Store output/errors.json
  const errorsPath = path.join(OUTPUT_DIR, 'errors.json');
  fs.writeFileSync(errorsPath, JSON.stringify(errors, null, 2), 'utf-8');

  console.log(`Stored ${validBooks.length} valid books to output/books.json`);
  if (errors.length > 0) {
    console.warn(`Recorded ${errors.length} invalid books in output/errors.json`);
  }

  return {
    validCount: validBooks.length,
    invalidCount: errors.length,
    books: validBooks,
    errors
  };
}

module.exports = {
  normalizeRecord,
  processAndStoreRecords,
  OUTPUT_DIR
};
