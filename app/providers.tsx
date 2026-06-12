"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useState } from "react";
import { createIndexedDBPersister } from "@/lib/indexeddb-persister";
import { sendMessage } from "@/lib/api";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5_000,
          gcTime: 1000 * 60 * 60 * 24, // 24 hours
          refetchOnWindowFocus: true, // Importante para chat
          retry: 2,
        },
      },
    });

    // Registra a função de mutação padrão para que, caso o usuário
    // recarregue a página offline, as mutações pendentes consigam
    // ser retomadas assim que a rede voltar.
    queryClient.setMutationDefaults(["sendMessage"], {
      mutationFn: ({ conversationId, text }: { conversationId: string; text: string }) =>
        sendMessage(conversationId, text),
    });

    return queryClient;
  });

  const [persister] = useState(() => createIndexedDBPersister());

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
