import { useQuery } from "@tanstack/react-query";
import { getMessages, type Message } from "@/lib/api";

export function useMessages(conversationId: string | null) {
  return useQuery<Message[]>({
    queryKey: ["conversations", conversationId, "messages"],
    queryFn: () => getMessages(conversationId as string),
    refetchInterval: 3000, // Poll every 3 seconds for new messages
    enabled: !!conversationId, // Only fetch if we have an ID
  });
}
