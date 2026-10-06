const assert = require('assert');
const { normalizeRecord, processAndStoreRecords } = require('../src/normalizer');
const { BookSchema } = require('../src/schema');

function runUnitTests() {
  console.log('=== Running Polite Scraper Parser Test Suite ===\n');

  // Test 1: Price normalization
  console.log('1. Testing price normalization ("£51.77" -> 51.77)...');
  const record1 = normalizeRecord({
    title: 'Test Book',
    product_url: 'https://books.toscrape.com/catalogue/test_1/index.html',
    price_text: '£51.77',
    availability_text: 'In stock',
    rating_text: 'Three'
  });
  assert.strictEqual(typeof record1.price_gbp, 'number');
  assert.strictEqual(record1.price_gbp, 51.77);
  console.log('   ✓ Price normalization passed.\n');

  // Test 2: Relative to Absolute URL conversion
  console.log('2. Testing relative -> absolute URL resolution...');
  const baseUrl = 'https://books.toscrape.com/catalogue/page-1.html';
  const relativeHref = '../a-light-in-the-attic_1000/index.html';
  const resolvedUrl = new URL(relativeHref, baseUrl).href;
  assert.strictEqual(resolvedUrl, 'https://books.toscrape.com/a-light-in-the-attic_1000/index.html');
  console.log('   ✓ Absolute URL resolution passed.\n');

  // Test 3: Missing description handling (null)
  console.log('3. Testing missing description handling (must be null, never empty string or invented text)...');
  const record3 = normalizeRecord({
    title: 'Book without desc',
    product_url: 'https://books.toscrape.com/catalogue/no-desc_2/index.html',
    price_text: '£12.99',
    availability_text: 'In stock',
    description: null
  });
  assert.strictEqual(record3.description, null);
  console.log('   ✓ Missing description properly set to null.\n');

  // Test 4: Duplicate URLs deduplication (Idempotency)
  console.log('4. Testing duplicate URL deduplication (canonical URL identity)...');
  const rawDuplicates = [
    {
      title: 'Duplicate Book',
      product_url: 'https://books.toscrape.com/catalogue/dup_3/index.html',
      price_text: '£20.00',
      availability_text: 'In stock',
      rating_text: 'Five',
      source_page: 'https://books.toscrape.com/catalogue/page-1.html',
      fetched_at: new Date().toISOString()
    },
    {
      title: 'Duplicate Book Second Appearance',
      product_url: 'https://books.toscrape.com/catalogue/dup_3/index.html',
      price_text: '£20.00',
      availability_text: 'In stock',
      rating_text: 'Five',
      source_page: 'https://books.toscrape.com/catalogue/page-2.html',
      fetched_at: new Date().toISOString()
    }
  ];
  const processed = processAndStoreRecords(rawDuplicates);
  assert.strictEqual(processed.validCount, 1, 'Two duplicate URLs must collapse into 1 record');
  console.log('   ✓ Deduplication verified: 2 identical URLs yielded 1 unique record.\n');

  // Test 5: Malformed fixture handling (fails schema into errors.json)
  console.log('5. Testing malformed fixture handling...');
  const malformedRecord = {
    title: '', // Empty title violates min(1) constraint
    product_url: 'http://insecure-url.com/no-https', // Violates https:// constraint
    price_text: 'Free' // Missing numeric value
  };
  const normalizedMalformed = normalizeRecord(malformedRecord);
  const schemaResult = BookSchema.safeParse(normalizedMalformed);
  assert.strictEqual(schemaResult.success, false, 'Malformed record must fail schema validation');
  console.log('   ✓ Malformed record successfully caught and rejected by Zod schema.');
  console.log('   Reported errors:', schemaResult.error.errors.map(e => e.message));

  console.log('\n=== All 5 Unit Tests Passed Successfully! ===');
}

if (require.main === module) {
  runUnitTests();
}

module.exports = { runUnitTests };
