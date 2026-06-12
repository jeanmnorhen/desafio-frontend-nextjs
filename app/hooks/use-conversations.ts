import { useQuery } from "@tanstack/react-query";
import { getConversations, type Conversation } from "@/lib/api";

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: getConversations,
    refetchInterval: 5000, // Poll every 5 seconds to keep the list updated
  });
}
