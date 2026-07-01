"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { tweenSoft } from "@/lib/animations";
import { cn } from "@/lib/utils";
import RollingText from "@/components/ui/RollingText";

type ArrowButtonProps = {
  label: string;
  href?: string;
  variant?: "solid" | "ghost" | "dark";
  className?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

const variants = {
  solid: "bg-accent text-on-accent shadow-primary hover:bg-accent-dark focus-visible:ring-accent",
  ghost: "bg-white text-ink hover:bg-zinc-100 focus-visible:ring-zinc-300",
  dark: "bg-black text-white hover:bg-zinc-800 focus-visible:ring-zinc-500"
};

function Inner({ label, variant, className }: Required<Pick<ArrowButtonProps, "label" | "variant">> & Pick<ArrowButtonProps, "className">) {
  const reduce = useReducedMotion();

  return (
    <motion.span
      className={cn(
        "group relative inline-flex min-h-14 cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-pill px-8 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variants[variant],
        className
      )}
      whileHover={reduce ? undefined : { y: -3, scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={tweenSoft}
    >
      <motion.span variants={{ rest: { x: 0 }, hover: { x: -2 } }} transition={tweenSoft}>
        <RollingText>{label}</RollingText>
      </motion.span>
      <span className="relative inline-flex size-5 overflow-hidden">
        <motion.span
          className="absolute inset-0 flex items-center justify-center"
          variants={{ rest: { x: 0, opacity: 1 }, hover: { x: 18, opacity: 0 } }}
          transition={tweenSoft}
        >
          <ArrowRight size={20} strokeWidth={2.2} />
        </motion.span>
        <motion.span
          className="absolute inset-0 flex items-center justify-center"
          variants={{ rest: { x: -18, opacity: 0 }, hover: { x: 0, opacity: 1 } }}
          transition={tweenSoft}
        >
          <ArrowRight size={20} strokeWidth={2.2} />
        </motion.span>
      </span>
    </motion.span>
  );
}

export default function ArrowButton({
  label,
  href,
  variant = "solid",
  className,
  target,
  rel,
  onClick,
  type = "button"
}: ArrowButtonProps) {
  const reduce = useReducedMotion();
  const motionProps = reduce ? {} : { initial: "rest", animate: "rest", whileHover: "hover" };

  if (href) {
    return (
      <motion.a href={href} target={target} rel={rel} className="inline-flex focus-visible:outline-none" {...motionProps}>
        <Inner label={label} variant={variant} className={className} />
      </motion.a>
    );
  }

  return (
    <motion.button type={type} onClick={onClick} className="inline-flex focus-visible:outline-none" {...motionProps}>
      <Inner label={label} variant={variant} className={className} />
    </motion.button>
  );
}
