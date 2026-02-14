import os, json, gspread, datetime
from playwright.sync_api import sync_playwright
from oauth2client.service_account import ServiceAccountCredentials

def run_sync():
    # 1. AUTHENTICATION & SHEET ACCESS
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds_dict = json.loads(os.environ["GOOGLE_SHEETS_JSON"])
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    client = gspread.authorize(creds)
    
    # Using the name from your uploaded file
    spreadsheet = client.open("IM2 Payroll January 26 - February 8 2026") 
    sheet = spreadsheet.worksheet("PAYROLL") 

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set a standard desktop user agent to avoid being blocked
        context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")
        page = context.new_page()
        
        print("Opening NGTeco Portal...")
        page.goto("https://office.ngteco.com/login", wait_until="networkidle")
        
        # --- IMPROVED LOGIN LOGIC ---
        # 1. Deal with the Checkbox (try multiple selectors)
        try:
            print("Looking for acknowledgment checkbox...")
            page.wait_for_selector('input[type="checkbox"], .ant-checkbox-input', timeout=10000)
            page.click('input[type="checkbox"], .ant-checkbox-input')
            print("Checkbox clicked.")
        except:
            print("Checkbox not found or already active.")

        # 2. Fill Username (try name, placeholder, and id)
        print("Filling credentials...")
        try:
            # Wait specifically for any input that looks like a username
            user_input = page.wait_for_selector('input[name="username"], input[placeholder*="Username"], input[placeholder*="Email"]', timeout=15000)
            user_input.fill(os.environ["NGTECO_USER"])
            
            # Wait for password
            pass_input = page.wait_for_selector('input[name="password"], input[type="password"]', timeout=5000)
            pass_input.fill(os.environ["NGTECO_PASS"])
        except Exception as e:
            print(f"Login fields not found: {e}")
            page.screenshot(path="login_error.png") # This helps debug in GitHub
            raise e

        # 3. Click Submit
        page.click('button[type="submit"]')
        page.wait_for_load_state("networkidle")

        # 4. Navigate to Time Card
        print("Navigating to Time Card Management...")
        page.goto("https://office.ngteco.com/att/timecard/timecard")
        page.wait_for_selector("table", timeout=20000)

        # 5. DATA MAPPING (Matches your CSV structure)
        all_names = [n.strip() for n in sheet.col_values(2)] # Col B
        date_headers = sheet.row_values(3)[4:19] # Row 3, Col E-S

        rows = page.query_selector_all("tr.ant-table-row")
        print(f"Syncing {len(rows)} portal entries to Google Sheets...")

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
                # Night shift anchor logic
                p_dt = datetime.datetime.strptime(p_in, "%Y-%m-%d %H:%M:%S")
                day_key = str(p_dt.day)

                if p_name in all_names and day_key in date_headers:
                    r_idx = all_names.index(p_name) + 1
                    c_idx = date_headers.index(day_key) + 5
                    
                    sheet.update_cell(r_idx, c_idx, total_h)
                    print(f"Matched: {p_name} | Day: {day_key} | Hrs: {total_h}")
            except Exception as e:
                pass

        browser.close()

if __name__ == "__main__":
    run_sync()
