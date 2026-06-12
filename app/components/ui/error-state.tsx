import { AlertCircle, RefreshCcw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Algo deu errado", 
  message = "Não foi possível carregar as informações no momento.", 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-text-primary">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-text-secondary">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-app"
        >
          <RefreshCcw className="h-4 w-4" />
          Tentar novamente
        </button>
      )}
    </div>
  );
}
