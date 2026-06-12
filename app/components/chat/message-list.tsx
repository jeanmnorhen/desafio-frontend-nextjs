"use client";

import { useEffect, useRef } from "react";
import { MessageSquareOff } from "lucide-react";
import { type Message } from "@/lib/api";
import { MessageBubble } from "./message-bubble";
import { MessageSkeleton } from "@/app/components/ui/skeleton";
import { EmptyState } from "@/app/components/ui/empty-state";
import { ErrorState } from "@/app/components/ui/error-state";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MessageListProps {
  messages: Message[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function MessageList({ messages, isLoading, isError, onRetry }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (messages && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isError) {
    return (
      <div className="flex-1 bg-bg-chat">
        <ErrorState onRetry={onRetry} message="Não foi possível carregar as mensagens." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-bg-chat p-4 sm:p-6" role="log" aria-live="polite">
        <MessageSkeleton direction="in" />
        <MessageSkeleton direction="out" />
        <MessageSkeleton direction="in" />
        <MessageSkeleton direction="in" />
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 bg-bg-chat">
        <EmptyState
          icon={<MessageSquareOff className="h-8 w-8" />}
          title="Nenhuma mensagem"
          description="Envie uma mensagem para iniciar a conversa."
        />
      </div>
    );
  }

  // Agrupar mensagens por dia
  const groupedMessages: Record<string, Message[]> = {};
  messages.forEach((msg) => {
    const date = format(new Date(msg.createdAt), "dd/MM/yyyy");
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(msg);
  });

  return (
    <div className="flex-1 overflow-y-auto bg-bg-chat p-4 sm:p-6" role="log" aria-live="polite">
      {/* Background sutil tipo WhatsApp */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-chat-pattern opacity-5" />
      
      <div className="relative z-10 flex flex-col justify-end min-h-full">
        {Object.entries(groupedMessages).map(([date, msgs]) => {
          // Tentar formatar o dia (Hoje, Ontem, ou data)
          const dateObj = new Date(msgs[0].createdAt);
          let dayLabel = date;
          const today = format(new Date(), "dd/MM/yyyy");
          const yesterday = format(new Date(Date.now() - 86400000), "dd/MM/yyyy");
          
          if (date === today) dayLabel = "Hoje";
          else if (date === yesterday) dayLabel = "Ontem";
          else dayLabel = format(dateObj, "d 'de' MMMM 'de' yyyy", { locale: ptBR });

          return (
            <div key={date} className="flex flex-col">
              <div className="my-4 flex justify-center">
                <span className="rounded-md bg-hover px-3 py-1 text-xs font-medium text-text-secondary shadow-sm">
                  {dayLabel}
                </span>
              </div>
              {msgs.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          );
        })}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
}
