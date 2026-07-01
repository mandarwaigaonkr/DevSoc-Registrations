"use client";

import { motion } from "framer-motion";
import { reveal } from "@/lib/animations";
import { SectionHeader } from "@/components/ui/SectionHeader";
import ArrowButton from "@/components/ui/ArrowButton";

export default function Dashboard() {
  return (
    <main className="min-h-screen pt-28">
      <section className="pb-12">
        <div className="container-main text-center">
          <motion.div variants={reveal} initial="hidden" animate="show" className="mx-auto max-w-[600px] mt-16 rounded-[32px] bg-white p-12 shadow-[0_4px_48px_rgba(0,0,0,0.07)]">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">Registration Successful!</h1>
            <p className="mt-4 text-zinc-500">
              Welcome to the Developer Society! We are excited to have you on board. Keep an eye on your email for next steps.
            </p>
            <div className="mt-10 flex justify-center">
               <ArrowButton href="/" label="Return to Home" />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
