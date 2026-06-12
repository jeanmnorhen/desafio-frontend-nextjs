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
          refetchOnWindowFocus: true,
          // CRÍTICO: Desabilitamos o refetch automático ao reconectar.
          // Quando a rede volta, o React Query dispararia GETs simultâneos
          // ao replay da mutação pausada. Como o GET termina antes do POST,
          // a lista antiga sobrescreveria nossa mensagem otimista.
          // Invalidações são feitas manualmente após o onSuccess.
          refetchOnReconnect: false,
          retry: 2,
        },
      },
    });

    // Registra a função de mutação padrão para que, caso o usuário
    // recarregue a página offline, as mutações pendentes consigam
    // ser retomadas assim que a rede voltar.
    queryClient.setMutationDefaults(["sendMessage"], {
      mutationFn: async ({ conversationId, text }: { conversationId: string; text: string }) => {
        // Cancel in-flight queries (like refetchOnReconnect) to prevent race conditions
        // where a stale GET overwrites our optimistic or fresh mutation cache.
        await queryClient.cancelQueries({ queryKey: ["conversations", conversationId, "messages"] });
        await queryClient.cancelQueries({ queryKey: ["conversations"] });
        return sendMessage(conversationId, text);
      },
      onSuccess: (newMessage, variables) => {
        if (!variables) return;
        
        // 1. Atualizar cache de mensagens
        const msgKey = ["conversations", variables.conversationId, "messages"];
        queryClient.setQueryData<any[]>(msgKey, (old) => {
          if (!old) return [newMessage];
          const hasTemp = old.some(msg => msg.id.startsWith("temp-") && msg.body === newMessage.body);
          if (hasTemp) {
            return old.map(msg => msg.id.startsWith("temp-") && msg.body === newMessage.body ? newMessage : msg);
          }
          if (old.some(msg => msg.id === newMessage.id)) return old;
          return [...old, newMessage];
        });

        // 2. Atualizar cache da lista de conversas
        queryClient.setQueryData<any[]>(["conversations"], (old) => {
          if (!old) return old;
          return old.map((conv) => {
            if (conv.id === variables.conversationId) {
              return {
                ...conv,
                lastMessage: newMessage.body,
                lastMessageAt: newMessage.createdAt,
                unread: 0,
              };
            }
            return conv;
          }).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        });
      },
      onSettled: (data, error, variables) => {
        if (!variables) return;
        // Aguarda 3 segundos para o servidor processar (Eventual Consistency)
        // antes de buscar a lista atualizada do backend.
        // Isso garante que a mensagem já esteja disponível no GET.
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["conversations", variables.conversationId, "messages"] });
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }, 3000);
      },
    });

    return queryClient;
  });

  const [persister] = useState(() => createIndexedDBPersister());

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        dehydrateOptions: {
          shouldDehydrateMutation: (mutation) => mutation.state.isPaused,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
