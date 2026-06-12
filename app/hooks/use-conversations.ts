import { useQuery, useIsMutating } from "@tanstack/react-query";
import { getConversations, type Conversation } from "@/lib/api";

export function useConversations() {
  const isMutating = useIsMutating({ mutationKey: ["sendMessage"] });

  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: getConversations,
    enabled: isMutating === 0,
    refetchInterval: 5000, // Poll every 5 seconds to keep the list updated
  });
}
