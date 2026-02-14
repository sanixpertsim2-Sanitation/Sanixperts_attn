import os, json, gspread, datetime
from playwright.sync_api import sync_playwright
from oauth2client.service_account import ServiceAccountCredentials

def run_sync():
    # 1. AUTHENTICATION
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds_dict = json.loads(os.environ["GOOGLE_SHEETS_JSON"])
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    client = gspread.authorize(creds)
    
    # Open the Sheet using the exact name from your file
    spreadsheet = client.open("IM2 Payroll February 9 - February 22 2026") 
    sheet = spreadsheet.worksheet("PAYROLL") 

    with sync_playwright() as p:
        # Launch browser with a larger window to see all columns
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        
        print("Logging in...")
        page.goto("https://office.ngteco.com/login")
        
        # Click the acknowledgment checkbox (handles the "I have read" part)
        try:
            page.wait_for_selector('.ant-checkbox-input', timeout=5000)
            page.click('.ant-checkbox-input')
        except:
            print("Checkbox not found, proceeding...")

        page.fill('input[name="username"]', os.environ["NGTECO_USER"])
        page.fill('input[name="password"]', os.environ["NGTECO_PASS"])
        page.click('button[type="submit"]')
        page.wait_for_load_state("networkidle")

        # Navigate specifically to Time Card Management
        print("Navigating to Time Card Management...")
        page.goto("https://office.ngteco.com/att/timecard/timecard")
        page.wait_for_selector("table", timeout=20000)

        # 2. MATCHING LOGIC
        # Names are in Col B (index 2), Dates are in Row 3 (index 3)
        all_names = [n.strip() for n in sheet.col_values(2)] 
        date_headers = sheet.row_values(3)[4:] # Gets 26, 27, 28... from Col E onwards

        rows = page.query_selector_all("tr.ant-table-row")
        print(f"Found {len(rows)} entries on portal.")

        for row in rows:
            cols = row.query_selector_all("td")
            if len(cols) < 5: continue
            
            # Scrape NGTeco Data
            name = cols[1].inner_text().strip()
            punch_in = cols[2].inner_text().strip()
            punch_out = cols[3].inner_text().strip()
            total_h = cols[4].inner_text().strip() # This is the "Total Time(h)"

            # SKIP if no clock-out (person is currently working)
            if not punch_out or any(x in punch_out.lower() for x in ["n/a", "working", "--"]):
                continue

            try:
                # Get the day number from the Clock-In date (Night shift anchor)
                punch_date = datetime.datetime.strptime(punch_in, "%Y-%m-%d %H:%M:%S")
                day_num = str(punch_date.day)

                if name in all_names and day_num in date_headers:
                    # gspread is 1-indexed. Names in B4 means index in all_names + 1
                    row_idx = all_names.index(name) + 1
                    # Dates start at Col E (5th column)
                    col_idx = date_headers.index(day_num) + 5
                    
                    sheet.update_cell(row_idx, col_idx, total_h)
                    print(f"Updated {name} for day {day_num} with {total_h}h")
            except Exception as e:
                print(f"Skipping row for {name}: {e}")

        browser.close()

if __name__ == "__main__":
    run_sync()
