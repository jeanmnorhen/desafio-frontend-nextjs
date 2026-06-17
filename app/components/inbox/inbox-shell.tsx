"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConversationList } from "./conversation-list";
import { ChatPanel } from "@/app/components/chat/chat-panel";
import { cn } from "@/lib/utils";

export function InboxShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedConversationId = searchParams.get("chatId");

  const setSelectedConversationId = useCallback((id: string | null) => {
    if (id) {
      router.push(`/?chatId=${id}`);
    } else {
      router.push(`/`);
    }
  }, [router]);

  // Fecha o chat ativo quando pressionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedConversationId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSelectedConversationId]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-app">
      {/* Sidebar - Oculta no mobile quando uma conversa está selecionada */}
      <aside
        className={cn(
          "h-full w-full border-r border-border sm:w-[380px] sm:shrink-0",
          selectedConversationId ? "hidden sm:block" : "block"
        )}
      >
        <ConversationList 
          selectedId={selectedConversationId} 
          onSelect={setSelectedConversationId} 
        />
      </aside>

      {/* Main Chat Area - Oculta no mobile quando nenhuma conversa está selecionada */}
      <main
        className={cn(
          "flex-1 h-full min-w-0 bg-bg-app relative",
          !selectedConversationId ? "hidden sm:flex" : "flex"
        )}
      >
        <ChatPanel 
          conversationId={selectedConversationId} 
          onBack={() => setSelectedConversationId(null)} 
        />
      </main>
    </div>
  );
}
