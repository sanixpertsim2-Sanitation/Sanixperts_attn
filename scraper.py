import os, json, gspread, datetime
from playwright.sync_api import sync_playwright
from oauth2client.service_account import ServiceAccountCredentials

def run_sync():
    # 1. AUTHENTICATION & SHEET ACCESS
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds_dict = json.loads(os.environ["GOOGLE_SHEETS_JSON"])
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    client = gspread.authorize(creds)
    
    # Change this to match your EXACT Google Sheet filename
    spreadsheet = client.open("IM2 Payroll January 26 - February 8 2026") 
    sheet = spreadsheet.worksheet("PAYROLL") 

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        print("Logging in to NGTeco...")
        page.goto("https://office.ngteco.com/login")
        
        # Handle the 'I have read' checkbox
        try:
            page.wait_for_selector('.ant-checkbox-input', timeout=5000)
            page.click('.ant-checkbox-input')
        except:
            print("Checkbox not found, continuing...")

        page.fill('input[name="username"]', os.environ["NGTECO_USER"])
        page.fill('input[name="password"]', os.environ["NGTECO_PASS"])
        page.click('button[type="submit"]')
        page.wait_for_load_state("networkidle")

        # Go to the specific Time Card page
        page.goto("https://office.ngteco.com/att/timecard/timecard")
        page.wait_for_selector("table", timeout=20000)

        # 2. MATCHING LOGIC
        # Column B (index 2) has names. Row 3 (index 3) has dates.
        all_names = [n.strip() for n in sheet.col_values(2)] # Column B
        date_headers = sheet.row_values(3)[4:19] # Row 3, Columns E through S (26th to 8th)

        rows = page.query_selector_all("tr.ant-table-row")
        
        for row in rows:
            cols = row.query_selector_all("td")
            if len(cols) < 5: continue
            
            portal_name = cols[1].inner_text().strip()
            punch_in = cols[2].inner_text().strip()   # Clock In
            punch_out = cols[3].inner_text().strip()  # Clock Out
            total_h = cols[4].inner_text().strip()    # Total Time(h) column

            # RULE: Ignore if they haven't clocked out yet
            if not punch_out or any(x in punch_out.lower() for x in ["n/a", "working", "--"]):
                continue

            try:
                # Use Clock-In Date for Night Shift Anchor
                punch_date = datetime.datetime.strptime(punch_in, "%Y-%m-%d %H:%M:%S")
                day_num = str(punch_date.day)

                if portal_name in all_names and day_num in date_headers:
                    # gspread is 1-indexed
                    row_idx = all_names.index(portal_name) + 1
                    # Start at Column E (5th column)
                    col_idx = date_headers.index(day_num) + 5
                    
                    # Update cell with Total Time(h)
                    sheet.update_cell(row_idx, col_idx, total_h)
                    print(f"Update Success: {portal_name} | Day {day_num} | {total_h} hrs")
            except Exception as e:
                print(f"Error for {portal_name}: {e}")

        browser.close()

if __name__ == "__main__":
    run_sync()
