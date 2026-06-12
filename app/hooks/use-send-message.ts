import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Message } from "@/lib/api";

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<
    Message,
    Error,
    { conversationId: string; text: string },
    { previousMessages: Message[] | undefined; tempId: string; queryKey: any[] }
  >({
    mutationKey: ["sendMessage"],
    // NÃO definimos mutationFn aqui propositalmente!
    // O mutationFn vem do setMutationDefaults no providers.tsx,
    // que inclui cancelQueries para evitar race conditions.
    // Se definirmos aqui, o React Query v5 usa ESTE em vez do default,
    // e perdemos a proteção de cancelQueries.

    // Optimistic Update — roda apenas na primeira chamada (não roda no resume)
    onMutate: async ({ conversationId, text }) => {
      const queryKey = ["conversations", conversationId, "messages"];

      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: ["conversations"] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<Message[]>(queryKey);

      // Optimistically update to the new value
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: Message = {
        id: tempId,
        direction: "out",
        body: text,
        status: "sent",
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Message[]>(queryKey, (old) => {
        if (!old) return [optimisticMessage];
        return [...old, optimisticMessage];
      });

      // Update the lastMessage in the conversation list optimistically
      queryClient.setQueryData<any[]>(["conversations"], (old) => {
        if (!old) return old;
        return old.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: text,
              lastMessageAt: optimisticMessage.createdAt
            };
          }
          return conv;
        });
      });

      // Return a context with the previous data
      return { previousMessages, tempId, queryKey };
    },

    // Se a mutação falhar, reverter ao snapshot
    onError: (err, variables, context) => {
      const queryKey = ["conversations", variables.conversationId, "messages"];
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKey, context.previousMessages);
      }
    },

    // NÃO definimos onSuccess nem onSettled aqui!
    // Ambos vêm do setMutationDefaults no providers.tsx.
    // onSuccess: atualiza o cache com a mensagem real do servidor
    // onSettled: invalida as queries com delay de 5s (Eventual Consistency)
  });
}
