"use client";

import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/app/components/ui/avatar";
import { type Conversation } from "@/lib/api";

interface ChatHeaderProps {
  conversation: Conversation;
  onBack: () => void;
}

export function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-[60px] shrink-0 items-center gap-3 bg-header px-4 shadow-sm">
      <button
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-hover hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary md:hidden"
        aria-label="Voltar para lista de conversas"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <Avatar
        name={conversation.contactName}
        color={conversation.avatarColor}
        size="md"
        className="cursor-pointer"
      />

      <div className="flex flex-col">
        <h2 className="text-base font-medium leading-tight text-text-primary">
          {conversation.contactName}
        </h2>
        <span className="text-xs text-text-secondary">
          {conversation.contactPhone}
        </span>
      </div>
    </header>
  );
}
