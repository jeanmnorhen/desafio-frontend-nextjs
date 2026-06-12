import { cn } from "@/lib/utils";

interface BadgeProps {
  count: number;
  className?: string;
}

export function Badge({ count, className }: BadgeProps) {
  if (count === 0) return null;

  return (
    <div
      className={cn(
        "flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white",
        "animate-pulse-slow",
        className
      )}
      aria-label={`${count} mensagens não lidas`}
    >
      {count > 99 ? "99+" : count}
    </div>
  );
}
