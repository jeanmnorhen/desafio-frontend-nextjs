# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: offline-reload.spec.ts >> Offline persistence with reload >> should keep message and sync it when going offline, reloading, and then online
- Location: tests\e2e\offline-reload.spec.ts:4:7

# Error details

```
Error: page.reload: net::ERR_INTERNET_DISCONNECTED
Call log:
  - waiting for navigation until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Offline persistence with reload', () => {
  4  |   test('should keep message and sync it when going offline, reloading, and then online', async ({ page, context }) => {
  5  |     await page.goto('/');
  6  |     
  7  |     const firstContact = page.locator('button[role="listitem"]').first();
  8  |     await firstContact.waitFor({ state: 'visible' });
  9  |     await firstContact.click();
  10 | 
  11 |     const chatInput = page.getByPlaceholder('Digite uma mensagem');
  12 |     await chatInput.waitFor({ state: 'visible' });
  13 | 
  14 |     // Fica offline
  15 |     await context.setOffline(true);
  16 | 
  17 |     const offlineMsg = `Msg offline reload ${Date.now()}`;
  18 |     await chatInput.fill(offlineMsg);
  19 |     await page.getByRole('button', { name: /enviar/i }).click();
  20 | 
  21 |     await expect(page.getByRole('log').getByText(offlineMsg)).toBeVisible();
  22 | 
  23 |     // Reload the page while the mutation is paused in IndexedDB
> 24 |     await page.reload();
     |                ^ Error: page.reload: net::ERR_INTERNET_DISCONNECTED
  25 | 
  26 |     // After reload, the optimistic message should still be visible because queries are dehydrated
  27 |     await expect(page.getByRole('log').getByText(offlineMsg)).toBeVisible();
  28 | 
  29 |     // Fica online novamente
  30 |     await context.setOffline(false);
  31 | 
  32 |     // Aguarda a mutação disparar e invalidar queries
  33 |     await page.waitForTimeout(3000);
  34 | 
  35 |     // Mensagem deve persistir
  36 |     await expect(page.getByRole('log').getByText(offlineMsg)).toBeVisible();
  37 |   });
  38 | });
  39 | 
```