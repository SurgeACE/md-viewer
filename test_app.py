from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})

    console_msgs = []
    page.on("console", lambda msg: console_msgs.append(f"[{msg.type}] {msg.text}"))
    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))

    page.goto("http://localhost:3000", wait_until="networkidle")
    page.wait_for_timeout(2000)

    page.screenshot(path="c:/Cass/VSCODE_workspace/md_viewer/screenshot_mobile.png", full_page=True)

    page.set_viewport_size({"width": 1280, "height": 800})
    page.wait_for_timeout(1000)
    page.screenshot(path="c:/Cass/VSCODE_workspace/md_viewer/screenshot_desktop.png", full_page=True)

    print("=== PAGE TITLE ===")
    print(page.title())

    print("\n=== CONSOLE MESSAGES ===")
    for msg in console_msgs:
        print(msg)

    print("\n=== PAGE ERRORS ===")
    for err in errors:
        print(err)

    print("\n=== BODY INNER HTML (first 3000 chars) ===")
    body = page.evaluate("document.body.innerHTML")
    print(body[:3000])

    print("\n=== VISIBLE TEXT ===")
    text = page.evaluate("document.body.innerText")
    print(text[:2000])

    browser.close()
