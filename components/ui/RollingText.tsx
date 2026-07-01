"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = {
  children: string;
  className?: string;
};

export default function RollingText({ children, className }: Props) {
  const reduce = useReducedMotion();

  if (reduce) return <span className={className}>{children}</span>;

  return (
    <span className={`relative inline-block overflow-hidden align-bottom ${className ?? ""}`}>
      <span className="block transition-transform duration-300 ease-[var(--ease-soft)] group-hover:-translate-y-[105%]">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 block translate-y-[105%] transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}
