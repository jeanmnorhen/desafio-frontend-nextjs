import { MessageSquareText } from "lucide-react";

export function EmptyChat() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-bg-app p-6 text-center shadow-[inset_0_0_100px_rgba(0,0,0,0.1)]">
      <div className="mb-6 rounded-full bg-hover p-8 text-text-secondary shadow-sm">
        <MessageSquareText className="h-20 w-20 opacity-80" strokeWidth={1} />
      </div>
      <h2 className="mb-3 text-2xl font-light text-text-primary">
        Inbox de Atendimento IA
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-text-secondary">
        Selecione uma conversa ao lado para visualizar as mensagens. 
        Este painel permite que você responda aos clientes com a ajuda de 
        sugestões inteligentes da nossa IA.
      </p>

    </div>
  );
}
