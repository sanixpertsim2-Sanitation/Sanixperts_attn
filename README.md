# Sanixperts_attn

NGTeco Office Portal → Google Sheets payroll sync. Scrapes "Total Time(h)" and updates the IM2 Payroll sheet.

## If GitHub Actions fails (blank page, inputs=0)

The NGTeco portal may block data-center IPs (e.g. GitHub Actions). Run locally:

```bash
pip install -r requirements.txt
playwright install chromium
# Set NGTECO_USER, NGTECO_PASS, GOOGLE_SHEETS_JSON
python scraper.py
```

For visible browser: `HEADLESS=false python scraper.py`
