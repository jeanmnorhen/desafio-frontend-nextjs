import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-hover", className)}
      {...props}
    />
  );
}

export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function MessageSkeleton({ direction = "in" }: { direction?: "in" | "out" }) {
  const isOut = direction === "out";
  return (
    <div className={cn("flex w-full mb-4", isOut ? "justify-end" : "justify-start")}>
      <Skeleton
        className={cn(
          "h-10 min-w-[120px] max-w-[60%] rounded-lg",
          isOut ? "bg-bg-bubble-out opacity-50" : "bg-bg-bubble-in opacity-50"
        )}
      />
    </div>
  );
}
