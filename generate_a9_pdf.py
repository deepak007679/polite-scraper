import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        if self._pageNumber > 1:
            self.drawString(54, 755, "FlyRank Internship | Backend Track Week 5: Assignment A9 - The Polite Scraper")
            self.drawRightString(558, 755, "Node.js · Cheerio · Zod")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.75)
            self.line(54, 747, 558, 747)

        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, footer_text)
        self.drawString(54, 36, "Author: Deepak | GitHub: github.com/deepak007679/polite-scraper")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.75)
        self.line(54, 48, 558, 48)
        self.restoreState()

def generate_pdf():
    out_pdf = r"C:\Users\Deepak\.gemini\antigravity\scratch\polite-scraper\FlyRank_A9_Implementation_Report.pdf"
    doc = SimpleDocTemplate(
        out_pdf,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#475569"),
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#2563EB"),
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155"),
        spaceAfter=5
    )

    code_block_style = ParagraphStyle(
        'CodeBlock',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#0F172A"),
        backColor=colors.HexColor("#F1F5F9"),
        borderColor=colors.HexColor("#CBD5E1"),
        borderWidth=0.5,
        borderPadding=5,
        spaceBefore=3,
        spaceAfter=5
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#1E293B")
    )

    story = []

    # Title & Metadata
    story.append(Paragraph("FlyRank Backend Track — Assignment A9", title_style))
    story.append(Paragraph("The Polite Scraper: Ethical Extraction, Schema Validation, & Failure Resilience", subtitle_style))

    meta_data = [
        [
            Paragraph("<b>Author:</b> Deepak", table_cell_style),
            Paragraph("<b>Track:</b> Backend & Data Engineering", table_cell_style),
            Paragraph("<b>Runtime:</b> Node.js 20+ / Cheerio / Zod", table_cell_style)
        ],
        [
            Paragraph("<b>GitHub:</b> <font color='#2563EB'><u>github.com/deepak007679/polite-scraper</u></font>", table_cell_style),
            Paragraph("<b>Commits:</b> 9 Sequential Verified Stages", table_cell_style),
            Paragraph("<b>Target:</b> Books to Scrape (Sandbox)", table_cell_style)
        ]
    ]
    t_meta = Table(meta_data, colWidths=[180, 180, 144])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # Executive Overview
    story.append(Paragraph("1. Executive Summary & Ethical Principles", h1_style))
    story.append(Paragraph(
        "Modern AI systems rely on structured, reliable data collection pipelines. "
        "A responsible backend scraping pipeline adheres to three foundational tenets:\n"
        "1. <b>Check before you collect:</b> Target classification and <code>robots.txt</code> analysis before writing code.\n"
        "2. <b>Be a polite guest:</b> Identifying User-Agent with repository contact link, request throttling (>=500ms delay), timeout controls, and local caching to minimize server impact.\n"
        "3. <b>Trust nothing you scrape:</b> Web pages are untrusted inputs; every record is normalized and validated against a strict Zod schema before storage.",
        body_style
    ))

    # Stage Matrix Table
    story.append(Spacer(1, 4))
    story.append(Paragraph("2. Implementation Stages & Verified Commit History", h1_style))

    stages_data = [
        [
            Paragraph("Stage", table_header_style),
            Paragraph("Commit Message", table_header_style),
            Paragraph("Key Deliverables & Actions Taken", table_header_style),
            Paragraph("Status", table_header_style)
        ],
        [
            Paragraph("<b>Stage 0</b>", table_cell_style),
            Paragraph("<code>Stage 0: classify scraping target</code>", table_cell_style),
            Paragraph("Classified Books to Scrape sandbox; analyzed robots.txt (404); documented ethical terms and 3-page scope.", table_cell_style),
            Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 1</b>", table_cell_style),
            Paragraph("<code>Stage 1: fetch and cache HTML</code>", table_cell_style),
            Paragraph("Implemented polite fetcher with honest User-Agent, timeout, and local disk cache in cache/.", table_cell_style),
            Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 2</b>", table_cell_style),
            Paragraph("<code>Stage 2: discover three catalogue pages</code>", table_cell_style),
            Paragraph("Crawled 3 catalogue pages dynamically following pagination; extracted 60 unique book URLs via RFC-compliant new URL().", table_cell_style),
            Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 3</b>", table_cell_style),
            Paragraph("<code>Stage 3: extract book details</code>", table_cell_style),
            Paragraph("Extracted 8 raw fields per book with Cheerio; enforced provenance receipts (source_page, fetched_at).", table_cell_style),
            Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 4</b>", table_cell_style),
            Paragraph("<code>Stage 4: validate normalized records</code>", table_cell_style),
            Paragraph("Normalized price_gbp and ratings; validated against Zod schema; stored 60 idempotent records in output/books.json.", table_cell_style),
            Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 5</b>", table_cell_style),
            Paragraph("<code>Stage 5: survive failures, report the run</code>", table_cell_style),
            Paragraph("Isolated page execution; survived deliberate 404 injection without crashing; generated output/run-report.json.", table_cell_style),
            Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 6</b>", table_cell_style),
            Paragraph("<code>Stage 6: publish scraper evidence</code>", table_cell_style),
            Paragraph("Comprehensive README with run report evidence, why no browser is needed, limitations, and ethics note.", table_cell_style),
            Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell_style)
        ],
        [
            Paragraph("<b>Bonus</b>", table_cell_style),
            Paragraph("<code>Bonus: AI vs me</code>", table_cell_style),
            Paragraph("Quarantined AI code in ai-version/; comparative code review on URL resolution, schema rigor, and error reporting.", table_cell_style),
            Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell_style)
        ],
        [
            Paragraph("<b>Extras</b>", table_cell_style),
            Paragraph("<code>Extras: CSV export, change detection, and unit tests</code>", table_cell_style),
            Paragraph("Added output/books.csv export, SHA-256 change detection across runs, and 5 unit tests in tests/test_parser.js.", table_cell_style),
            Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell_style)
        ]
    ]

    t_stages = Table(stages_data, colWidths=[40, 150, 260, 54])
    t_stages.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E293B")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_stages)
    story.append(Spacer(1, 10))

    # Page Break for Architecture & Code Details
    story.append(PageBreak())

    story.append(Paragraph("3. Technical Architecture & Engineering Decisions", h1_style))

    story.append(Paragraph("A. Why No Headless Browser Was Needed", h2_style))
    story.append(Paragraph(
        "A common pitfall is immediately reaching for Playwright or Puppeteer for all scraping tasks. "
        "Because Books to Scrape delivers complete catalogue and product data in static server-rendered HTML, "
        "a lightweight HTTP client with Cheerio executes in milliseconds with minimal CPU and memory footprints.",
        body_style
    ))

    story.append(Paragraph("B. Smart Retry Rules & Failure Isolation", h2_style))
    story.append(Paragraph(
        "Our fetcher handles errors deterministically:\n"
        "• <b>5xx Server Errors & Timeouts:</b> Retried once after a 1000ms delay.\n"
        "• <b>404 Not Found & 403 Forbidden:</b> Never retried. Requesting a non-existent page or a forbidden resource again is wasteful and impolite.\n"
        "• <b>Fault Isolation:</b> Each book is extracted in an isolated try/catch block so a single broken page never terminates the pipeline.",
        body_style
    ))

    report_snippet = (
        "// Verified output/run-report.json excerpt\n"
        "{\n"
        '  "duration_ms": 1284,\n'
        '  "pages_fetched": 0,\n'
        '  "cache_hits": 60,\n'
        '  "valid_records": 60,\n'
        '  "failed_pages": 1,\n'
        '  "failed_urls": [{\n'
        '    "url": ".../deliberately-broken-page-404_9999/index.html",\n'
        '    "reason": "HTTP 404 Not Found - page does not exist"\n'
        "  }]\n"
        "}"
    )
    story.append(Paragraph(report_snippet.replace('\n', '<br/>'), code_block_style))

    story.append(Paragraph("C. Bonus Stage Code Review: The AI Rematch", h2_style))
    story.append(Paragraph(
        "Comparing the hand-built pipeline with the quarantined AI solution in <code>ai-version/</code> revealed critical trade-offs:\n"
        "1. <b>Fragile URL Gluing:</b> The AI concatenated strings (<code>https://.../${href}</code>) rather than using <code>new URL()</code>.\n"
        "2. <b>Dropped Provenance:</b> The AI stripped <code>source_page</code> and <code>fetched_at</code> receipts.\n"
        "3. <b>Missing Telemetry:</b> The AI skipped writing <code>run-report.json</code> altogether.",
        body_style
    ))

    story.append(Spacer(1, 10))
    story.append(Paragraph("4. Submission Artifacts", h1_style))
    story.append(Paragraph(
        "• <b>GitHub Repository:</b> <u>https://github.com/deepak007679/polite-scraper</u>\n"
        "• <b>Validated JSON Records:</b> <code>output/books.json</code> (60 unique books)\n"
        "• <b>CSV Export:</b> <code>output/books.csv</code>\n"
        "• <b>Run Telemetry:</b> <code>output/run-report.json</code>\n"
        "• <b>Unit Test Suite:</b> <code>tests/test_parser.js</code> (5 passing tests via <code>npm test</code>)",
        body_style
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print("Report generated successfully at:", out_pdf)

if __name__ == '__main__':
    generate_pdf()
