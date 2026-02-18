# NGTeco Payroll Sync

Automates syncing employee work hours from the [NGTeco Office Portal](https://office.ngteco.com) to a Google Sheet payroll template.

## Setup

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   playwright install chromium
   ```

2. **Configure credentials** – copy `.env.example` to `.env` and fill in:
   - `NGTECO_USER` – NGTeco portal username
   - `NGTECO_PASS` – NGTeco portal password
   - `GOOGLE_SHEETS_JSON` – Google service account JSON (full object as string)

3. **Run locally**
   ```bash
   python scraper.py
   ```
   For visible browser: `HEADLESS=false python scraper.py`

## GitHub Actions

The workflow runs on push to `main`, hourly, and manual trigger. Add these **secrets** in repo Settings → Secrets:

- `NGTECO_USER`
- `NGTECO_PASS`
- `GOOGLE_SHEETS_JSON`
- `PROXY_URL` (optional) – residential proxy URL if NGTeco blocks GitHub’s IPs

## Google Sheet

- **Spreadsheet:** IM2 Payroll January 26 - February 8 2026
- **Worksheet:** PAYROLL
- **Layout:** Row 3 = days, Column B = employee names
