import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-9 items-center justify-center rounded-pill bg-white px-5 text-xs font-semibold text-zinc-600",
        className
      )}
    >
      {children}
    </span>
  );
}
