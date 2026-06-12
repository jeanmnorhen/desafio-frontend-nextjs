import { test, expect } from '@playwright/test';

test.describe('Offline persistence', () => {
  test('should keep message when going offline and then online', async ({ page, context }) => {
    // Start online
    await page.goto('/');
    
    // Espera a lista carregar e clica no primeiro contato
    const firstContact = page.locator('button[role="listitem"]').first();
    await firstContact.waitFor({ state: 'visible' });
    await firstContact.click();

    // Aguarda o chat carregar
    const chatInput = page.getByPlaceholder('Digite uma mensagem');
    await chatInput.waitFor({ state: 'visible' });

    // Fica offline
    await context.setOffline(true);

    // Envia uma mensagem
    const offlineMsg = `Msg offline ${Date.now()}`;
    await chatInput.fill(offlineMsg);
    await page.getByRole('button', { name: /enviar/i }).click();

    // A mensagem deve aparecer na tela devido ao optimistic update
    await expect(page.getByRole('log').getByText(offlineMsg)).toBeVisible();

    // Fica online novamente
    await context.setOffline(false);

    // Aguarda um momento para a mutação sincronizar e invalidar queries
    await page.waitForTimeout(3000);

    // A mensagem DEVE continuar na tela após o refetch
    await expect(page.getByRole('log').getByText(offlineMsg)).toBeVisible();
  });
});
