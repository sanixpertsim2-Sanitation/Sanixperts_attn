import os, json, gspread, datetime, time
from playwright.sync_api import sync_playwright
from oauth2client.service_account import ServiceAccountCredentials

def run_sync():
    # 1. AUTHENTICATION
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds_dict = json.loads(os.environ["GOOGLE_SHEETS_JSON"])
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    client = gspread.authorize(creds)
    
    # Target Sheet
    spreadsheet = client.open("IM2 Payroll January 26 - February 8 2026") 
    sheet = spreadsheet.worksheet("PAYROLL") 

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        
        print("Opening NGTeco Portal...")
        page.goto("https://office.ngteco.com/login", wait_until="networkidle")
        time.sleep(5) # Critical wait for the portal to load the anonymous fields

        # --- STEP 1: CLICK THE ANONYMOUS CHECKBOX ---
        print("Checking for the agreement box...")
        try:
            # We look for the only checkbox on the page since it has no ID/Name
            page.locator('input[type="checkbox"]').first.click(force=True)
            print("Checkbox clicked.")
        except:
            print("Could not find checkbox by type, trying text click...")
            page.get_by_text("I have read").click(force=True)

        time.sleep(2)

        # --- STEP 2: FILL ANONYMOUS LOGIN FIELDS ---
        print("Attempting to fill anonymous fields...")
        try:
            # Find all input elements
            inputs = page.locator('input').all()
            
            # Usually: Input 0 = Checkbox, Input 1 = Username, Input 2 = Password
            # We will use 'filter' to be safer
            username_field = page.locator('input:not([type="checkbox"]):not([type="password"])').first
            password_field = page.locator('input[type="password"]').first
            
            username_field.fill(os.environ["NGTECO_USER"])
            password_field.fill(os.environ["NGTECO_PASS"])
            
            print("Credentials entered.")
            
            # Find the button that isn't a checkbox
            page.locator('button[type="submit"], button:has-text("Login")').click()
            print("Login submitted.")
        except Exception as e:
            print(f"Failed to handle anonymous fields: {e}")
            return

        # --- STEP 3: SYNC DATA ---
        page.wait_for_load_state("networkidle")
        time.sleep(5)
        print("Navigating to Time Cards...")
        page.goto("https://office.ngteco.com/att/timecard/timecard")
        page.wait_for_selector("table", timeout=30000)

        all_names = [n.strip() for n in sheet.col_values(2)] 
        date_headers = sheet.row_values(3)[4:19] 

        rows = page.query_selector_all("tr.ant-table-row")
        
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
                    print(f"SUCCESS: {p_name} | Day {day_key}")
            except:
                continue

        browser.close()

if __name__ == "__main__":
    run_sync()
