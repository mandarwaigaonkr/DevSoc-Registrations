"use client";

import { motion, useReducedMotion } from "framer-motion";
import { inView, wordParent, wordReveal } from "@/lib/animations";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
};

const motionTags = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span
};

export default function SplitWords({ text, as = "h2", className }: Props) {
  const reduce = useReducedMotion();
  const MotionTag = motionTags[as];
  const words = text.split(" ");

  if (reduce) {
    const StaticTag = as;
    return <StaticTag className={className}>{text}</StaticTag>;
  }

  return (
    <MotionTag
      className={className}
      variants={wordParent}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      aria-label={text}
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="inline-block overflow-hidden align-bottom pb-[0.2em] -mb-[0.2em]">
          <motion.span className="inline-block" variants={wordReveal} custom={index}>
            {word}
            {index < words.length - 1 ? "\u00a0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
