const cheerio = require('cheerio');
const { fetchWithCache } = require('./fetcher');

const POLITENESS_DELAY_MS = 500;

/**
 * Extracts a single book raw record from its product detail page.
 * @param {string} productUrl - Absolute URL of the book product page
 * @param {string} sourcePage - Provenance catalogue URL where this link was found
 * @returns {Promise<object>} Raw record with all 8 specified keys
 */
async function extractBook(productUrl, sourcePage) {
  // Derive safe cache filename from URL slug
  const urlParts = productUrl.split('/').filter(Boolean);
  const slug = urlParts[urlParts.length - 2] || 'book';
  const cacheFilename = `book-${slug}.html`;

  const { html, fromCache } = await fetchWithCache(productUrl, cacheFilename);
  const $ = cheerio.load(html);

  // Target the product main area specifically
  const productMain = $('article.product_page, .product_main');

  const title = $('h1').text().trim();
  const price_text = productMain.find('.price_color').first().text().trim();
  const availability_text = productMain.find('.instock.availability').text().replace(/\s+/g, ' ').trim();

  // Extract rating string (e.g. "Three", "One")
  const ratingEl = productMain.find('.star-rating');
  let rating_text = null;
  if (ratingEl.length > 0) {
    const classes = ratingEl.attr('class').split(' ');
    rating_text = classes.find((c) => c !== 'star-rating') || null;
  }

  // Description is optional in schema; store null if missing
  const descEl = $('#product_description').next('p');
  const description = (descEl.length > 0 && descEl.text().trim() !== '') ? descEl.text().trim() : null;

  const rawRecord = {
    title,
    product_url: productUrl,
    price_text,
    availability_text,
    rating_text,
    description,
    source_page: sourcePage || 'https://books.toscrape.com/catalogue/page-1.html',
    fetched_at: new Date().toISOString()
  };

  // Wait 500ms between real live requests
  if (!fromCache) {
    await new Promise((resolve) => setTimeout(resolve, POLITENESS_DELAY_MS));
  }

  return rawRecord;
}

/**
 * Extracts raw records for an array of book URLs.
 * @param {string[]} bookUrls - List of 60 book URLs
 * @param {Map<string, string>} [urlToSourceMap] - Mapping of book URL to source page
 * @returns {Promise<object[]>} Array of raw records
 */
async function extractAllBooks(bookUrls, urlToSourceMap = new Map()) {
  const records = [];
  console.log(`Starting extraction for ${bookUrls.length} books...`);

  for (let i = 0; i < bookUrls.length; i++) {
    const url = bookUrls[i];
    const sourcePage = urlToSourceMap.get(url) || 'https://books.toscrape.com/catalogue/page-1.html';
    try {
      const record = await extractBook(url, sourcePage);
      records.push(record);
      if ((i + 1) % 10 === 0 || i === bookUrls.length - 1) {
        console.log(`Progress: ${i + 1}/${bookUrls.length} books processed.`);
      }
    } catch (err) {
      console.error(`Failed to extract ${url}:`, err.message);
    }
  }

  console.log(`CHECKPOINT: detail_pages=${records.length}`);
  return records;
}

module.exports = {
  extractBook,
  extractAllBooks,
  POLITENESS_DELAY_MS
};
