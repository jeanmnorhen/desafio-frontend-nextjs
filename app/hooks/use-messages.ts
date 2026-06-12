import { useQuery, useIsMutating } from "@tanstack/react-query";
import { getMessages, type Message } from "@/lib/api";

export function useMessages(conversationId: string | null) {
  const isMutating = useIsMutating({ mutationKey: ["sendMessage"] });

  return useQuery<Message[]>({
    queryKey: ["conversations", conversationId, "messages"],
    queryFn: () => getMessages(conversationId as string),
    refetchInterval: 3000, // Poll every 3 seconds for new messages
    enabled: !!conversationId && isMutating === 0, // Only fetch if we have an ID and no mutations are active
  });
}
