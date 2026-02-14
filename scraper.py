import os, json, gspread, datetime
from playwright.sync_api import sync_playwright
from oauth2client.service_account import ServiceAccountCredentials

def run_sync():
    # 1. AUTHENTICATION
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds_dict = json.loads(os.environ["GOOGLE_SHEETS_JSON"])
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    client = gspread.authorize(creds)
    
    # Use your exact Google Sheet name
    spreadsheet = client.open("IM2 Payroll February 9 - February 22 2026") 
    sheet = spreadsheet.sheet1

    # 2. BROWSER AUTOMATION
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()
        
        # Login Process
        page.goto("https://office.ngteco.com/login")
        try:
            page.locator('input[type="checkbox"]').first.click(timeout=5000)
        except:
            pass # Skip if checkbox doesn't appear

        page.fill('input[name="username"]', os.environ["NGTECO_USER"])
        page.fill('input[name="password"]', os.environ["NGTECO_PASS"])
        page.click('button[type="submit"]')
        page.wait_for_load_state("networkidle")

        # Navigate to Time Card Management
        page.goto("https://office.ngteco.com/att/timecard/timecard")
        page.wait_for_selector("table")

        # 3. DATA MAPPING
        # Names from Column B (starts at row 4)
        names_in_sheet = [n.strip() for n in sheet.col_values(2)[3:]]
        # Dates from Row 3 (starts at Column E)
        date_headers = sheet.row_values(3)[4:] 

        rows = page.query_selector_all("tr.ant-table-row")
        
        for row in rows:
            cols = row.query_selector_all("td")
            if len(cols) < 5: continue
            
            # Extracting the specific columns you requested
            name = cols[1].inner_text().strip()
            punch_in_str = cols[2].inner_text().strip()   # Clock In
            punch_out_str = cols[3].inner_text().strip()  # Clock Out
            total_time_str = cols[4].inner_text().strip() # Total Time(h)

            # RULE: IGNORE if currently working (No Clock Out)
            if not punch_out_str or any(x in punch_out_str.lower() for x in ["n/a", "working", "--"]):
                print(f"Skipping {name}: Currently on shift (No Clock Out).")
                continue

            # RULE: DATE ANCHOR (Use Clock-In Date for the column)
            try:
                in_dt = datetime.datetime.strptime(punch_in_str, "%Y-%m-%d %H:%M:%S")
                target_day = str(in_dt.day)

                if name in names_in_sheet and target_day in date_headers:
                    row_idx = names_in_sheet.index(name) + 4
                    col_idx = date_headers.index(target_day) + 5
                    
                    # Update cell with Total Time (h) from NGTeco
                    sheet.update_cell(row_idx, col_idx, total_time_str)
                    print(f"Updated {name} for Day {target_day} with {total_time_str} hours.")
            except Exception as e:
                print(f"Data error for {name}: {e}")

        browser.close()

if __name__ == "__main__":
    run_sync()
