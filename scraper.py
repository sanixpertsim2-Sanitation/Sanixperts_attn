import os, json, gspread, datetime
from playwright.sync_api import sync_playwright
from oauth2client.service_account import ServiceAccountCredentials

def run_sync():
    # 1. AUTHENTICATION & SHEET SETUP
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds_dict = json.loads(os.environ["GOOGLE_SHEETS_JSON"])
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    client = gspread.authorize(creds)
    
    # Open your Sheet - Ensure this matches your Tab name
    spreadsheet = client.open("IM2 Payroll February 9 - February 22 2026") 
    sheet = spreadsheet.sheet1 # or spreadsheet.worksheet("PAYROLL")

    # 2. BROWSER AUTOMATION
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Login Process
        page.goto("https://office.ngteco.com/login")
        
        # Click the "I have read" checkbox if it appears
        try:
            page.wait_for_selector('input[type="checkbox"]', timeout=5000)
            page.click('input[type="checkbox"]')
        except:
            print("Checkbox not found or already checked.")

        page.fill('input[name="username"]', os.environ["NGTECO_USER"])
        page.fill('input[name="password"]', os.environ["NGTECO_PASS"])
        page.click('button[type="submit"]')
        page.wait_for_load_state("networkidle")

        # Navigate to Time Card Management
        page.goto("https://office.ngteco.com/att/timecard/timecard")
        page.wait_for_selector("table", timeout=10000)

        # 3. READ SHEET MAPPING
        # Names are in Column B, starting Row 4
        all_names = [n.strip() for n in sheet.col_values(2)]
        names_in_sheet = all_names[3:] # Rows 4 onwards
        
        # Date Headers are in Row 3, starting Column E (Index 5)
        date_row = sheet.row_values(3)
        date_headers = date_row[4:] # From '26' onwards

        # 4. SCRAPE & UPDATE
        rows = page.query_selector_all("tr.ant-table-row")
        
        for row in rows:
            cols = row.query_selector_all("td")
            if len(cols) < 5: continue
            
            # Scrape specific columns you requested
            name = cols[1].inner_text().strip()
            punch_in_str = cols[2].inner_text().strip()  # Clock In
            punch_out_str = cols[3].inner_text().strip() # Clock Out
            total_time = cols[4].inner_text().strip()    # Total Time(h)

            # RULE: Ignore rows where Clock Out is missing (Still Working)
            if not punch_out_str or any(x in punch_out_str.lower() for x in ["n/a", "working", "--", "null"]):
                continue

            # RULE: Use Clock-In Date to find the correct column
            try:
                # Expecting format YYYY-MM-DD HH:MM:SS
                in_dt = datetime.datetime.strptime(punch_in_str, "%Y-%m-%d %H:%M:%S")
                day_str = str(in_dt.day)

                if name in names_in_sheet and day_str in date_headers:
                    # Find exact coordinates
                    row_idx = all_names.index(name) + 1 # +1 because gspread is 1-indexed
                    col_idx = date_headers.index(day_str) + 5 # +5 because E is the 5th column
                    
                    # Update with Total Time(h)
                    sheet.update_cell(row_idx, col_idx, total_time)
                    print(f"Success: {name} on {day_str} updated with {total_time}h")
            except Exception as e:
                print(f"Row Error for {name}: {e}")

        browser.close()

if __name__ == "__main__":
    run_sync()
