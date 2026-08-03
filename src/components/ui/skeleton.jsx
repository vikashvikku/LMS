import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted/70 skeleton-shimmer", className)}
      {...props} />
  );
}

export { Skeleton }

