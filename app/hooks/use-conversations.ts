import { useQuery } from "@tanstack/react-query";
import { getConversations, type Conversation } from "@/lib/api";

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: getConversations,
    refetchInterval: 5000,
  });
}
