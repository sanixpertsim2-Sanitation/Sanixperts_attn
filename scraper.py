import os, json, gspread, datetime, time
from playwright.sync_api import sync_playwright
from oauth2client.service_account import ServiceAccountCredentials

def run_sync():
    # 1. AUTHENTICATION & SHEET ACCESS
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds_dict = json.loads(os.environ["GOOGLE_SHEETS_JSON"])
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    client = gspread.authorize(creds)
    
    # Verify this matches your Google Sheet filename
    spreadsheet = client.open("IM2 Payroll January 26 - February 8 2026") 
    sheet = spreadsheet.worksheet("PAYROLL") 

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        print("Opening NGTeco Portal...")
        page.goto("https://office.ngteco.com/login", wait_until="networkidle")
        
        # --- ENHANCED CHECKBOX LOGIC ---
        print("Attempting to acknowledge terms...")
        try:
            # Try finding the checkbox input directly and forcing a check
            checkbox = page.locator('input[type="checkbox"], .ant-checkbox-input').first
            checkbox.wait_for(state="attached", timeout=5000)
            checkbox.check(force=True)
            print("Checkbox checked via direct input.")
        except:
            try:
                # If direct check fails, click the wrapper or text
                page.locator('.ant-checkbox').click()
                print("Checkbox clicked via wrapper.")
            except:
                print("Could not find checkbox, moving to credentials...")

        page.wait_for_timeout(1000)

        # --- LOGIN ---
        print("Filling credentials...")
        try:
            page.get_by_placeholder("Username").or_(page.locator('input[name="username"]')).fill(os.environ["NGTECO_USER"])
            page.get_by_placeholder("Password").or_(page.locator('input[name="password"]')).fill(os.environ["NGTECO_PASS"])
            page.get_by_role("button", name="Login").click()
            page.wait_for_load_state("networkidle")
            print("Login successful.")
        except Exception as e:
            print(f"Login failed: {e}")
            return

        # --- NAVIGATION ---
        print("Navigating to Time Card Management...")
        page.goto("https://office.ngteco.com/att/timecard/timecard")
        page.wait_for_selector("table", timeout=20000)

        # --- DATA SYNC ---
        all_names = [n.strip() for n in sheet.col_values(2)] 
        date_headers = sheet.row_values(3)[4:19] 

        rows = page.query_selector_all("tr.ant-table-row")
        
        for row in rows:
            cols = row.query_selector_all("td")
            if len(cols) < 5: continue
            
            p_name = cols[1].inner_text().strip()
            p_in = cols[2].inner_text().strip()
            p_out = cols[3].inner_text().strip()
            total_h = cols[4].inner_text().strip()

            if not p_out or any(x in p_out.lower() for x in ["n/a", "working", "--"]):
                continue

            try:
                p_dt = datetime.datetime.strptime(p_in, "%Y-%m-%d %H:%M:%S")
                day_key = str(p_dt.day)

                if p_name in all_names and day_key in date_headers:
                    row_idx = all_names.index(p_name) + 1
                    col_idx = date_headers.index(day_key) + 5
                    sheet.update_cell(row_idx, col_idx, total_h)
                    print(f"Updated: {p_name} on Day {day_key}")
            except:
                continue

        browser.close()

if __name__ == "__main__":
    run_sync()
