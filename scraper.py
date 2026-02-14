"""
NGTeco Office Portal → Google Sheets Payroll Sync
Scrapes 'Total Time(h)' from NGTeco and syncs to the IM2 Payroll sheet.
"""
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # Use system env vars if python-dotenv not installed
import json
import gspread
import datetime
import time
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
from oauth2client.service_account import ServiceAccountCredentials

# Timeouts (ms) - portal is slow to render
PAGE_LOAD_TIMEOUT = 60000
ELEMENT_WAIT_TIMEOUT = 15000
INITIAL_RENDER_WAIT = 12  # seconds for JS to render anonymous form
POST_CHECKBOX_WAIT = 3
POST_LOGIN_WAIT = 5


def _click_checkbox_resilient(page):
    """
    Try multiple strategies to click the 'I have read and agree' checkbox.
    The portal uses anonymous Ant Design elements without IDs/names.
    """
    strategies = [
        # Ant Design checkbox (often hidden, wrapped in .ant-checkbox)
        ('.ant-checkbox-input', "Ant Design checkbox input"),
        ('.ant-checkbox', "Ant Design checkbox wrapper"),
        ('input[type="checkbox"]', "Generic checkbox"),
        # Click by label text (Playwright text selector)
        ('label:has-text("I have read")', "Label with agreement text"),
        ('text="I have read"', "Text node"),
        ('[class*="checkbox"]', "Any element with checkbox in class"),
    ]

    for selector, desc in strategies:
        try:
            loc = page.locator(selector).first
            loc.wait_for(state="attached", timeout=5000)
            loc.click(force=True, timeout=5000)
            print(f"  ✓ Checkbox clicked via: {desc}")
            return True
        except Exception as e:
            print(f"  ✗ {desc}: {type(e).__name__}")
            continue

    # Fallback: try keyboard navigation (Tab to focus, Space to toggle)
    try:
        page.keyboard.press("Tab")
        time.sleep(0.5)
        for _ in range(5):
            page.keyboard.press("Tab")
            time.sleep(0.3)
        page.keyboard.press("Space")
        print("  ✓ Checkbox toggled via keyboard")
        return True
    except Exception as e:
        print(f"  ✗ Keyboard fallback: {e}")

    return False


def _fill_login_resilient(page, username: str, password: str):
    """
    Fill username and password using type-based selectors.
    Username = first visible text input (not checkbox, not password).
    """
    # Wait for at least one input to be visible
    page.wait_for_selector(
        'input[type="text"], input:not([type="password"]):not([type="checkbox"])',
        timeout=ELEMENT_WAIT_TIMEOUT,
        state="visible",
    )

    # Username: first non-checkbox, non-password input
    user_selectors = [
        'input[type="text"]',
        'input:not([type="password"]):not([type="checkbox"])',
        'input[autocomplete="username"]',
    ]
    filled_user = False
    for sel in user_selectors:
        try:
            loc = page.locator(sel).first
            loc.wait_for(state="visible", timeout=5000)
            loc.fill(username, timeout=5000)
            filled_user = True
            print("  ✓ Username filled")
            break
        except Exception:
            continue

    if not filled_user:
        raise RuntimeError("Could not fill username field")

    # Password
    page.locator('input[type="password"]').first.wait_for(state="visible", timeout=5000)
    page.locator('input[type="password"]').first.fill(password, timeout=5000)
    print("  ✓ Password filled")

    # Submit
    submit_selectors = [
        'button[type="submit"]',
        'button:has-text("Login")',
        'button:has-text("Log in")',
        'button:has-text("Sign in")',
        '.ant-btn-primary',
        'button.ant-btn',
    ]
    for sel in submit_selectors:
        try:
            loc = page.locator(sel).first
            loc.wait_for(state="visible", timeout=5000)
            loc.click(timeout=5000)
            print("  ✓ Login submitted")
            return
        except Exception:
            continue
    raise RuntimeError("Could not find or click login button")


def run_sync():
    # --- Google Sheets setup ---
    scope = [
        "https://spreadsheets.google.com/feeds",
        "https://www.googleapis.com/auth/drive",
    ]
    creds_dict = json.loads(os.environ["GOOGLE_SHEETS_JSON"])
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    client = gspread.authorize(creds)
    sheet = client.open("IM2 Payroll January 26 - February 8 2026").worksheet("PAYROLL")

    with sync_playwright() as p:
        # Set HEADLESS=false to see the browser when debugging locally
        headless = os.environ.get("HEADLESS", "true").lower() in ("1", "true", "yes")
        browser = p.chromium.launch(headless=headless)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.set_default_timeout(ELEMENT_WAIT_TIMEOUT)

        try:
            # --- 1. LOGIN FLOW ---
            print("Opening NGTeco Portal...")
            page.goto(
                "https://office.ngteco.com/login",
                wait_until="domcontentloaded",
                timeout=PAGE_LOAD_TIMEOUT,
            )

            print("Waiting for portal JS to render...")
            time.sleep(INITIAL_RENDER_WAIT)

            # Checkbox (required before fields become interactable)
            print("Looking for agreement checkbox...")
            _click_checkbox_resilient(page)
            time.sleep(POST_CHECKBOX_WAIT)

            # Fill credentials
            print("Filling credentials...")
            _fill_login_resilient(
                page,
                os.environ["NGTECO_USER"],
                os.environ["NGTECO_PASS"],
            )

            # Wait for post-login navigation
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(POST_LOGIN_WAIT)

            # --- 2. SCRAPE & SYNC ---
            print("Navigating to Time Cards...")
            page.goto(
                "https://office.ngteco.com/att/timecard/timecard",
                wait_until="domcontentloaded",
                timeout=PAGE_LOAD_TIMEOUT,
            )
            page.wait_for_selector("table", timeout=45000, state="visible")

            names = [n.strip() for n in sheet.col_values(2)]
            dates = sheet.row_values(3)[4:19]  # Cols E to S (days 26..8)

            rows = page.query_selector_all("tr.ant-table-row")
            print(f"Found {len(rows)} rows. Syncing...")

            for row in rows:
                cols = row.query_selector_all("td")
                if len(cols) < 5:
                    continue
                name = cols[1].inner_text().strip()
                punch_in = cols[2].inner_text().strip()
                total_h = cols[4].inner_text().strip()

                try:
                    day = str(
                        datetime.datetime.strptime(
                            punch_in, "%Y-%m-%d %H:%M:%S"
                        ).day
                    )
                    if name in names and day in dates:
                        row_idx = names.index(name) + 1
                        col_idx = dates.index(day) + 5
                        sheet.update_cell(row_idx, col_idx, total_h)
                        print(f"  Synced: {name} | Day {day} | {total_h}h")
                except (ValueError, IndexError):
                    continue

            print("Sync finished.")

        except PlaywrightTimeout as e:
            print(f"Timeout: {e}")
            page.screenshot(path="scraper_timeout.png")
            print("Screenshot saved as scraper_timeout.png")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="scraper_error.png")
            print("Screenshot saved as scraper_error.png")
            raise
        finally:
            browser.close()


if __name__ == "__main__":
    run_sync()
