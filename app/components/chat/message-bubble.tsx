import { Check, CheckCheck, Clock } from "lucide-react";
import { format } from "date-fns";
import { type Message } from "@/lib/api";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOut = message.direction === "out";
  const isTemp = message.id.startsWith("temp-");
  const time = format(new Date(message.createdAt), "HH:mm");

  return (
    <div
      className={cn(
        "mb-2 flex w-full animate-slide-up",
        isOut ? "justify-end" : "justify-start"
      )}
      role="listitem"
    >
      <div
        className={cn(
          "relative max-w-[85%] rounded-lg px-3 py-1.5 shadow-sm md:max-w-[75%]",
          isOut ? "bg-bg-bubble-out rounded-tr-none text-text-primary" : "bg-bg-bubble-in rounded-tl-none text-text-primary",
          isTemp && "opacity-70"
        )}
      >
        {/* Tail - estilo WhatsApp */}
        <span
          className={cn(
            "absolute top-0 w-2 h-3",
            isOut
              ? "right-[-8px] text-bg-bubble-out"
              : "left-[-8px] text-bg-bubble-in"
          )}
        >
          <svg viewBox="0 0 8 13" width="8" height="13" className="fill-current">
            <path d={isOut ? "M8 0L0 0v13L8 0z" : "M0 0h8v13L0 0z"} />
          </svg>
        </span>

        <p className="whitespace-pre-wrap break-words text-[14.5px] leading-relaxed">
          {message.body}
        </p>
        
        <div className="flex items-center justify-end gap-1 pb-0.5 pt-1">
          <span className="text-[11px] text-text-secondary">{time}</span>
          {isOut && (
            <span className="text-text-secondary">
              {isTemp ? (
                <Clock className="h-[14px] w-[14px]" />
              ) : message.status === "read" ? (
                <CheckCheck className="h-[16px] w-[16px] text-primary" />
              ) : message.status === "delivered" ? (
                <CheckCheck className="h-[16px] w-[16px]" />
              ) : (
                <Check className="h-[16px] w-[16px]" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
