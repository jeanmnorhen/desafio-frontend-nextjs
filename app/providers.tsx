"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useState } from "react";
import { createIndexedDBPersister } from "@/lib/indexeddb-persister";
import { sendMessage, type Message } from "@/lib/api";
import { updateMessageInInfiniteCache } from "@/lib/utils";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5_000,
          gcTime: 1000 * 60 * 60 * 24, // 24 hours
          refetchOnWindowFocus: true,
          refetchOnReconnect: false,
          retry: 2,
        },
      },
    });

    queryClient.setMutationDefaults(["sendMessage"], {
      mutationFn: async ({ conversationId, text }: { conversationId: string; text: string }) => {
        await queryClient.cancelQueries({ queryKey: ["conversations", conversationId, "messages"] });
        await queryClient.cancelQueries({ queryKey: ["conversations"] });
        return sendMessage(conversationId, text);
      },
      onSuccess: (newMessage, variables) => {
        if (!variables) return;

        const msgKey = ["conversations", variables.conversationId, "messages"];
        queryClient.setQueryData(msgKey, (old) => {
          return updateMessageInInfiniteCache(old, newMessage, variables.text);
        });

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
      onError: (error, variables) => {
        if (variables) {
          queryClient.invalidateQueries({
            queryKey: ["conversations", variables.conversationId, "messages"],
          });
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
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
