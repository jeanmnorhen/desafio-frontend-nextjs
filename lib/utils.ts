import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  // Se for o mesmo dia, mostra a hora (ex: 14:30)
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return format(date, "HH:mm");
  }

  // Se for da mesma semana (menos de 7 dias), mostra o dia da semana
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    // Primeira letra maiúscula
    const day = format(date, "eeee", { locale: ptBR });
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  // Caso contrário, mostra a data no formato dd/MM/yy
  return format(date, "dd/MM/yy");
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 13 || cleaned.length === 12) {
    const isNineDigit = cleaned.length === 13;
    const country = cleaned.substring(0, 2);
    const ddd = cleaned.substring(2, 4);
    if (isNineDigit) {
      return `+${country} (${ddd}) ${cleaned.substring(4, 9)}-${cleaned.substring(9)}`;
    } else {
      return `+${country} (${ddd}) ${cleaned.substring(4, 8)}-${cleaned.substring(8)}`;
    }
  } else if (cleaned.length === 11 || cleaned.length === 10) {
    const ddd = cleaned.substring(0, 2);
    if (cleaned.length === 11) {
      return `(${ddd}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    } else {
      return `(${ddd}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    }
  }
  return phone;
}
