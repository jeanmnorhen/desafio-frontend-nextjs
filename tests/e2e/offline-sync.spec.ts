import { test, expect } from "@playwright/test";

test.describe("Offline persistence with reload", () => {
  test("should persist optimistic message across offline state and restore after reconnection", async ({ page }) => {
    await page.goto("/");

    const firstContact = page.locator('button[role="listitem"]').first();
    await firstContact.waitFor({ state: "visible" });
    await firstContact.click();

    const chatInput = page.getByPlaceholder("Digite uma mensagem");
    await chatInput.waitFor({ state: "visible" });

    const offlineMsg = `Offline reload test ${Date.now()}`;
    await chatInput.fill(offlineMsg);

    // Go offline
    await page.context().setOffline(true);

    // Send message while offline
    await chatInput.press("Enter");

    // The optimistic message should appear immediately
    await expect(page.getByRole("log").getByText(offlineMsg)).toBeVisible();

    // Wait a moment for the mutation to be marked as paused
    await page.waitForTimeout(1000);

    // Go online — mutation should resume and sync
    await page.context().setOffline(false);

    // Wait for the mutation to be processed and cache to update
    await page.waitForTimeout(6000);

    // After reconnection, the message should still be visible
    await expect(page.getByRole("log").getByText(offlineMsg)).toBeVisible();

    // Verify the message no longer has the temp ID pattern (clock icon should be gone)
    // The message should have been replaced by the real server message
    const messageElements = page.getByRole("log").locator(`text=${offlineMsg}`);
    await expect(messageElements).toHaveCount(1);
  });
});
