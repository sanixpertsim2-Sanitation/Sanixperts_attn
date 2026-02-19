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
   - `GOOGLE_SHEETS_JSON` or `GOOGLE_SHEETS_JSON_PATH` – Google service account

3. **If automated login fails** (blank page, inputs=0), use **manual login**:
   ```bash
   python login_manual.py
   ```
   Log in manually in the browser, then press Enter when you see the dashboard. This saves `ngteco_session.json`. Then run:
   ```bash
   NGTECO_SESSION_PATH=ngteco_session.json python scraper.py
   ```
   The session lasts until you log out or it expires (refresh periodically).

4. **Run normally**
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
