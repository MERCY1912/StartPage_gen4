from playwright.sync_api import Page, expect
import time

def test_wave_animation(page: Page):
    """
    This test verifies that the wave animation is visible and appears as expected.
    """
    # 1. Arrange: Go to the application's homepage.
    page.goto("http://localhost:5173")

    # 2. Wait for the animation to be present.
    # We can't directly check the canvas drawing, so we'll just wait a bit.
    time.sleep(5) # Wait for 5 seconds to let the animation run

    # 3. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    test_wave_animation(page)
    browser.close()
