"use client";

import { useMessages } from "@/app/hooks/use-messages";
import { useConversations } from "@/app/hooks/use-conversations";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { EmptyChat } from "./empty-chat";
import { ErrorState } from "@/app/components/ui/error-state";
import { Loader2 } from "lucide-react";
import { TypingIndicator } from "@/app/components/ui/typing-indicator";

interface ChatPanelProps {
  conversationId: string | null;
  onBack: () => void;
}

export function ChatPanel({ conversationId, onBack }: ChatPanelProps) {
  // Buscar os detalhes da conversa ativa (já deve estar no cache pelo ConversationList)
  const { data: conversations } = useConversations();
  const activeConversation = conversations?.find((c) => c.id === conversationId);

  // Buscar mensagens
  const { 
    data: messages, 
    isLoading, 
    isError, 
    refetch 
  } = useMessages(conversationId);

  // Mock: exibe o Typing Indicator baseando-se na presença de mensagens
  const isTyping = messages && messages.length > 0;

  if (!conversationId) {
    return <EmptyChat />;
  }

  // Se temos um ID mas a conversa não foi encontrada na lista
  if (!activeConversation) {
    return (
      <div className="flex h-full items-center justify-center bg-bg-app">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-bg-app">
      <ChatHeader 
        conversation={activeConversation} 
        onBack={onBack} 
      />
      
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <MessageList 
          messages={messages} 
          isLoading={isLoading} 
          isError={isError} 
          onRetry={() => refetch()} 
        />
        {isTyping && (
          <div className="absolute bottom-2 left-6 z-20 animate-fade-in">
            <TypingIndicator />
          </div>
        )}
      </div>
      
      <MessageInput conversationId={conversationId} />
    </main>
  );
}
