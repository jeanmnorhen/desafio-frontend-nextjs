import { useQuery, useIsMutating } from "@tanstack/react-query";
import { getConversations, type Conversation } from "@/lib/api";
import { useState, useEffect, useRef } from "react";

export function useConversations() {
  const isMutating = useIsMutating({ mutationKey: ["sendMessage"] });
  const [pollPaused, setPollPaused] = useState(false);
  const wasMutating = useRef(false);

  // Mesma lógica de cooldown do useMessages:
  // Pausa o polling durante mutações e por 5s após finalizar.
  useEffect(() => {
    if (isMutating > 0) {
      wasMutating.current = true;
      setPollPaused(true);
    } else if (wasMutating.current) {
      wasMutating.current = false;
      const timer = setTimeout(() => setPollPaused(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isMutating]);

  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: getConversations,
    refetchInterval: pollPaused ? false : 5000,
  });
}
