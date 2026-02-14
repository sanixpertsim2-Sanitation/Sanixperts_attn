import os, json, gspread, datetime
from playwright.sync_api import sync_playwright
from oauth2client.service_account import ServiceAccountCredentials

def run_sync():
    # 1. Connect to Google Sheets
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds_dict = json.loads(os.environ["GOOGLE_SHEETS_JSON"])
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    client = gspread.authorize(creds)
    
    # Open your converted Google Sheet
    spreadsheet = client.open("IM2 Payroll February 9 - February 22 2026") 
    sheet = spreadsheet.sheet1

    # 2. Scrape NGTeco
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("https://office.ngteco.com/login")
        
        # Acknowledge checkbox
        try:
            page.locator('input[type="checkbox"]').first.click()
        except:
            pass

        page.fill('input[name="username"]', os.environ["NGTECO_USER"])
        page.fill('input[name="password"]', os.environ["NGTECO_PASS"])
        page.click('button[type="submit"]')
        page.wait_for_load_state("networkidle")

        # Go to Timecard / Punch List
        page.goto("https://office.ngteco.com/att/timecard/timecard")
        page.wait_for_selector("table")

        # Get Names from Sheet (B4 onwards) and Date Headers (Row 3, Col E onwards)
        names_in_sheet = [n.strip() for n in sheet.col_values(2)[3:]]
        date_headers = sheet.row_values(3)[4:] 

        rows = page.query_selector_all("tr.ant-table-row")
        
        for row in rows:
            cols = row.query_selector_all("td")
            if len(cols) < 5: continue # Ensure row has enough data
            
            name = cols[1].inner_text().strip()
            punch_in_str = cols[2].inner_text().strip()  # Clock In
            punch_out_str = cols[3].inner_text().strip() # Clock Out

            # --- THE "IGNORE
