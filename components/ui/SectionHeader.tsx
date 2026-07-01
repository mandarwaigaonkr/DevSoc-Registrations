"use client";

import { motion } from "framer-motion";
import { reveal } from "@/lib/animations";
import { Badge } from "@/components/ui/Badge";
import SplitWords from "@/components/ui/SplitWords";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  className = ""
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
      className={`mx-auto max-w-3xl text-center ${className}`}
    >
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
      <SplitWords
        text={title}
        as="h2"
        className="mt-5 font-display text-5xl font-bold leading-[0.98] tracking-normal text-ink md:text-7xl"
      />
      {subtitle ? <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-zinc-500">{subtitle}</p> : null}
    </motion.div>
  );
}
