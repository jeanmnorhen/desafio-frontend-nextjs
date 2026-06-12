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
Certifique-se de que a variável `NEXT_PUBLIC_API_URL` aponta para o endereço correto da API fornecida (padrão: `http://localhost:4000`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
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
* `lib/`: Contém configurações globais como o cliente HTTP Axios (`api.ts`) e funções utilitárias (`utils.ts`).

---

## 🖥️ Estratégia de Renderização (CSR, SSR, SSG e ISR)

* **Client-Side Rendering (CSR):** Como este aplicativo é um **painel operacional de tempo real (dashboard)** com alto nível de interatividade (mensagens chegando instantaneamente, digitação, som, scroll automático e atualizações otimistas), a estratégia predominante adotada foi o **CSR**. O carregamento, filtragem e renderização dinâmica das mensagens ocorrem inteiramente no browser, suportados pelo estado gerenciado no cliente.
* **Server-Side Rendering (SSR):** Utilizado na casca inicial da página para renderizar a estrutura básica de HTML e carregar fontes e CSS otimizados, minimizando o *First Contentful Paint (FCP)*.
* **SSG (Static Site Generation) & ISR (Incremental Static Regeneration):** Não foram aplicados diretamente nas telas de chat ou lista de conversas, pois os dados são altamente voláteis e privados de cada operador. O pré-carregamento estático ou regeneração estática de dados pessoais e de chat não é recomendado devido a questões de privacidade e dinamicidade constante.

---

## 🏛️ Server Components vs Client Components

Seguindo a filosofia do Next.js 15+, dividimos a árvore de componentes estrategicamente:
* **Server Components:** O layout raiz ([layout.tsx](/app/layout.tsx)) e o ponto de entrada da página são Server Components por padrão. Eles fornecem metadados de SEO, importam as fontes otimizadas do Google (`Inter`) e configuram a casca estática inicial sem injetar JavaScript desnecessário no bundle inicial.
* **Client Components (com diretiva `"use-client"`):** O [InboxShell](/app/components/inbox/inbox-shell.tsx), a lista de mensagens e o painel de digitação são Client Components. Isso é necessário porque eles dependem de:
  * Hooks de estado (`useState`, `useEffect`, `useRef`).
  * Eventos do navegador (rolagem do mouse, redimensionamento automático de caixas de texto, reprodução de efeitos sonoros).
  * Consumo de dados dinâmicos via hooks do TanStack Query.

---

## 🔄 Buscar e Sincronizar Dados

Para garantir que a lista de contatos e as bolhas de chat permaneçam sincronizadas com as interações reais (evitando mensagens perdidas), adotamos as seguintes técnicas:
1. **Polling Inteligente:**
   * A lista de conversas faz polling a cada **5 segundos** (`refetchInterval: 5000` em [use-conversations.ts](/app/hooks/use-conversations.ts)).
   * O histórico da conversa ativa faz polling a cada **3 segundos** (`refetchInterval: 3000` em [use-messages.ts](/app/hooks/use-messages.ts)).
2. **Updates Otimistas (Optimistic Updates):**
   * Ao enviar uma mensagem, o hook [useSendMessage](/app/hooks/use-send-message.ts) insere imediatamente a nova mensagem no cache do React Query com status de "enviando" e atualiza a última mensagem na barra lateral. Isso elimina a percepção de latência da rede para o atendente.
3. **Prefetching no Hover:**
   * Ao passar o mouse (`onMouseEnter`) sobre um item na lista de contatos, o React Query inicia silenciosamente o pré-carregamento das mensagens daquela conversa. Quando o usuário clica de fato, o chat carrega instantaneamente.

---

## 🛡️ Tratamento de Estados (Carregamento, Erro e Vazio)

* **Carregamento (Loading):** Skeletons customizados (`MessageSkeleton` e `ConversationSkeleton`) são renderizados enquanto as requisições iniciais estão pendentes, mantendo a estrutura visual estável e reduzindo o *Layout Shift (CLS)*.
* **Erro:** Se a API cair ou falhar, o componente renderiza o `ErrorState` exibindo mensagens claras de falha e fornecendo um botão de "Tentar Novamente" (`onRetry`) que reinicia a query do React Query.
* **Vazio:** Caso uma conversa não tenha mensagens, ou a busca não encontre nenhum contato correspondente, estados vazios customizados (`EmptyState`) orientam o usuário sobre as próximas ações.

---

## ⚡ Performance

* **Virtualização de Lista:** Implementamos o `@tanstack/react-virtual` para renderizar apenas as mensagens que estão atualmente visíveis no viewport do chat. Isso garante performance fluida de renderização mesmo em históricos com milhares de mensagens, economizando memória do browser e ciclos de CPU.
* **Controle de Altura Flexível:** A altura do chat é devidamente contida com flexbox e `min-h-0`, evitando que o documento principal estique e garantindo que apenas a caixa virtualizada realize rolagem interna.

---

## 💾 Persistência Local Offline (PWA Avançado)

A aplicação conta com um mecanismo robusto de **Offline-First**, utilizando as capacidades do `@tanstack/react-query-persist-client` integradas ao **IndexedDB** (`idb-keyval`):
* **Sincronização de Histórico:** O cache de queries (conversas e mensagens) é espelhado no IndexedDB localmente (durabilidade de 24 horas). Isso permite consultar o histórico do chat instantaneamente mesmo se a aba for recarregada em uma conexão instável ou inexistente.
* **Mutações Offline:** Caso a rede caia no momento em que uma mensagem está sendo enviada, o *optimistic update* preserva a experiência visual, e o React Query enfileira o comando real de envio no IndexedDB. Assim que o navegador detectar novamente a conectividade, a fila é processada e as mensagens são enviadas em plano de fundo sem qualquer intervenção do usuário, de maneira confiável.

---

## 🧪 Estratégias de Testes

A cobertura de testes está organizada em **três camadas complementares**, seguindo a pirâmide de testes clássica: testes unitários na base (rápidos e isolados), testes de componentes no meio e testes E2E no topo (mais lentos, mas com maior fidelidade ao uso real).

### 1. Testes Unitários (Vitest + jsdom)

**Ferramenta:** [Vitest](https://vitest.dev) com ambiente `jsdom`, configurado em [`vitest.config.ts`](./vitest.config.ts).

**O que testamos:** Funções puras e utilitários da camada `lib/`, que possuem lógica crítica de transformação de dados sem dependência de contexto de UI.

**Localização:** `tests/unit/`

| Arquivo | Escopo |
|---|---|
| `utils.spec.ts` | `cn()`, `getInitials()`, `formatPhoneNumber()`, `formatRelativeTime()` |

**Exemplos de casos cobertos:**
- `cn()` — Garante que o `tailwind-merge` resolve conflitos de classes corretamente (ex: `bg-red-500` é sobrescrito por `bg-blue-500`, nunca coexiste).
- `getInitials()` — Cobre nomes compostos, nomes únicos, espaços extras e strings vazias.
- `formatPhoneNumber()` — Valida todos os formatos de telefone brasileiro (com/sem DDI, 8 e 9 dígitos) e garante fallback seguro para inputs inválidos.
- `formatRelativeTime()` — Assegura que datas do dia atual exibem `HH:mm`, datas de outra semana exibem `dd/MM/yy` e que entradas inválidas são tratadas sem quebrar o runtime.

**Como executar:**
```bash
npm run test:unit
```

---

### 2. Testes de Componentes — CT (Playwright Component Testing)

**Ferramenta:** [`@playwright/experimental-ct-react`](https://playwright.dev/docs/test-components), configurado em [`playwright-ct.config.ts`](./playwright-ct.config.ts).

**O que testamos:** Componentes de UI isolados (`ui/`) montados individualmente em um browser real, sem necessidade de subir o servidor Next.js completo. Essa camada garante que a lógica visual de cada componente atômico funcione independentemente de qualquer integração.

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

**Ferramenta:** [Playwright](https://playwright.dev), configurado em [`playwright.config.ts`](./playwright.config.ts). Os testes são executados contra o servidor Next.js iniciado automaticamente via `webServer`.

**O que testamos:** Fluxos completos da perspectiva do usuário final, interagindo com a aplicação real no browser Chromium, incluindo chamadas reais de API.

**Localização:** `tests/e2e/`

#### `chat-flow.spec.ts` — Fluxo Principal de Chat

| Cenário | O que valida |
|---|---|
| Carregamento da lista de conversas | `role="list"` visível com pelo menos um `listitem` dentro do timeout |
| Abertura de uma conversa | Header do chat exibe o nome do contato selecionado |
| Envio de mensagem | Input preenchido, botão habilitado, mensagem aparece no `role="log"` (update otimista) |
| **Scroll automático após envio** | Container scroll posicionado a menos de 15px do fim (`scrollHeight - scrollTop - clientHeight`) |
| **Botão "Rolar para o fim"** | Aparece ao rolar para cima, desaparece após clique e repositiona o scroll corretamente |
| Sugestão de IA | Botão "Sugerir resposta com IA" habilitado; após clique, input não fica vazio |

#### `ux-features.spec.ts` — Funcionalidades de UX e Responsividade

| Cenário | O que valida |
|---|---|
| **Busca e filtro de conversas** | Filtro por nome retorna contatos corretos; busca sem resultado retorna lista vazia |
| **Botão Limpar busca (×)** | Visível quando há texto; ao clicar, limpa o campo e restaura a lista completa |
| **Fechar chat com Escape** | `page.keyboard.press("Escape")` fecha o chat e exibe o estado vazio de "Selecione uma conversa" |
| **Responsividade mobile** | Em viewport `375×667`: sidebar visível, chat oculto → ao clicar em contato, sidebar oculta e chat abre; botão de voltar restaura a sidebar |

**Como executar todos os testes E2E:**
```bash
npx playwright test
```

**Para rodar um arquivo específico:**
```bash
npx playwright test tests/e2e/chat-flow.spec.ts
```

**Para ver o relatório HTML gerado:**
```bash
npx playwright show-report
```

---

### Resumo da Cobertura

| Camada | Ferramenta | Escopo | Velocidade |
|---|---|---|---|
| Unitários | Vitest | Funções puras (`lib/utils.ts`) | ⚡ Muito rápido (~6s) |
| Componentes | Playwright CT | Componentes de UI isolados | 🔄 Rápido |
| E2E | Playwright | Fluxos completos de usuário | 🐢 Moderado (~10-20s) |

---



## 🔍 SEO e Acessibilidade (a11y)

* **SEO:** Tags de metadados padrão configuradas no `RootLayout` para otimização de motores de busca e indexação primária da aplicação.
* **Acessibilidade:**
  * Navegação completa por teclado (pressione as setas `ArrowUp`/`ArrowDown` para navegar entre conversas e `Escape` para fechar o chat aberto).
  * Uso correto de tags semânticas (`<main>`, `<aside>`, `<header>`, `button`).
  * Atributos de acessibilidade como `aria-label` descritivos nos botões e inputs, `role="log"` e `aria-live="polite"` no container de mensagens para leitores de tela capturarem novidades no chat de forma fluida.

---

## 🔮 O que Faria Diferente com Mais Tempo

Se tivéssemos mais prazo para o projeto, as seguintes melhorias trariam grande valor:
1. **WebSockets ou Server-Sent Events (SSE):** Substituir o mecanismo de polling por uma conexão persistente em tempo real. Isso reduziria drasticamente o overhead HTTP de requisições a cada 3/5 segundos e tornaria o recebimento de novas mensagens instantâneo.
2. **Editor de Sugestões de IA Avançado:** Implementar uma barra de sugestões lateral onde o usuário pudesse ajustar o tom da sugestão (formal, informal, direto) ou pedir variações antes de preencher o input principal.
