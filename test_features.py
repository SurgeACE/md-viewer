from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # ---- MOBILE TEST ----
    page = browser.new_page(viewport={"width": 390, "height": 844})
    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))
    
    page.goto("http://localhost:3000", wait_until="networkidle")
    page.wait_for_timeout(1000)
    
    # Mobile: tap Preview in bottom nav
    preview_btns = page.locator(".mobile-nav-btn")
    count = preview_btns.count()
    print(f"Mobile nav buttons: {count}")
    for i in range(count):
        print(f"  Button {i}: {preview_btns.nth(i).inner_text()}")
    
    # Click Preview (3rd button - index 2)
    preview_btns.nth(2).click()
    page.wait_for_timeout(500)
    page.screenshot(path="c:/Cass/VSCODE_workspace/md_viewer/ss_mobile_preview.png", full_page=True)
    
    # Check if preview pane appeared
    preview_pane = page.locator(".preview-pane")
    print(f"\nPreview pane visible: {preview_pane.is_visible()}")
    if preview_pane.is_visible():
        preview_text = preview_pane.inner_text()
        print(f"Preview text (first 500 chars): {preview_text[:500]}")
    
    # Click Split (2nd button - index 1)
    preview_btns.nth(1).click()
    page.wait_for_timeout(500)
    page.screenshot(path="c:/Cass/VSCODE_workspace/md_viewer/ss_mobile_split.png", full_page=True)
    
    # Check if both panes exist
    editor_pane = page.locator(".editor-pane")
    print(f"\nSplit mode - Editor visible: {editor_pane.is_visible()}, Preview visible: {preview_pane.is_visible()}")
    
    # Click Files (4th button - index 3) to open drawer
    preview_btns.nth(3).click()
    page.wait_for_timeout(500)
    page.screenshot(path="c:/Cass/VSCODE_workspace/md_viewer/ss_mobile_drawer.png", full_page=True)
    
    # Check File Drawer
    drawer = page.locator(".file-drawer")
    print(f"\nFile drawer visible: {drawer.is_visible()}")
    file_items = page.locator(".file-item")
    print(f"File items count: {file_items.count()}")
    
    # ---- DESKTOP TEST ----
    page2 = browser.new_page(viewport={"width": 1280, "height": 800})
    page2.on("pageerror", lambda err: errors.append(str(err)))
    page2.goto("http://localhost:3000", wait_until="networkidle")
    page2.wait_for_timeout(1000)
    
    # Desktop: click Split in header
    view_btns = page2.locator(".view-btn")
    print(f"\nDesktop view buttons: {view_btns.count()}")
    
    # Click Split
    view_btns.nth(1).click()
    page2.wait_for_timeout(500)
    page2.screenshot(path="c:/Cass/VSCODE_workspace/md_viewer/ss_desktop_split.png", full_page=True)
    
    # Click Preview
    view_btns.nth(2).click()
    page2.wait_for_timeout(500)
    page2.screenshot(path="c:/Cass/VSCODE_workspace/md_viewer/ss_desktop_preview.png", full_page=True)
    
    # Check preview content in desktop
    preview = page2.locator(".preview-pane")
    if preview.is_visible():
        h1 = page2.locator(".markdown-body h1")
        h2s = page2.locator(".markdown-body h2")
        print(f"\nDesktop Preview - H1: {h1.count()}, H2s: {h2s.count()}")
        if h1.count() > 0:
            print(f"H1 text: {h1.first.inner_text()}")
        for i in range(min(h2s.count(), 5)):
            print(f"H2[{i}]: {h2s.nth(i).inner_text()}")
        
        # Check code blocks
        code_blocks = page2.locator(".markdown-body pre code")
        print(f"Code blocks: {code_blocks.count()}")
        
        # Check tables
        tables = page2.locator(".markdown-body table")
        print(f"Tables: {tables.count()}")
        
        # Check task lists
        checkboxes = page2.locator(".markdown-body input[type='checkbox']")
        print(f"Checkboxes: {checkboxes.count()}")
    
    # Test theme toggle - click dropdown, then theme option
    dropdown_btn = page2.locator(".header-right .icon-btn")
    dropdown_btn.click()
    page2.wait_for_timeout(300)
    
    theme_btn = page2.locator("text=Light Mode")
    if theme_btn.count() > 0:
        theme_btn.click()
        page2.wait_for_timeout(500)
        page2.screenshot(path="c:/Cass/VSCODE_workspace/md_viewer/ss_desktop_light.png", full_page=True)
        theme_class = page2.locator(".app").get_attribute("class")
        print(f"\nAfter theme toggle, app class: {theme_class}")
    else:
        print("\nLight Mode button not found in dropdown")
        dropdown_content = page2.locator(".dropdown-menu")
        if dropdown_content.count() > 0:
            print(f"Dropdown content: {dropdown_content.inner_text()}")
    
    print(f"\n=== ALL PAGE ERRORS ===")
    for err in errors:
        print(err)
    if not errors:
        print("None!")
    
    browser.close()
    print("\n=== TEST COMPLETE ===")
