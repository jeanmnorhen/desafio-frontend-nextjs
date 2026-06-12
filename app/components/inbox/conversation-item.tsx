import { type Conversation, getMessages } from "@/lib/api";
import { Avatar } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { formatRelativeTime, cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    // Prefetch das mensagens dessa conversa
    queryClient.prefetchQuery({
      queryKey: ["conversations", conversation.id, "messages"],
      queryFn: () => getMessages(conversation.id),
      staleTime: 3000,
    });
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      className={cn(
        "flex w-full items-center gap-3 border-b border-border p-3 text-left transition-colors hover:bg-hover focus:bg-hover focus:outline-none",
        isActive && "bg-active"
      )}
      aria-current={isActive ? "true" : undefined}
      role="listitem"
    >
      <Avatar 
        name={conversation.contactName} 
        color={conversation.avatarColor} 
        size="lg" 
      />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="truncate font-medium text-text-primary">
            {conversation.contactName}
          </span>
          {conversation.lastMessageAt && (
            <span className={cn(
              "shrink-0 text-xs",
              conversation.unread > 0 ? "text-primary font-medium" : "text-text-secondary"
            )}>
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className={cn(
            "truncate text-sm",
            conversation.unread > 0 ? "text-text-primary font-medium" : "text-text-secondary"
          )}>
            {conversation.lastMessage}
          </span>
          <Badge count={conversation.unread} className="shrink-0" />
        </div>
      </div>
    </button>
  );
}
