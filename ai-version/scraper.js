// Quarantined AI Version Scraper
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { z } = require('zod');

const CACHE = path.join(__dirname, 'cache');
if (!fs.existsSync(CACHE)) fs.mkdirSync(CACHE, { recursive: true });

const bookSchema = z.object({
  title: z.string(),
  product_url: z.string().url(),
  price_gbp: z.number()
});

async function get(url) {
  const file = path.join(CACHE, encodeURIComponent(url) + '.html');
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf-8');
  
  await new Promise(r => setTimeout(r, 500));
  const res = await fetch(url, { headers: { 'User-Agent': 'Bot' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  fs.writeFileSync(file, html);
  return html;
}

async function run() {
  const books = [];
  for (let i = 1; i <= 3; i++) {
    const html = await get(`https://books.toscrape.com/catalogue/page-${i}.html`);
    const $ = cheerio.load(html);
    $('article.product_pod h3 a').each((_, a) => {
      const href = $(a).attr('href');
      books.push(`https://books.toscrape.com/catalogue/${href}`);
    });
  }

  const results = [];
  for (const url of books) {
    try {
      const html = await get(url);
      const $ = cheerio.load(html);
      const title = $('h1').text();
      const price = parseFloat($('.price_color').text().replace('£', ''));
      results.push(bookSchema.parse({ title, product_url: url, price_gbp: price }));
    } catch (e) {
      console.log('Failed:', url);
    }
  }

  fs.writeFileSync('ai-books.json', JSON.stringify(results, null, 2));
  console.log(`Saved ${results.length} books.`);
}

if (require.main === module) run();
