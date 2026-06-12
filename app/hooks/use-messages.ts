import { useQuery, useIsMutating } from "@tanstack/react-query";
import { getMessages, type Message } from "@/lib/api";
import { useState, useEffect, useRef } from "react";

export function useMessages(conversationId: string | null) {
  const isMutating = useIsMutating({ mutationKey: ["sendMessage"] });
  const [pollPaused, setPollPaused] = useState(false);
  const wasMutating = useRef(false);

  // Pausa o polling enquanto houver mutações pendentes (incluindo pausadas/offline)
  // e mantém pausado por 5 segundos após a mutação finalizar.
  // Isso evita que um GET retorne dados velhos do servidor (Eventual Consistency)
  // e sobrescreva o cache otimista com a lista antiga, apagando a mensagem.
  useEffect(() => {
    if (isMutating > 0) {
      wasMutating.current = true;
      setPollPaused(true);
    } else if (wasMutating.current) {
      // A mutação acabou de finalizar — mantém o polling pausado por 5s
      // para dar tempo ao servidor de propagar a mensagem (Eventual Consistency)
      wasMutating.current = false;
      const timer = setTimeout(() => setPollPaused(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isMutating]);

  return useQuery<Message[]>({
    queryKey: ["conversations", conversationId, "messages"],
    queryFn: () => getMessages(conversationId as string),
    // Polling suprimido durante mutação e cooldown de 5s pós-mutação
    refetchInterval: pollPaused ? false : 3000,
    enabled: !!conversationId,
  });
}
