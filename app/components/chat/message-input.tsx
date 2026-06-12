"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { useSendMessage } from "@/app/hooks/use-send-message";
import { useAiSuggest } from "@/app/hooks/use-ai-suggest";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: suggestReply, isPending: isSuggesting } = useAiSuggest();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || isSending) return;

    sendMessage({ conversationId, text: text.trim() });
    setText("");
    
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAiSuggest = () => {
    if (isSuggesting) return;
    
    suggestReply(conversationId, {
      onSuccess: (data) => {
        setText(data.suggestion);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      },
    });
  };

  return (
    <div className="flex shrink-0 items-end gap-2 bg-header p-3 sm:px-4">
      <button
        type="button"
        onClick={handleAiSuggest}
        disabled={isSuggesting}
        className={cn(
          "flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium text-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
          isSuggesting ? "bg-hover opacity-70" : "bg-hover hover:bg-active hover:text-text-primary"
        )}
        aria-label="Sugerir resposta com IA"
      >
        {isSuggesting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 text-primary" />
        )}
        <span className="hidden sm:inline">IA</span>
      </button>

      <form
        onSubmit={handleSubmit}
        className="flex min-h-10 flex-1 items-end gap-2 rounded-xl bg-bg-input pr-1 focus-within:ring-1 focus-within:ring-primary"
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma mensagem"
          className="max-h-[120px] min-h-[40px] w-full resize-none bg-transparent px-4 py-[10px] text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
          rows={1}
          aria-label="Mensagem"
        />
        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className="mb-1 mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-primary disabled:opacity-50 focus:outline-none"
          aria-label="Enviar mensagem"
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
}
