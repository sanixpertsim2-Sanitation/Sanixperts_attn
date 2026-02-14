import os, json, gspread, datetime, time
from playwright.sync_api import sync_playwright
from oauth2client.service_account import ServiceAccountCredentials

def run_sync():
    # 1. AUTHENTICATION
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds_dict = json.loads(os.environ["GOOGLE_SHEETS_JSON"])
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    client = gspread.authorize(creds)
    
    # Matches your filename exactly
    spreadsheet = client.open("IM2 Payroll January 26 - February 8 2026") 
    sheet = spreadsheet.worksheet("PAYROLL") 

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Standard desktop view
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        
        print("Opening NGTeco Portal...")
        page.goto("https://office.ngteco.com/login", wait_until="networkidle")
        time.sleep(3) # Wait for elements to settle

        # --- FORCE CLICK CHECKBOX ---
        print("Forcing agreement checkbox click...")
        try:
            # Try to click the actual text 'I have read' which is usually linked to the box
            agreement_text = page.get_by_text("I have read and agree")
            agreement_text.click(force=True)
            print("Agreement text clicked.")
        except:
            # Fallback: find any checkbox and click it
            try:
                page.locator('input[type="checkbox"]').first.click(force=True)
                print("Checkbox clicked via locator.")
            except:
                print("Warning: Could not confirm checkbox click.")

        time.sleep(2) # Give the portal a moment to enable the inputs

        # --- FILL LOGIN ---
        print("Filling credentials...")
        try:
            # We use a very broad selector to find the username field
            page.locator('input').first.fill(os.environ["NGTECO_USER"])
            # Second input is usually password
            page.locator('input[type="password"]').fill(os.environ["NGTECO_PASS"])
            
            # Click Login Button
            page.get_by_role("button").filter(has_text="Login").click()
            print("Login button clicked. Waiting for dashboard...")
        except Exception as e:
            print(f"Failed to fill fields: {e}")
            return

        # --- NAVIGATION ---
        page.wait_for_load_state("networkidle")
        print("Navigating to Time Card Management...")
        page.goto("https://office.ngteco.com/att/timecard/timecard")
        
        # Wait for the data table to load
        page.wait_for_selector("table", timeout=30000)
        print("Timecard table found. Starting Sync...")

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
                    print(f"SUCCESS: {p_name} | Day {day_key} | {total_h}h")
            except:
                continue

        print("Sync Completed.")
        browser.close()

if __name__ == "__main__":
    run_sync()
