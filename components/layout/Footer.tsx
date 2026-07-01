"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { iconPop, reveal, socialChild, stagger } from "@/lib/animations";
import RollingText from "@/components/ui/RollingText";

export function Footer() {
  return (
    <motion.footer
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="border-t border-zinc-100 bg-[#f6f6f7] px-[15px] py-12 text-ink md:px-[30px]"
    >
      <div className="container-main">
        <div className="flex flex-wrap justify-center gap-10 p-0 md:gap-32">
          <div>
            <h2 className="font-display text-lg font-bold">Socials</h2>
            <div className="mt-7 flex max-w-[300px] gap-3 rounded-[28px] bg-white p-3 text-zinc-700">
              <div className="flex h-[178px] w-[136px] items-center justify-center rounded-2xl bg-zinc-100 p-4">
                <img
                  src="/devs-logo-static.svg"
                  alt="Developer Society logo"
                  width={100}
                  height={100}
                  className="h-full w-full object-contain"
                />
              </div>
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.4 }}
                className="grid content-start gap-2 pt-1"
              >
                {[
                  ["LinkedIn", "https://linkedin.com"],
                  ["GitHub", "https://github.com"],
                  ["Instagram", "https://instagram.com"],
                  ["Facebook", "https://facebook.com"]
                ].map(([label, href]) => (
                  <motion.a
                    key={String(label)}
                    href={String(href)}
                    target="_blank"
                    rel="noreferrer"
                    variants={socialChild}
                    className="group inline-flex min-h-9 items-center gap-2 rounded-pill border border-zinc-200 px-4 text-sm font-semibold transition hover:bg-accent hover:text-white"
                  >
                    <RollingText>{String(label)}</RollingText>
                  </motion.a>
                ))}
              </motion.div>
            </div>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">Links</h2>
            <div className="mt-7 grid max-w-[180px] gap-1 rounded-[24px] bg-white p-3 text-sm font-semibold text-zinc-500">
              {[
                ["All Projects", "/all-projects"],
                ["Contact", "/contact"],
                ["About", "/about"],
                ["404", "/404"]
              ].map(([item, href]) => (
                <a key={item} href={href} className="rounded-2xl px-4 py-3 transition hover:bg-zinc-100 hover:text-ink active:text-accent">
                  {item}
                </a>
              ))}
            </div>
          </div>

        </div>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 rounded-[32px] bg-white px-8 py-6 text-center text-sm text-zinc-500 shadow-[0_1px_0_rgba(24,24,27,0.04)] md:flex-row md:justify-between md:rounded-[60px] md:text-left">
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <a href="/legal/privacy" className="transition hover:text-ink active:text-accent">Privacy Policy</a>
            <a href="/legal/terms" className="transition hover:text-ink active:text-accent">Terms of Service</a>
          </div>
          <span>© 2026 Developer Society, Christ University. Built for launch.</span>
        </div>
      </div>
    </motion.footer>
  );
}
