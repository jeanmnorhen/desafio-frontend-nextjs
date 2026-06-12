import { test, expect } from "@playwright/test";

test.describe("Chat Flow", () => {
  test("deve exibir a lista de conversas e permitir envio de mensagem, sugestão da IA e validar scroll", async ({ page }) => {
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

    // Container de mensagens
    const messageList = page.getByRole("log");
    await expect(messageList).toBeVisible();

    // Digita e envia uma mensagem
    const input = page.getByPlaceholder("Digite uma mensagem");
    await input.fill("Olá, esta é uma mensagem de teste automatizada.");
    
    // Aguarda botão habilitar e clica em Enviar
    const sendButton = page.getByRole("button", { name: "Enviar mensagem" });
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // Verifica optimistic update: mensagem aparece na tela
    await expect(messageList).toContainText("Olá, esta é uma mensagem de teste automatizada.");

    // Verifica se o scroll está posicionado no fim após o envio
    await expect.poll(async () => {
      return await messageList.evaluate((el) => {
        return el.scrollHeight - el.scrollTop - el.clientHeight;
      });
    }).toBeLessThan(15);

    // Aguarda o auto-scroll assíncrono (timeout de 50ms no componente) se assentar
    await page.waitForTimeout(200);

    // Força o container a ter overflow inserindo uma div temporária alta para testar o botão "Rolar para o fim"
    await messageList.evaluate((el) => {
      const spacer = document.createElement("div");
      spacer.id = "temp-test-spacer";
      spacer.style.height = "2000px";
      el.appendChild(spacer);
      // Rola para o final para simular o estado inicial (final do chat)
      el.scrollTop = el.scrollHeight;
    });

    // Aguarda renderização/layout
    await page.waitForTimeout(100);

    // Simula a rolagem para cima com a roda do mouse (gerando um evento de scroll real que o React escuta)
    await messageList.hover();
    await page.mouse.wheel(0, -1000);

    // Aguarda renderização/layout
    await page.waitForTimeout(100);

    // Aguarda o botão de rolagem rápida aparecer
    const scrollBottomButton = page.getByRole("button", { name: "Rolar para o fim" });
    await expect(scrollBottomButton).toBeVisible();

    // Clica no botão e valida se voltou para o fim
    await scrollBottomButton.click();
    await expect(scrollBottomButton).not.toBeVisible();
    
    await expect.poll(async () => {
      return await messageList.evaluate((el) => {
        return el.scrollHeight - el.scrollTop - el.clientHeight;
      });
    }).toBeLessThan(15);

    // Remove o spacer temporário
    await messageList.evaluate((el) => {
      const spacer = document.getElementById("temp-test-spacer");
      if (spacer) spacer.remove();
    });

    // Verifica sugestão da IA
    const aiButton = page.getByRole("button", { name: "Sugerir resposta com IA" });
    await expect(aiButton).toBeEnabled();
    await aiButton.click();

    // Aguarda o input ser preenchido (não vai estar vazio)
    await expect(input).not.toBeEmpty();
  });
});
