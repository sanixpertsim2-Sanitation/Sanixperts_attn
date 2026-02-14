print("Opening NGTeco Portal...")
        page.goto("https://office.ngteco.com/login", wait_until="networkidle")
        
        # --- ENHANCED CHECKBOX LOGIC ---
        print("Attempting to acknowledge terms...")
        try:
            # 1. Try finding the checkbox input directly and forcing a check
            checkbox = page.locator('input[type="checkbox"], .ant-checkbox-input').first
            checkbox.wait_for(state="attached", timeout=5000)
            checkbox.check(force=True)
            print("Checkbox checked via direct input.")
        except:
            try:
                # 2. If direct check fails, click the label or the 'span' wrapper
                # Most Ant-Design portals use the .ant-checkbox wrapper
                page.locator('.ant-checkbox').click()
                print("Checkbox clicked via wrapper.")
            except:
                try:
                    # 3. Last resort: Click the text 'I have read'
                    page.get_by_text("I have read").click()
                    print("Clicked agreement text.")
                except Exception as e:
                    print(f"Could not trigger checkbox: {e}")

        # Small pause to allow the 'Login' button to become active
        page.wait_for_timeout(1000)

        # --- PROCEED TO LOGIN ---
        print("Filling credentials...")
        # (Rest of your fill and submit logic here)
