"use client";

import { motion } from "framer-motion";
import { reveal } from "@/lib/animations";

export function Footer() {
  return (
    <motion.footer
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="border-t border-zinc-100 bg-[#f6f6f7] px-[15px] py-8 text-ink md:px-[30px] mt-auto"
    >
      <div className="container-main flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-3">
          <img
            src="/devs-logo-static.svg"
            alt="Developer Society logo"
            width={32}
            height={32}
            className="opacity-60 grayscale"
          />
          <span className="text-sm font-semibold text-zinc-500">
            © 2026 Developer Society, Christ University.
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm font-semibold text-zinc-400">
          <a href="/help" className="transition hover:text-ink">Help Center</a>
          <a href="/legal/privacy" className="transition hover:text-ink">Privacy Policy</a>
          <a href="/legal/terms" className="transition hover:text-ink">Terms of Service</a>
        </div>
      </div>
    </motion.footer>
  );
}
