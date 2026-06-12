import { test, expect } from "@playwright/test";

test.describe("UX Features and Responsiveness", () => {
  test("deve buscar e filtrar conversas na lista", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.getByPlaceholder("Pesquisar ou começar uma nova conversa");
    await expect(searchInput).toBeVisible();

    // Digita um nome que sabemos que existe no mock (ex: usando o primeiro item)
    const firstConversation = page.getByRole("listitem").first();
    await expect(firstConversation).toBeVisible({ timeout: 10000 });
    const contactName = await firstConversation.locator("span.truncate").first().textContent();
    expect(contactName).toBeTruthy();

    // Digita no campo de busca
    await searchInput.fill(contactName!);
    await page.waitForTimeout(200); // aguarda debounce se houver

    // Verifica que o item ainda está visível
    await expect(page.getByRole("listitem").filter({ hasText: contactName! })).toBeVisible();

    // Filtra por um nome fictício que não existe
    await searchInput.fill("NomeImpossivelDeExistir12345");
    await page.waitForTimeout(200);

    // Lista deve ficar vazia ou com zero itens correspondentes
    await expect(page.getByRole("listitem")).toHaveCount(0);

    // Limpa a busca clicando no botão X (Limpar busca)
    const clearButton = page.getByRole("button", { name: "Limpar busca" });
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Verifica se a busca foi redefinida e os itens reapareceram
    await expect(searchInput).toHaveValue("");
    await expect(firstConversation).toBeVisible();
  });

  test("deve fechar o chat ao pressionar a tecla Escape", async ({ page }) => {
    await page.goto("/");

    const firstConversation = page.getByRole("listitem").first();
    await expect(firstConversation).toBeVisible({ timeout: 10000 });
    await firstConversation.click();

    // Verifica se o chat abriu
    const messageInput = page.getByPlaceholder("Digite uma mensagem");
    await expect(messageInput).toBeVisible();

    // Pressiona Escape
    await page.keyboard.press("Escape");

    // Verifica se voltou para o estado inicial sem chat aberto (ou tela vazia de chat)
    await expect(messageInput).not.toBeVisible();
    await expect(page.getByText("Selecione uma conversa ao lado para visualizar as mensagens.")).toBeVisible();
  });

  test("deve funcionar corretamente o fluxo de colapso de sidebar no mobile", async ({ page }) => {
    // Configura o viewport para tamanho mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const sidebar = page.locator("aside");
    const chatMain = page.locator("main").nth(1); // O segundo main é a área do chat

    // No mobile, inicialmente a sidebar deve estar visível e o chat oculto
    await expect(sidebar).toBeVisible();
    await expect(chatMain).not.toBeVisible();

    // Clica em uma conversa
    const firstConversation = page.getByRole("listitem").first();
    await firstConversation.click();

    // Após clicar, a sidebar deve ocultar (ficar oculta no mobile) e o chat deve aparecer
    await expect(sidebar).toBeHidden();
    await expect(sidebar).toHaveClass(/hidden/);
    await expect(chatMain).toBeVisible();

    // Clica no botão de voltar
    const backButton = page.getByRole("button", { name: "Voltar para lista de conversas" });
    await expect(backButton).toBeVisible();
    await backButton.click();

    // Sidebar deve voltar a ficar visível e chat ocultado
    await expect(sidebar).toBeVisible();
    await expect(chatMain).not.toBeVisible();
  });
});
