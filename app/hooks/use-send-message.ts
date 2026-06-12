import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage, type Message } from "@/lib/api";

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["sendMessage"],
    mutationFn: ({ conversationId, text }: { conversationId: string; text: string }) =>
      sendMessage(conversationId, text),
    
    // Optimistic Update
    onMutate: async ({ conversationId, text }) => {
      const queryKey = ["conversations", conversationId, "messages"];

      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey });

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
      const convsKey = ["conversations"];
      queryClient.setQueryData<any[]>(convsKey, (old) => {
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

      // Return a context with the previous data and tempId
      return { previousMessages, tempId, queryKey, convsKey };
    },

    // If the mutation fails, we need to revert.
    // Notice we use variables to construct the queryKey in case context is lost (after reload)
    onError: (err, newTodo, context) => {
      const queryKey = ["conversations", newTodo.conversationId, "messages"];
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKey, context.previousMessages);
      }
    },

    onSuccess: (newMessage, variables) => {
      const queryKey = ["conversations", variables.conversationId, "messages"];
      queryClient.setQueryData<Message[]>(queryKey, (old) => {
        if (!old) return [newMessage];
        const hasTemp = old.some(msg => msg.id.startsWith("temp-") && msg.body === newMessage.body);
        if (hasTemp) {
          return old.map(msg => msg.id.startsWith("temp-") && msg.body === newMessage.body ? newMessage : msg);
        }
        if (old.some(msg => msg.id === newMessage.id)) return old;
        return [...old, newMessage];
      });

      // Atualiza também a lista de conversas
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
    // Removido onSettled com invalidateQueries para evitar race condition de
    // Eventual Consistency no backend hospedado ou cache de navegador agressivo.
  });
}
