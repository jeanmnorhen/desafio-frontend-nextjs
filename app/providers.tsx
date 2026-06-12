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
      onSuccess: (newMessage, variables) => {
        // Atualiza o cache diretamente para evitar race conditions com refetch.
        if (variables) {
          const queryKey = ["conversations", variables.conversationId, "messages"];
          queryClient.setQueryData<any[]>(queryKey, (old) => {
            if (!old) return [newMessage];
            const hasTemp = old.some(msg => msg.id.startsWith("temp-") && msg.body === newMessage.body);
            if (hasTemp) {
              return old.map(msg => msg.id.startsWith("temp-") && msg.body === newMessage.body ? newMessage : msg);
            }
            // Se a temp não for encontrada (ex: sobrescrita por refetch), adicionamos a nova ao final
            // Verificamos se a mensagem já não existe para não duplicar
            if (old.some(msg => msg.id === newMessage.id)) return old;
            return [...old, newMessage];
          });
        }
      },
      onSettled: (data, error, variables) => {
        // Quando a mutação for concluída (com sucesso ou erro), invalidamos
        // as queries para que a UI busque o estado real do servidor.
        // Usamos variables em vez de context porque context é perdido no reload offline.
        if (variables) {
          queryClient.invalidateQueries({ queryKey: ["conversations", variables.conversationId, "messages"] });
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      }
    });

    return queryClient;
  });

  const [persister] = useState(() => createIndexedDBPersister());

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        dehydrateOptions: {
          shouldDehydrateMutation: (mutation) => mutation.state.isPaused,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
