# Inbox de Atendimento Inteligente (WhatsApp IA)

Este projeto consiste em um painel de atendimento web estilo WhatsApp que permite gerenciar conversas com clientes em tempo real e obter sugestões de resposta geradas por uma Inteligência Artificial. Construído utilizando **Next.js (App Router)**, **React 19**, **Tailwind CSS** e **TanStack Query (React Query)**.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
Certifique-se de ter o **Node.js (v18 ou superior)** e o **npm** (ou yarn/pnpm) instalados em sua máquina.

### Passo 1: Configurar Variáveis de Ambiente
Duplique o arquivo `.env.example` para criar o `.env.local`:
```bash
cp .env.example .env.local
```
Certifique-se de que a variável `NEXT_PUBLIC_API_URL` aponta para o endereço correto da API fornecida (padrão: `https://8tymn68hp9.execute-api.us-east-1.amazonaws.com`):
```env
NEXT_PUBLIC_API_URL=https://8tymn68hp9.execute-api.us-east-1.amazonaws.com
```

### Passo 2: Instalar as Dependências
```bash
npm install
```

### Passo 3: Executar o Servidor de Desenvolvimento
```bash
npm run dev
```
O aplicativo estará disponível em [http://localhost:3000].

### Passo 4: Executar Testes
* **Testes Unitários (Vitest):**
  ```bash
  npm run test:unit
  ```
* **Testes E2E (Playwright):**
  ```bash
  npx playwright test
  ```

---

## 🏗️ Decisões de Arquitetura

O projeto adota a estrutura padrão do **Next.js App Router**, combinando boas práticas de organização modular e isolamento de responsabilidades:
* `app/components/`: Subdividido em contextos funcionais claros como `chat/` (painel, bolhas, barra de entrada), `inbox/` (lista de contatos, busca e casca principal) e `ui/` (elementos reutilizáveis como Skeletons, Badges e Estados Globais de erro/vazio).
* `app/hooks/`: Custom hooks isolando as chamadas e lógica de mutations/queries do TanStack Query (`useConversations`, `useMessages`, `useSendMessage`, `useAiSuggest`).
* `lib/`: Contém configurações globais como o cliente HTTP Axios (`api.ts`) e a persistência no IndexedDB (`indexeddb-persister.ts`).

---

## 💾 Persistência Local Offline (PWA Avançado)

A aplicação conta com um mecanismo robusto de **Offline-First**, utilizando as capacidades do `@tanstack/react-query-persist-client` integradas ao **IndexedDB** (`idb-keyval`):
* **Sincronização de Histórico:** O cache de queries (conversas e mensagens) é espelhado no IndexedDB localmente (durabilidade de 24 horas). Isso permite consultar o histórico do chat instantaneamente mesmo se a aba for recarregada em uma conexão instável ou inexistente.
* **Mutações Offline:** Caso a rede caia no momento em que uma mensagem está sendo enviada, o *optimistic update* preserva a experiência visual exibindo o ícone de relógio (⏰). O React Query enfileira a mutação de envio no IndexedDB. Assim que o navegador detectar novamente a conectividade, a fila é processada e as mensagens são enviadas em plano de fundo sem intervenção do usuário.
* **Resolução de Hard Reloads em Produção (Vercel):** Para evitar que a página realize um hard reload indesejado ao voltar ao estado online em produção, configuramos o Serwist com `reloadOnOnline: false` em `next.config.mjs`. Isso garante que a mutação offline não seja interrompida por reloads do Service Worker, garantindo a sincronização em background.

---

## 🔄 Buscar e Sincronizar Dados

Para garantir que a lista de contatos e as bolhas de chat permaneçam sincronizadas com as interações reais (evitando mensagens perdidas ou inconsistências com o servidor), adotamos as seguintes técnicas:
1. **Polling Inteligente:**
   * A lista de conversas faz polling a cada **5 segundos** (`refetchInterval: 5000` em [use-conversations.ts](/app/hooks/use-conversations.ts)).
   * O histórico da conversa ativa faz polling a cada **3 segundos** (`refetchInterval: 3000` em [use-messages.ts](/app/hooks/use-messages.ts)).
2. **Cooldown de Polling:**
   * O polling é pausado automaticamente durante mutações de envio de mensagem e mantido sob cooldown por **5 segundos** após o término da mutação. Isso evita que requisições HTTP GET paralelas tragam dados desatualizados do backend (devido à eventual consistência) e apaguem mensagens otimistas da tela.
3. **Invalidação Atrasada:**
   * No `onSettled` em [providers.tsx](/app/providers.tsx), aguardamos **4 segundos** antes de invalidar as queries para forçar o refetch com dados já consolidados no servidor.
4. **Prefetching no Hover:**
   * Ao passar o mouse (`onMouseEnter`) sobre um item na lista de contatos, o React Query inicia silenciosamente o pré-carregamento das mensagens daquela conversa. Quando o usuário clica de fato, o chat carrega instantaneamente.

---

## 🧪 Estratégias de Testes

A cobertura de testes está organizada em **três camadas complementares**, garantindo robustez e confiabilidade:

### 1. Testes Unitários (Vitest + jsdom)

**Ferramenta:** [Vitest](https://vitest.dev) com ambiente `jsdom`.

**O que testamos:** Funções puras e utilitários da camada `lib/`, que possuem lógica crítica de transformação de dados sem dependência de contexto de UI.

**Localização:** `tests/unit/`

| Arquivo | Escopo |
|---|---|
| `utils.spec.ts` | `cn()`, `getInitials()`, `formatPhoneNumber()`, `formatRelativeTime()` |

**Como executar:**
```bash
npm run test:unit
```

---

### 2. Testes de Componentes — CT (Playwright Component Testing)

**Ferramenta:** `@playwright/experimental-ct-react`.

**O que testamos:** Componentes de UI isolados (`ui/`) montados individualmente em um browser real.

**Localização:** `tests/ct/`

| Arquivo | Componente | Casos cobertos |
|---|---|---|
| `avatar.spec.tsx` | `<Avatar />` | Iniciais corretas, cor de fundo, tamanhos (`sm`, `md`, `lg`) |
| `badge.spec.tsx` | `<Badge />` | Oculto quando `count=0`, exibe count corretamente, cap de `99+` |

**Como executar:**
```bash
npx playwright test --config playwright-ct.config.ts
```

---

### 3. Testes E2E — End-to-End (Playwright)

**Ferramenta:** [Playwright](https://playwright.dev).

**Localização:** `tests/e2e/`

#### `chat-flow.spec.ts` — Fluxo Principal de Chat
* **Carregamento da lista de conversas:** Garante que a lista de contatos é renderizada.
* **Abertura de uma conversa:** Valida que clicar em um contato abre a conversa correspondente.
* **Envio de mensagem:** Preenche o input, envia e verifica a mensagem no log.
* **Scroll automático:** Garante que a área de chat rola automaticamente para o fim ao receber/enviar mensagens.
* **Botão "Rolar para o fim":** Valida que o botão flutuante aparece ao rolar para cima e rola o chat de volta para o fim ao ser clicado.
* **Sugestão de IA:** Testa o fluxo de sugestão do botão de IA e o preenchimento do input.

#### `ux-features.spec.ts` — Funcionalidades de UX e Responsividade
* **Busca e filtro de conversas:** Valida a busca por nome e o estado vazio quando nenhum contato corresponde.
* **Botão Limpar busca (×):** Verifica o comportamento de limpar o input de busca e restaurar a lista.
* **Fechar chat com Escape:** Testa a tecla `Escape` para fechar a conversa ativa e retornar ao estado vazio.
* **Responsividade mobile:** Testa o comportamento de colapso da sidebar e abertura do painel de chat em viewports mobile (responsividade).

#### `offline.spec.ts` — Sincronização Básica Offline
* **Fluxo de Conexão:** Simula o navegador offline, envia a mensagem (com optimistic update), restabelece a conexão e garante que a mensagem sincroniza com sucesso.

#### `offline-sync.spec.ts` — Persistência Offline Avançada
* **Fluxo Completo de Persistência:** Valida que ao enviar uma mensagem em modo offline, a mensagem é renderizada na tela e mantida localmente através de transições de rede, sincronizando de forma transparente com o servidor sem piscar ou recarregar a interface.

**Como executar todos os testes E2E:**
```bash
npx playwright test
```

---

### Resumo da Cobertura

| Camada | Ferramenta | Escopo | Velocidade |
|---|---|---|---|
| Unitários | Vitest | Funções puras (`lib/utils.ts`) | ⚡ Muito rápido (~5s) |
| Componentes | Playwright CT | Componentes de UI isolados | 🔄 Rápido |
| E2E | Playwright | Fluxos completos de usuário (E2E e Offline) | 🐢 Moderado (~25s) |
