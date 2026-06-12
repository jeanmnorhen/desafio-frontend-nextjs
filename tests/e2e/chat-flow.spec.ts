import { test, expect } from "@playwright/test";

test.describe("Chat Flow", () => {
  test("deve exibir a lista de conversas e permitir envio de mensagem e sugestão da IA", async ({ page }) => {
    // Acesse a home page
    await page.goto("/");

    // Verifica se a lista de conversas carrega (buscando por itens na lista)
    const conversationList = page.getByRole("list", { name: "Lista de conversas" });
    await expect(conversationList).toBeVisible({ timeout: 10000 });

    // Aguarde pelo menos um item carregar
    const firstConversation = page.getByRole("listitem").first();
    await expect(firstConversation).toBeVisible({ timeout: 15000 });
    
    const contactName = await firstConversation.locator("span.truncate").first().textContent();
    expect(contactName).toBeTruthy();

    // Seleciona a conversa
    await firstConversation.click();

    // Verifica se o header do chat foi renderizado
    const chatHeader = page.locator("header");
    await expect(chatHeader).toBeVisible();
    await expect(chatHeader).toContainText(contactName!);

    // Digita e envia uma mensagem
    const input = page.getByPlaceholder("Digite uma mensagem");
    await input.fill("Olá, esta é uma mensagem de teste automatizada.");
    
    // Aguarda botão habilitar e clica em Enviar
    const sendButton = page.getByRole("button", { name: "Enviar mensagem" });
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // Verifica optimistic update: mensagem aparece na tela
    const messageList = page.getByRole("log");
    await expect(messageList).toContainText("Olá, esta é uma mensagem de teste automatizada.");

    // Verifica sugestão da IA
    const aiButton = page.getByRole("button", { name: "Sugerir resposta com IA" });
    await expect(aiButton).toBeEnabled();
    await aiButton.click();

    // Aguarda o input ser preenchido (não vai estar vazio)
    await expect(input).not.toBeEmpty();
  });
});
