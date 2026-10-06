# The Polite Scraper

> **FlyRank Internship · Backend Track · Week 5 · Assignment A9**  
> Download three catalogue pages from a practice sandbox, visit all 60 book pages, turn messy HTML into clean, checked JSON — politely, without crashing on a broken page, and with an honest report at the end of every run.

---

## 🎯 Target Classification (Stage 0)

- **Target Site**: `https://books.toscrape.com/`
- **Why**: Books to Scrape is an official, public sandbox specifically designed for web scraping practice and educational automation.
- **Scope**: Exactly the first three catalogue pages (`page-1.html`, `page-2.html`, `page-3.html`), covering exactly 60 books.
- **Data Collected**: Book title, product URL, price, availability status, star rating, product description, source catalogue page, and fetch timestamp.
- **Robots.txt Analysis**: We requested `https://books.toscrape.com/robots.txt` and recorded an **HTTP 404 response ("no robots file found")**. While a missing robots file does not grant carte blanche permission on the open web, the home page of `toscrape.com` explicitly welcomes scrapers: *"A fictional book store that wants to be scraped! Please feel free to scrape away."*
- **Ethical Appropriateness**: Collecting the first 60 books is lightweight, uses an identifying custom User-Agent, enforces a minimum 500ms delay between live requests, and caches every page locally so subsequent runs do not hit the live server.

> [!IMPORTANT]
> **"I will not reuse this code on another site without checking its rules and terms first."**

---

## 🚀 Quickstart: One Command to Run

### Installation & Run

```bash
# 1. Install dependencies (Cheerio & Zod)
npm install

# 2. Run the complete scraping pipeline
npm start
```

Running this command crawls the first 3 catalogue pages, extracts 60 books, normalizes and validates every record, survives error injection, and writes the output files in under 5 seconds (from cache) or ~35 seconds (from live network with polite delay).

To run unit tests:
```bash
npm test
```

---

## 🛠️ Tools & Architecture (JavaScript Lane)

- **Runtime**: Node.js 20+ (tested on Node v24.18)
- **HTTP Client**: Native Node.js `fetch` with `AbortSignal` timeout handling
- **HTML Parsing**: `Cheerio` (fast, server-side jQuery-like DOM traversal)
- **Schema Validation**: `Zod` (strict type enforcement & runtime guarantees)
- **Storage**: Local filesystem -> JSON (`output/books.json`, `output/run-report.json`, `output/errors.json`)

---

## 📜 Record Schema (Zod)

Every record is strictly normalized and validated before being saved to `output/books.json`:

```typescript
const BookSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  product_url: z.string().url().startsWith('https://', 'URL must start with https://'),
  price_text: z.string().min(1, 'Raw price text is required'),
  price_gbp: z.number().positive('Price GBP must be a positive number'),
  availability_text: z.string().min(1, 'Availability text is required'),
  in_stock: z.boolean(),
  stock_count: z.number().int().nonnegative().nullable(),
  rating_text: z.string().nullable(),
  rating_numeric: z.number().int().min(1).max(5).nullable(),
  description: z.string().nullable(),
  source_page: z.string().url().startsWith('https://'),
  fetched_at: z.string().refine((val) => !isNaN(Date.parse(val)))
});
```

---

## 🤝 Politeness Rules Implemented

1. **Honest User-Agent**: Every HTTP request includes an identifying user-agent linking back to this repository:
   ```text
   User-Agent: FlyRankInternship-A9/1.0 (+https://github.com/deepak007679/polite-scraper)
   ```
2. **Polite Request Throttling**: Live network requests enforce an intentional `500ms` delay between calls. Cached pages execute with zero delay.
3. **Hard Timeout Protection**: Every fetch is governed by an `AbortController` timeout (`8000ms`). Requests never hang indefinitely.
4. **Local Disk Caching (`cache/`)**: Fetched HTML files are saved locally. Subsequent runs read from disk instead of hammering the target sandbox.
5. **Smart Retry Semantics**: Transient `5xx` server errors and timeouts are retried once after 1 second. `404 Not Found` and `403 Forbidden` are **never retried** (because asking again will not create a missing page or change a denial).

---

## 💡 Why This Assignment Needed No Browser

> **This assignment needed no headless browser because the complete catalogue and product data are already present in the raw static HTML the server sends, so launching a browser like Puppeteer or Playwright would only add heavy CPU, memory, and latency costs without providing any benefit.**

---

## 📊 Proof of Execution: Real Run Report (`output/run-report.json`)

Below is the verified report from our pipeline execution:

```json
{
  "start_time": "2026-10-06T11:14:45.857Z",
  "end_time": "2026-10-06T11:14:46.986Z",
  "duration_ms": 1129,
  "pages_fetched": 0,
  "cache_hits": 60,
  "valid_records": 60,
  "invalid_records": 0,
  "failed_pages": 1,
  "failed_urls": [
    {
      "url": "https://books.toscrape.com/catalogue/deliberately-broken-page-404_9999/index.html",
      "reason": "HTTP 404 Not Found - page does not exist (https://books.toscrape.com/catalogue/deliberately-broken-page-404_9999/index.html)"
    }
  ]
}
```

---

## ⚠️ Honest Limitation

Our scraper is designed for static, server-rendered HTML. It parses raw markup delivered in the initial HTTP response. If a target website relies on client-side Single Page Application (SPA) rendering (e.g. React, Vue, or Angular rendering data dynamically via client-side GraphQL or WebSocket calls after JavaScript execution), this Cheerio-based pipeline would only see the empty `<div id="root"></div>` shell.

---

## ⚖️ Ethics Note

1. **Always prefer an official API**: If a service provides a public or authenticated REST/GraphQL API, always use the API rather than scraping HTML.
2. **Never bypass defenses**: Never circumvent authentication barriers, CAPTCHAs, paywalls, or access controls.
3. **Minimize footprint**: Collect only the specific fields required for your business logic; do not scrape entire sites indiscriminately.
