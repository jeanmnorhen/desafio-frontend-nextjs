import { useQuery } from "@tanstack/react-query";
import { getMessages, type Message } from "@/lib/api";

export function useMessages(conversationId: string | null) {
  return useQuery<Message[]>({
    queryKey: ["conversations", conversationId, "messages"],
    queryFn: () => getMessages(conversationId as string),
    refetchInterval: 3000,
    enabled: !!conversationId,
  });
}
