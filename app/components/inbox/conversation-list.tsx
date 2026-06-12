"use client";

import { useState, useEffect, useMemo } from "react";
import { MessageSquareOff } from "lucide-react";
import { useConversations } from "@/app/hooks/use-conversations";
import { ConversationSearch } from "./conversation-search";
import { ConversationItem } from "./conversation-item";
import { ConversationSkeleton } from "@/app/components/ui/skeleton";
import { ErrorState } from "@/app/components/ui/error-state";
import { EmptyState } from "@/app/components/ui/empty-state";

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState("");
  const { data: conversations, isLoading, isError, refetch } = useConversations();

  // Filtrar conversas por nome ou telefone
  const filteredConversations = useMemo(() => {
    return conversations?.filter(
      (c) =>
        c.contactName.toLowerCase().includes(search.toLowerCase()) ||
        c.contactPhone.includes(search)
    ) ?? [];
  }, [conversations, search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando no input de busca ou mensagem
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (filteredConversations.length === 0) return;
        
        const currentIndex = filteredConversations.findIndex(c => c.id === selectedId);
        
        let nextIndex;
        if (e.key === "ArrowDown") {
          nextIndex = currentIndex < filteredConversations.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : filteredConversations.length - 1;
        }
        
        onSelect(filteredConversations[nextIndex].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, filteredConversations, onSelect]);

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  // Ordenar por data da última mensagem (descendente)
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });

  return (
    <div className="flex h-full flex-col bg-bg-sidebar pt-3">
      <ConversationSearch value={search} onChange={setSearch} />
      
      <div className="flex-1 overflow-y-auto" role="list" aria-label="Lista de conversas">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <ConversationSkeleton key={i} />)
        ) : sortedConversations.length === 0 ? (
          <EmptyState
            icon={<MessageSquareOff className="h-8 w-8" />}
            title="Nenhuma conversa encontrada"
            description={search ? "Tente buscar por outro nome ou número." : "Você ainda não tem conversas."}
          />
        ) : (
          sortedConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={selectedId === conversation.id}
              onClick={() => onSelect(conversation.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
