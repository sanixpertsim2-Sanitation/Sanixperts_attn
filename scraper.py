"""
NGTeco Office Portal → Google Sheets Payroll Sync
Scrapes 'Total Time(h)' from NGTeco and syncs to the IM2 Payroll sheet.
"""
import os
from urllib.parse import urlparse

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

# Timeouts (ms) - portal is slow to render, CI is slower than local
PAGE_LOAD_TIMEOUT = 60000
ELEMENT_WAIT_TIMEOUT = 30000
INITIAL_RENDER_WAIT = 20  # seconds for JS to render anonymous form
POST_CHECKBOX_WAIT = 10  # Form may load slowly after checkbox
POST_LOGIN_WAIT = 5


def _click_checkbox_resilient(page):
    """
    Try multiple strategies to click the 'I have read and agree' checkbox.
    The portal uses anonymous Ant Design elements without IDs/names.
    """
    # Try JavaScript first (works even when checkbox is hidden/styled, incl. shadow DOM)
    try:
        page.evaluate("""() => {
            function findCheckbox(root) {
                const cb = root.querySelector('input[type="checkbox"]');
                if (cb) return cb;
                for (const el of root.querySelectorAll('*')) {
                    if (el.shadowRoot) {
                        const found = findCheckbox(el.shadowRoot);
                        if (found) return found;
                    }
                }
                return null;
            }
            const cb = findCheckbox(document);
            if (cb && !cb.checked) cb.click();
        }""")
        print("  ✓ Checkbox toggled via JavaScript")
        return True
    except Exception as e:
        print(f"  ✗ JavaScript checkbox: {e}")

    strategies = [
        ('.ant-checkbox-input', "Ant Design checkbox input"),
        ('.ant-checkbox', "Ant Design checkbox wrapper"),
        ('input[type="checkbox"]', "Generic checkbox"),
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

    try:
        page.keyboard.press("Tab")
        time.sleep(0.5)
        for _ in range(10):
            page.keyboard.press("Tab")
            time.sleep(0.3)
        page.keyboard.press("Space")
        print("  ✓ Checkbox toggled via keyboard")
        return True
    except Exception as e:
        print(f"  ✗ Keyboard fallback: {e}")

    return False


def _fill_login_via_js(page, username: str, password: str, frame=None) -> bool:
    """Fill and submit login form via JavaScript. Searches document + shadow DOM."""
    target = frame if frame else page
    try:
        result = target.evaluate(
            """([user, passw]) => {
                function findInputs(root) {
                    const inputs = Array.from(root.querySelectorAll('input'));
                    const elements = root.querySelectorAll('*');
                    for (const el of elements) {
                        if (el.shadowRoot) {
                            inputs.push(...findInputs(el.shadowRoot));
                        }
                    }
                    return inputs;
                }
                const inputs = findInputs(document);
                const textInput = inputs.find(i => i.type !== 'checkbox' && i.type !== 'password');
                const passInput = inputs.find(i => i.type === 'password');
                if (!textInput || !passInput) return false;
                textInput.value = user;
                textInput.dispatchEvent(new Event('input', { bubbles: true }));
                passInput.value = passw;
                passInput.dispatchEvent(new Event('input', { bubbles: true }));
                const btn = document.querySelector('button[type="submit"]') || document.querySelector('.ant-btn-primary') || document.querySelector('button.ant-btn');
                if (btn) { btn.click(); return true; }
                return false;
            }""",
            [username, password],
        )
        return bool(result)
    except Exception:
        return False


def _fill_login_resilient(page, username: str, password: str):
    """Fill username and password using type-based selectors."""
    for attempt in range(4):
        if _fill_login_via_js(page, username, password):
            print("  ✓ Login filled and submitted via JavaScript")
            return
        for frame in page.frames:
            if frame != page.main_frame and _fill_login_via_js(page, username, password, frame):
                print("  ✓ Login filled via JavaScript (iframe)")
                return
        time.sleep(4)

    input_selectors = [
        'input[type="text"]',
        'input[type="email"]',
        'input:not([type="password"]):not([type="checkbox"])',
        'input',
    ]
    input_found = False
    for sel in input_selectors:
        try:
            page.wait_for_selector(sel, timeout=10000, state="attached")
            input_found = True
            break
        except Exception:
            continue
    if not input_found:
        try:
            info = page.evaluate("""() => {
                function findInputs(root) {
                    let inputs = Array.from(root.querySelectorAll('input'));
                    root.querySelectorAll('*').forEach(el => {
                        if (el.shadowRoot) inputs = inputs.concat(findInputs(el.shadowRoot));
                    });
                    return inputs;
                }
                return {
                    inputCount: findInputs(document).length,
                    iframeCount: document.querySelectorAll('iframe').length,
                    bodyText: document.body?.innerText?.slice(0, 300) || ''
                };
            }""")
            body_preview = (info.get("bodyText") or "")[:150].replace("\n", " ")
            print(f"  Debug: inputs={info.get('inputCount', 0)}, iframes={info.get('iframeCount', 0)}, body={repr(body_preview)}")
            html = page.content()
            with open("scraper_page.html", "w", encoding="utf-8") as f:
                f.write(html)
            print("  Debug: saved scraper_page.html")
        except Exception as e:
            print(f"  Debug save failed: {e}")
        raise RuntimeError("Login form inputs never became visible")

    user_selectors = [
        'input[type="text"]',
        'input[type="email"]',
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
        try:
            user_escaped = json.dumps(username)
            page.evaluate(
                f"""() => {{
                    const inputs = Array.from(document.querySelectorAll('input')).filter(
                        i => i.type !== 'checkbox' && i.type !== 'password'
                    );
                    if (inputs[0]) {{
                        inputs[0].value = {user_escaped};
                        inputs[0].dispatchEvent(new Event('input', {{ bubbles: true }}));
                    }}
                }}"""
            )
            filled_user = True
            print("  ✓ Username filled via JavaScript")
        except Exception as e:
            print(f"  JS username fallback failed: {e}")
            raise RuntimeError("Could not fill username field")

    page.locator('input[type="password"]').first.wait_for(state="visible", timeout=5000)
    page.locator('input[type="password"]').first.fill(password, timeout=5000)
    print("  ✓ Password filled")

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
    scope = [
        "https://spreadsheets.google.com/feeds",
        "https://www.googleapis.com/auth/drive",
    ]
    creds_dict = json.loads(os.environ["GOOGLE_SHEETS_JSON"])
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    client = gspread.authorize(creds)
    sheet = client.open("IM2 Payroll January 26 - February 8 2026").worksheet("PAYROLL")

    with sync_playwright() as p:
        headless = os.environ.get("HEADLESS", "true").lower() in ("1", "true", "yes")
        browser = p.chromium.launch(
            headless=headless,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--no-sandbox",
            ],
        )
        context_options = {
            "viewport": {"width": 1280, "height": 800},
            "user_agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ),
            "ignore_https_errors": True,
        }
        proxy_url = os.environ.get("PROXY_URL")
        if proxy_url:
            parsed = urlparse(proxy_url)
            port = parsed.port or (443 if parsed.scheme == "https" else 80)
            proxy = {"server": f"{parsed.scheme or 'http'}://{parsed.hostname}:{port}"}
            if parsed.username and parsed.password:
                proxy["username"] = parsed.username
                proxy["password"] = parsed.password
            context_options["proxy"] = proxy
            print("Using proxy for NGTeco (bypass data-center block)")
        context = browser.new_context(**context_options)
        page = context.new_page()
        page.set_default_timeout(ELEMENT_WAIT_TIMEOUT)

        try:
            print("Opening NGTeco Portal...")
            page.goto(
                "https://office.ngteco.com/login",
                wait_until="load",
                timeout=PAGE_LOAD_TIMEOUT,
            )

            print("Waiting for portal JS to render...")
            time.sleep(INITIAL_RENDER_WAIT)
            page.wait_for_load_state("networkidle", timeout=30000)

            print("Looking for agreement checkbox...")
            _click_checkbox_resilient(page)
            time.sleep(POST_CHECKBOX_WAIT)
            try:
                page.wait_for_load_state("networkidle", timeout=15000)
            except Exception:
                pass

            print("Filling credentials...")
            _fill_login_resilient(
                page,
                os.environ["NGTECO_USER"],
                os.environ["NGTECO_PASS"],
            )

            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(POST_LOGIN_WAIT)

            print("Navigating to Time Cards...")
            page.goto(
                "https://office.ngteco.com/att/timecard/timecard",
                wait_until="domcontentloaded",
                timeout=PAGE_LOAD_TIMEOUT,
            )
            page.wait_for_selector("table", timeout=45000, state="visible")

            names = [n.strip() for n in sheet.col_values(2)]
            dates = sheet.row_values(3)[4:19]

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
