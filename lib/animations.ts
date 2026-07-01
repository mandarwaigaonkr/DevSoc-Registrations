import type { Transition, Variants } from "framer-motion";

export const springSoft: Transition = {
  type: "spring",
  stiffness: 80,
  damping: 30,
  mass: 1
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 50,
  mass: 1
};

export const tweenSoft: Transition = {
  type: "tween",
  ease: [0.44, 0, 0.56, 1],
  duration: 0.4
};

export const inView = { once: true, amount: 0.2 } as const;

export const spring = springSoft;

export const revealUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { ...springSoft, delay: 0.05 } }
};

export const revealUpLg: Variants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: springSnappy }
};

export const staggerParent: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: springSoft }
};

export const navIntro: Variants = {
  hidden: { opacity: 0, y: -77 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18, delay: 0.1 }
  }
};

export const floatPillIntro: Variants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { ...springSnappy, delay: 2 } }
};

export const accordionContent: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3, ease: [0.44, 0, 0.56, 1] }
  },
  open: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.35, ease: [0.44, 0, 0.56, 1] }
  }
};

export const hoverLift = {
  whileHover: { y: -4, scale: 1.01, transition: tweenSoft },
  whileTap: { scale: 0.985, transition: { duration: 0.12 } }
};

export const hoverCard = {
  whileHover: { y: -6, transition: springSoft }
};

export const wordReveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...springSoft, delay: i * 0.05 }
  })
};

export const wordParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

export const iconPop = {
  whileHover: { scale: 1.12, rotate: 6, transition: { duration: 0.2 } },
  whileTap: { scale: 0.95 }
};

export const socialChild: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: springSoft }
};

export const reveal: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: springSoft }
};

export const revealMotion = {
  variants: revealUp,
  initial: "hidden" as const,
  whileInView: "show" as const,
  viewport: inView
};

export const stagger = staggerParent;
export const navMount = navIntro;
