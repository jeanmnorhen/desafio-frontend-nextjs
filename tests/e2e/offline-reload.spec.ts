import { test, expect } from '@playwright/test';

test.describe('Offline persistence with reload', () => {
  test('should keep message and sync it when going offline, reloading, and then online', async ({ page, context }) => {
    await page.goto('/');
    
    const firstContact = page.locator('button[role="listitem"]').first();
    await firstContact.waitFor({ state: 'visible' });
    await firstContact.click();

    const chatInput = page.getByPlaceholder('Digite uma mensagem');
    await chatInput.waitFor({ state: 'visible' });

    // Fica offline
    await context.setOffline(true);

    const offlineMsg = `Msg offline reload ${Date.now()}`;
    await chatInput.fill(offlineMsg);
    await page.getByRole('button', { name: /enviar/i }).click();

    await expect(page.getByRole('log').getByText(offlineMsg)).toBeVisible();

    // Reload the page while the mutation is paused in IndexedDB
    await page.reload();

    // After reload, the optimistic message should still be visible because queries are dehydrated
    await expect(page.getByRole('log').getByText(offlineMsg)).toBeVisible();

    // Fica online novamente
    await context.setOffline(false);

    // Aguarda a mutação disparar e invalidar queries
    await page.waitForTimeout(3000);

    // Mensagem deve persistir
    await expect(page.getByRole('log').getByText(offlineMsg)).toBeVisible();
  });
});
