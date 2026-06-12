import { Search, X } from "lucide-react";

interface ConversationSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export function ConversationSearch({ value, onChange }: ConversationSearchProps) {
  return (
    <div className="relative mx-3 mb-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-text-secondary" />
      </div>
      <input
        type="text"
        className="block w-full rounded-lg bg-bg-app py-2 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-secondary focus:border-border focus:outline-none focus:ring-1 focus:ring-border"
        placeholder="Pesquisar ou começar uma nova conversa"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary focus:outline-none"
          aria-label="Limpar busca"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
