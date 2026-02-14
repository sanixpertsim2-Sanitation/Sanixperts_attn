# Sanixperts_attn

NGTeco Office Portal → Google Sheets payroll sync. Scrapes "Total Time(h)" and updates the IM2 Payroll sheet.

## GitHub Actions: NGTeco blocks data-center IPs

If you see `inputs=0, body=''`, the portal is blocking GitHub's IPs. Add a **residential proxy**:

1. Sign up for a proxy service (e.g. [Bright Data](https://brightdata.com), [Oxylabs](https://oxylabs.io), [Smartproxy](https://smartproxy.com))
2. Get a residential proxy URL: `http://user:pass@host:port`
3. Add **PROXY_URL** to GitHub repo secrets (Settings → Secrets → Actions)
4. Re-run the workflow

The scraper uses the proxy automatically when `PROXY_URL` is set.
