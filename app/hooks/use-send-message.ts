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

    // If the mutation fails, use the context we returned above
    onError: (err, newTodo, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(context.queryKey, context.previousMessages);
      }
      // Note: We'd ideally revert the conversation list too, but it will be refetched soon anyway
    },

    // Always refetch after error or success to ensure server sync
    onSettled: (data, error, variables, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
      if (context?.convsKey) {
        queryClient.invalidateQueries({ queryKey: context.convsKey });
      }
    },
  });
}
