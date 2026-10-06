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
