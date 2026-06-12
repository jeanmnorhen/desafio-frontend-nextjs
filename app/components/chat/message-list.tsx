"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, MessageSquareOff } from "lucide-react";
import { type Message } from "@/lib/api";
import { MessageBubble } from "./message-bubble";
import { MessageSkeleton } from "@/app/components/ui/skeleton";
import { EmptyState } from "@/app/components/ui/empty-state";
import { ErrorState } from "@/app/components/ui/error-state";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useSound } from "@/app/hooks/use-sound";

interface MessageListProps {
  conversationId: string | null;
  messages: Message[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function MessageList({ conversationId, messages, isLoading, isError, onRetry }: MessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages?.length || 0);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const { playPop } = useSound();

  // Determinar se o usuário fez scroll para cima
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Se a distância até o fim for maior que 100px, consideramos que rolou para cima
    const isScrolledUp = target.scrollHeight - target.scrollTop - target.clientHeight > 100;
    setShowScrollBottom(isScrolledUp);
    setIsAutoScrolling(!isScrolledUp);
  };

  // Rolar para baixo forçado
  const scrollToBottom = () => {
    if (parentRef.current) {
      // Quando usamos react-virtual, o scrollHeight reflete o tamanho total estimado.
      // requestAnimationFrame garante que o DOM atualizou o totalSize antes de rolar.
      requestAnimationFrame(() => {
        if (parentRef.current) {
          parentRef.current.scrollTop = parentRef.current.scrollHeight;
        }
      });
      setShowScrollBottom(false);
      setIsAutoScrolling(true);
    }
  };

  // Rola para a última mensagem (fim da conversa) ao carregar ou mudar de conversa
  useEffect(() => {
    if (!isLoading && messages && messages.length > 0) {
      setTimeout(scrollToBottom, 50); // delay sutil para renderização do virtualizer estabilizar
    }
  }, [conversationId, isLoading]);

  // Se tem nova mensagem
  useEffect(() => {
    const currentLength = messages?.length || 0;
    if (currentLength > prevMessagesLength.current) {
      // Mensagem nova chegou
      const lastMessage = messages![currentLength - 1];
      
      // Toca o som se a mensagem não foi enviada pelo usuário local
      if (lastMessage.direction === "in") {
        playPop();
      }

      if (isAutoScrolling) {
        setTimeout(scrollToBottom, 50); // delay sutil para o virtualizer calcular o offset da nova msg
      }
    }
    prevMessagesLength.current = currentLength;
  }, [messages, isAutoScrolling, playPop]);

  // Virtualizer setup
  const rowVirtualizer = useVirtualizer({
    count: messages?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // estimativa de tamanho do bubble
    overscan: 10,
  });

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

  return (
    <div className="relative flex-1 flex flex-col min-h-0 bg-bg-chat">
      {/* Background sutil tipo WhatsApp */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-chat-pattern opacity-5" />

      <div
        ref={parentRef}
        onScroll={handleScroll}
        className="relative z-10 h-full w-full overflow-y-auto px-4 sm:px-6"
        role="log"
        aria-live="polite"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const msg = messages[virtualRow.index];
            
            // Lógica simples para mostrar divisor de dia (apenas demonstrativa no virtualizer)
            // Em uma lista virtualizada, divisores precisam de tamanho estimado ou ser itens da lista
            const isFirstOfDay = 
              virtualRow.index === 0 || 
              format(new Date(messages[virtualRow.index - 1].createdAt), "dd/MM/yyyy") !== 
              format(new Date(msg.createdAt), "dd/MM/yyyy");

            let dayLabel = null;
            if (isFirstOfDay) {
              const dateObj = new Date(msg.createdAt);
              const dateStr = format(dateObj, "dd/MM/yyyy");
              const today = format(new Date(), "dd/MM/yyyy");
              const yesterday = format(new Date(Date.now() - 86400000), "dd/MM/yyyy");
              
              if (dateStr === today) dayLabel = "Hoje";
              else if (dateStr === yesterday) dayLabel = "Ontem";
              else dayLabel = format(dateObj, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
            }

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {dayLabel && (
                  <div className="my-4 flex justify-center pb-2">
                    <span className="rounded-md bg-hover px-3 py-1 text-xs font-medium text-text-secondary shadow-sm">
                      {dayLabel}
                    </span>
                  </div>
                )}
                <MessageBubble message={msg} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Scroll Down Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 z-20 flex h-10 w-10 animate-fade-in items-center justify-center rounded-full bg-bg-input text-text-secondary shadow-md transition-all hover:bg-hover hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Rolar para o fim"
        >
          <ArrowDown className="h-5 w-5" />
          {/* Opcional: badge vermelho aqui para qtd nova de msgs */}
        </button>
      )}
    </div>
  );
}
