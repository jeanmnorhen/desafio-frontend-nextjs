import { getInitials, cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ name, color = "bg-neutral-600", size = "md", className }: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full text-white font-medium shrink-0",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: color }}
      role="img"
      aria-label={`Avatar de ${name}`}
    >
      {getInitials(name)}
    </div>
  );
}
