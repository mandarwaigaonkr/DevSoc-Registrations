import { ArrowRight } from "lucide-react";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BaseProps = {
  variant?: "primary" | "secondary" | "dark";
  icon?: boolean;
  className?: string;
  children: React.ReactNode;
};

const styles = {
  primary:
    "bg-accent text-white shadow-primary hover:bg-accent-dark focus-visible:ring-accent",
  secondary:
    "bg-white text-ink hover:bg-zinc-100 focus-visible:ring-zinc-300",
  dark: "bg-black text-white hover:bg-zinc-800 focus-visible:ring-zinc-500"
};

export function Button({
  variant = "primary",
  icon = true,
  className,
  children,
  ...props
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex min-h-14 items-center justify-center gap-5 rounded-pill px-8 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 hover:scale-[1.015] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        styles[variant],
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {icon ? <ArrowRight aria-hidden="true" size={21} strokeWidth={2.2} /> : null}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  icon = true,
  className,
  children,
  ...props
}: BaseProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        "inline-flex min-h-14 items-center justify-center gap-5 rounded-pill px-8 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 hover:scale-[1.015] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        styles[variant],
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {icon ? <ArrowRight aria-hidden="true" size={21} strokeWidth={2.2} /> : null}
    </a>
  );
}
