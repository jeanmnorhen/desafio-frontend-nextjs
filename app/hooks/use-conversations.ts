import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getConversations, type Conversation } from "@/lib/api";
import { useEffect, useRef } from "react";
import { subscribeToChannel, unsubscribeFromChannel } from "@/lib/pusher";

export function useConversations() {
  const queryClient = useQueryClient();

  const query = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });

  const cleanupRef = useRef<() => void>(() => {});

  useEffect(() => {
    let channel: any = null;
    let cancelled = false;

    const initPusher = async () => {
      channel = await subscribeToChannel("conversas");
      if (!channel || cancelled) return;

      const handleUpdate = (payload: any) => {
        const msg = payload.message || (payload.body ? payload : null);
        const convId = payload.conversationId || payload.id;

        if (!convId) return;

        queryClient.setQueryData<Conversation[]>(["conversations"], (oldList) => {
          if (!oldList) return oldList;

          const updatedList = [...oldList];
          const index = updatedList.findIndex((c) => c.id === convId);

          if (index !== -1) {
            const existing = updatedList[index];

            let newUnread = existing.unread;
            if (msg && msg.direction === "in") {
              newUnread = existing.unread + 1;
            }

            updatedList[index] = {
              ...existing,
              lastMessage: msg ? msg.body : existing.lastMessage,
              lastMessageAt: msg ? msg.createdAt : new Date().toISOString(),
              unread: newUnread,
            };
          } else {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            return oldList;
          }

          return updatedList.sort(
            (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          );
        });
      };

      channel.bind("message:new", handleUpdate);
      channel.bind("conversation:updated", handleUpdate);

      cleanupRef.current = () => {
        channel.unbind("message:new", handleUpdate);
        channel.unbind("conversation:updated", handleUpdate);
        unsubscribeFromChannel("conversas");
      };
    };

    initPusher();

    return () => {
      cancelled = true;
      cleanupRef.current();
    };
  }, [queryClient]);

  return query;
}

