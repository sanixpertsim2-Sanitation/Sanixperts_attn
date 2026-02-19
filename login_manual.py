"""
One-time manual login to save NGTeco session.
Run this, log in in the browser, then run scraper.py with NGTECO_SESSION_PATH.
"""
import os
import time
from playwright.sync_api import sync_playwright

SESSION_FILE = "ngteco_session.json"

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ),
        )
        page = context.new_page()
        page.goto("https://office.ngteco.com/login", wait_until="load", timeout=60000)

        print("=" * 50)
        print("LOG IN MANUALLY in the browser window.")
        print("When you see the timecard/dashboard, press Enter here.")
        print("=" * 50)
        input()

        context.storage_state(path=SESSION_FILE)
        print(f"Session saved to {SESSION_FILE}")
        browser.close()

if __name__ == "__main__":
    main()
