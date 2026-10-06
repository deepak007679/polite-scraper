const cheerio = require('cheerio');
const { fetchWithCache } = require('./fetcher');

const POLITENESS_DELAY_MS = 500;

/**
 * Extracts a single book raw record from its product detail page.
 * @param {string} productUrl - Absolute URL of the book product page
 * @param {string} sourcePage - Provenance catalogue URL where this link was found
 * @param {object} [reporter] - Optional RunReporter instance
 * @returns {Promise<object>} Raw record with all 8 specified keys
 */
async function extractBook(productUrl, sourcePage, reporter) {
  const urlParts = productUrl.split('/').filter(Boolean);
  const slug = urlParts[urlParts.length - 2] || 'book';
  const cacheFilename = `book-${slug}.html`;

  const { html, fromCache } = await fetchWithCache(productUrl, cacheFilename);
  if (reporter) {
    reporter.recordPageFetch(fromCache);
  }

  const $ = cheerio.load(html);
  const productMain = $('article.product_page, .product_main');

  const title = $('h1').text().trim();
  const price_text = productMain.find('.price_color').first().text().trim();
  const availability_text = productMain.find('.instock.availability').text().replace(/\s+/g, ' ').trim();

  const ratingEl = productMain.find('.star-rating');
  let rating_text = null;
  if (ratingEl.length > 0) {
    const classes = ratingEl.attr('class').split(' ');
    rating_text = classes.find((c) => c !== 'star-rating') || null;
  }

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

  if (!fromCache) {
    await new Promise((resolve) => setTimeout(resolve, POLITENESS_DELAY_MS));
  }

  return rawRecord;
}

/**
 * Extracts raw records for an array of book URLs, surviving page failures.
 * @param {string[]} bookUrls - List of book URLs
 * @param {Map<string, string>} [urlToSourceMap] - Mapping of book URL to source page
 * @param {object} [reporter] - Optional RunReporter instance
 * @returns {Promise<object[]>} Array of raw records
 */
async function extractAllBooks(bookUrls, urlToSourceMap = new Map(), reporter) {
  const records = [];

  for (let i = 0; i < bookUrls.length; i++) {
    const url = bookUrls[i];
    const sourcePage = urlToSourceMap.get(url) || 'https://books.toscrape.com/catalogue/page-1.html';
    try {
      const record = await extractBook(url, sourcePage, reporter);
      records.push(record);
    } catch (err) {
      console.warn(`[SKIPPED FAILED PAGE] ${url}: ${err.message}`);
      if (reporter) {
        reporter.recordPageFailure(url, err);
      }
    }
  }

  return records;
}

module.exports = {
  extractBook,
  extractAllBooks,
  POLITENESS_DELAY_MS
};
