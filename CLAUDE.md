# CLAUDE.md

## Project Overview

**Dividend Tracker (配当管理)** — A web application for Japanese stock investors to track dividend payments, calculate expected income, and view shareholder benefits (株主優待). The repository also contains reference material for C法 (Stratified Mahalanobis-Taguchi method) in the README.

## Repository Structure

```
C-MT-/
├── CLAUDE.md                  # This file
├── README.md                  # C法/MT法 statistical method reference (unrelated to the app)
├── docs/
│   └── index.html             # Standalone client-only version (localStorage, no backend)
└── dividend_app/              # Main Flask application
    ├── app.py                 # Flask backend — REST API + date calculations
    ├── requirements.txt       # Python deps (flask>=3.0)
    ├── stocks.json            # File-based data store (JSON array of stock records)
    ├── templates/
    │   └── index.html         # Jinja2 template served by Flask
    └── static/
        ├── app.js             # Frontend logic — CRUD, modals, rendering
        └── style.css          # Styles for the Flask-served version
```

## Two Application Versions

1. **Flask app** (`dividend_app/`): Server-backed with REST API, data in `stocks.json`.
2. **Standalone** (`docs/index.html`): Single HTML file, uses `localStorage`, fetches stock/dividend data via Yahoo Finance API and yuutai info from kabutan.jp through CORS proxies. This is the more feature-rich and recently updated version.

## Tech Stack

- **Backend**: Python 3 / Flask 3.0+
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 — no frameworks
- **Data storage**: JSON file (`stocks.json`) for Flask version, `localStorage` for standalone
- **External APIs**: Yahoo Finance v8 chart API, kabutan.jp (scraped via CORS proxies)
- **Package management**: pip with `requirements.txt`

## How to Run

```bash
# Install dependencies
pip install -r dividend_app/requirements.txt

# Start the Flask dev server (port 5000)
python dividend_app/app.py
```

The standalone version (`docs/index.html`) can be opened directly in a browser.

## API Endpoints (Flask version)

| Method | Path                   | Description          |
|--------|------------------------|----------------------|
| GET    | `/`                    | Serve main HTML      |
| GET    | `/api/stocks`          | List all stocks      |
| POST   | `/api/stocks`          | Create a stock entry |
| PUT    | `/api/stocks/<id>`     | Update a stock entry |
| DELETE | `/api/stocks/<id>`     | Delete a stock entry |

## Data Model

Each stock record contains:
- `id` — UUID string
- `code` — 4-5 digit Japanese stock code (e.g., "7203")
- `name` — Company name in Japanese
- `record_date` — 権利確定日 (record date, ISO format)
- `dividend_per_share` — Dividend amount per share (float)
- `shares_held` — Number of shares owned (int)
- `dividend_type` — "期末" (year-end) or "中間" (interim)
- `note` — Free-text note

The standalone version adds: `annual_dividend`, `dividend_yield`, `yuutai` (shareholder benefits JSON).

## Key Business Logic

- **権利付最終日 (last buy date)**: Calculated as 2 business days before the record date, skipping weekends. Implemented in `_calc_last_buy_date()` in `app.py` and `lastBuyDate()` in `docs/index.html`.
- **Fiscal dates**: Japanese fiscal year — 期末 (March 31) and 中間 (September 30).
- **Yuutai scraping**: Parses `stock_yutai_detail_box` from kabutan.jp HTML, extracting benefit tiers (必要株数 / 優待内容) with notes.

## Development Conventions

- **Language**: UI text and comments are in Japanese. Code identifiers are in English.
- **No build step**: Static files served directly. No bundler, transpiler, or minifier.
- **No test suite**: No automated tests exist. Manual browser testing only.
- **No linter/formatter**: No eslint, prettier, black, or flake8 configured.
- **No CI/CD**: No GitHub Actions or other pipeline configuration.
- **Minimal dependencies**: Only `flask>=3.0` is required. Frontend is dependency-free.

## Important Notes for AI Assistants

- `stocks.json` contains sample data and is the live data file — avoid overwriting it carelessly.
- The standalone `docs/index.html` is a self-contained single file (~600 lines) with embedded CSS and JS. When editing, be aware that styles and scripts are inline.
- CORS proxies (`allorigins.win`, `corsproxy.io`, `codetabs.com`) are used for external API calls from the browser; these may break if proxy services change.
- The Flask version and standalone version are independent — they don't share state or code.
- Holiday handling is not implemented in business day calculations (weekends only).
