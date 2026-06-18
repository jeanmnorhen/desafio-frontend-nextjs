import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getMessages, type Message } from "@/lib/api";
import { useEffect, useMemo, useRef } from "react";
import { subscribeToChannel, unsubscribeFromChannel } from "@/lib/pusher";

const PAGE_SIZE = 20;

function addMessageToCache(queryClient: any, queryKey: any[], msg: Message, tempBody?: string) {
  queryClient.setQueryData(queryKey, (oldData: any) => {
    if (!oldData) {
      return {
        pages: [{ messages: [msg], nextPage: undefined }],
        pageParams: [0],
      };
    }

    if (Array.isArray(oldData)) {
      const filtered = oldData.filter((m: Message) => m.id !== msg.id);
      const withoutTemp = tempBody
        ? filtered.filter((m: Message) => !(m.id.startsWith("temp-") && m.body === tempBody))
        : filtered;
      return [...withoutTemp, msg];
    }

    const newPages = [...(oldData.pages || [])];

    if (newPages.length > 0) {
      newPages[0] = {
        ...newPages[0],
        messages: [
          ...newPages[0].messages.filter((m: Message) => {
            if (m.id === msg.id) return false;
            if (tempBody && m.id.startsWith("temp-") && m.body === tempBody) return false;
            return true;
          }),
          msg,
        ],
      };
    } else {
      newPages.push({ messages: [msg], nextPage: undefined });
    }

    return { ...oldData, pages: newPages };
  });
}

export function useMessages(conversationId: string | null) {
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => ["conversations", conversationId, "messages"], [conversationId]);

  // Corrige cache legado que possa conter array plano ao invés de { pages, pageParams }
  const cachedLegacyData = queryClient.getQueryData(queryKey);
  if (Array.isArray(cachedLegacyData)) {
    queryClient.setQueryData(queryKey, {
      pages: [{ messages: cachedLegacyData, nextPage: undefined }],
      pageParams: [0],
    });
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      if (!conversationId) return { messages: [], nextPage: undefined };

      const result = await getMessages(conversationId);
      const all = Array.isArray(result) ? result : [];
      all.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const total = all.length;
      const start = Math.max(0, total - (pageParam + 1) * PAGE_SIZE);
      const end = Math.max(0, total - pageParam * PAGE_SIZE);

      return {
        messages: all.slice(start, end),
        nextPage: start > 0 ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled: !!conversationId,
  });

  // Inscreve no Pusher para receber novas mensagens em tempo real
  const cleanupRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!conversationId) return;

    const queryKeyCurrent = queryKey;

    let channel: any = null;
    let cancelled = false;

    const initPusher = async () => {
      channel = await subscribeToChannel("conversas");
      if (!channel || cancelled) return;

      const handleNewMessage = (payload: { conversationId: string; message: Message } | Message) => {
        const msg = "message" in payload ? payload.message : payload;
        const targetConvId = "conversationId" in payload ? payload.conversationId : conversationId;

        if (targetConvId !== conversationId) return;

        addMessageToCache(queryClient, queryKeyCurrent, msg);
      };

      channel.bind(`message:new-${conversationId}`, handleNewMessage);

      cleanupRef.current = () => {
        channel.unbind(`message:new-${conversationId}`, handleNewMessage);
        unsubscribeFromChannel("conversas");
      };
    };

    initPusher();

    return () => {
      cancelled = true;
      cleanupRef.current();
    };
  }, [conversationId, queryClient, queryKey]);

  // Converte a estrutura de páginas do useInfiniteQuery de volta para array plano cronológico
  const messages = data && Array.isArray(data.pages)
    ? [...data.pages].reverse().flatMap((page) => (page && Array.isArray(page.messages) ? page.messages : []))
    : undefined;

  return {
    data: messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  };
}

