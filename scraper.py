import os, json, gspread, datetime, time
from playwright.sync_api import sync_playwright
from oauth2client.service_account import ServiceAccountCredentials

def run_sync():
    # 1. AUTHENTICATION
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds_dict = json.loads(os.environ["GOOGLE_SHEETS_JSON"])
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    client = gspread.authorize(creds)
    
    spreadsheet = client.open("IM2 Payroll January 26 - February 8 2026") 
    sheet = spreadsheet.worksheet("PAYROLL") 

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        
        print("Opening NGTeco Portal...")
        page.goto("https://office.ngteco.com/login", wait_until="load", timeout=60000)
        
        # Give the portal extra time for the login modal to pop up
        print("Waiting for portal elements to settle...")
        time.sleep(10)

        # --- STEP 1: DYNAMIC CHECKBOX DETECTION ---
        print("Scanning for agreement checkbox...")
        try:
            # Look for ANY checkbox or agreement text and click it
            # We use a broad selector here to find hidden Ant-Design checkboxes
            checkbox_selectors = [
                'input[type="checkbox"]',
                '.ant-checkbox-input',
                '.ant-checkbox',
                'text="I have read"',
                'text="agree"'
            ]
            
            for selector in checkbox_selectors:
                el = page.locator(selector).first
                if el.is_visible():
                    el.click(force=True)
                    print(f"Successfully triggered via: {selector}")
                    break
        except Exception as e:
            print(f"Checkbox detection skipped: {e}")

        time.sleep(3)

        # --- STEP 2: ANONYMOUS FIELD FILLING ---
        print("Filling credentials...")
        try:
            # Since fields have no IDs/Names, we use the input type or order
            # The first non-checkbox input is usually the username
            page.locator('input:not([type="checkbox"])').nth(0).fill(os.environ["NGTECO_USER"])
            # The password field is almost always type="password"
            page.locator('input[type="password"]').fill(os.environ["NGTECO_PASS"])
            
            # Click the main button (Login)
            page.locator('button[type="submit"], button:has-text("Login")').click()
            print("Login submitted.")
        except Exception as e:
            print(f"Fill failed: {e}")
            return

        # --- STEP 3: SYNC ---
        page.wait_for_load_state("networkidle")
        time.sleep(5)
        print("Navigating to Time Cards...")
        page.goto("https://office.ngteco.com/att/timecard/timecard")
        page.wait_for_selector("table", timeout=45000)

        # Fetch names and dates from your specific worksheet structure
        all_names = [n.strip() for n in sheet.col_values(2)] 
        date_headers = sheet.row_values(3)[4:19] 

        rows = page.query_selector_all("tr.ant-table-row")
        print(f"Found {len(rows)} rows on portal. Matching to Google Sheet...")

        for row in rows:
            cols = row.query_selector_all("td")
            if len(cols) < 5: continue
            
            p_name = cols[1].inner_text().strip()
            p_in = cols[2].inner_text().strip()
            total_h = cols[4].inner_text().strip()

            try:
                p_dt = datetime.datetime.strptime(p_in, "%Y-%m-%d %H:%M:%S")
                day_key = str(p_dt.day)

                if p_name in all_names and day_key in date_headers:
                    row_idx = all_names.index(p_name) + 1
                    col_idx = date_headers.index(day_key) + 5
                    sheet.update_cell(row_idx, col_idx, total_h)
                    print(f"UPDATED: {p_name} | Day {day_key} | {total_h}h")
            except:
                continue

        print("Sync finished.")
        browser.close()

if __name__ == "__main__":
    run_sync()
