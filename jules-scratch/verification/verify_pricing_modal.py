from playwright.sync_api import sync_playwright, Page, expect

def verify_pricing_modal(page: Page):
    """
    This test verifies that the pricing modal can be opened and that it displays correctly.
    """
    # 1. Arrange: Go to the application's homepage.
    # The dev server is now running on port 5174.
    page.goto("http://localhost:5174/")

    # 2. Act: Find the "Премиум" button and click it.
    # We use get_by_text because it's a robust, user-facing locator.
    premium_button = page.get_by_role("button", name="Премиум")
    premium_button.click()

    # 3. Assert: Confirm the modal is visible and plans are loaded.
    # We expect the modal to contain the text "Премиум-доступ".
    modal_title = page.get_by_text("Премиум-доступ")
    expect(modal_title).to_be_visible()

    # Wait for the plans to be loaded by looking for the text "Лимит".
    # Increased timeout to 30 seconds.
    limit_text = page.get_by_text("Лимит", exact=True).first
    expect(limit_text).to_be_visible(timeout=30000)

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/pricing-modal.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_pricing_modal(page)
        browser.close()

if __name__ == "__main__":
    main()
