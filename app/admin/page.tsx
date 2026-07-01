"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { reveal } from "@/lib/animations";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

type Status = "idle" | "pending" | "success" | "error";

export default function AdminLogin() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    const designation = String(data.get("designation") || "").trim();
    const organization = String(data.get("organization") || "").trim();
    const reason = String(data.get("reason") || "").trim();
    const nextErrors: Record<string, string> = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      nextErrors.email = "Enter a valid email id.";
    if (designation.length < 2) nextErrors.designation = "Enter your designation.";
    if (organization.length < 2) nextErrors.organization = "Enter your organisation.";
    if (reason.length < 10) nextErrors.reason = "Please provide a valid reason (min 10 characters).";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus("error");
      return;
    }

    setStatus("pending");

    try {
      await setDoc(doc(db, "admin_requests", email.toLowerCase()), {
        email,
        designation,
        organization,
        reason,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      setStatus("success");
      form.reset();
    } catch (error) {
      console.error(error);
      setErrors({
        form: "An error occurred connecting to the database. Please try again.",
      });
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen pt-28">
      <section className="pb-12">
        <div className="container-main">
          <SectionHeader eyebrow="Admin" title="Request Admin Access" />

          <motion.form
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            onSubmit={onSubmit}
            className="mx-auto mt-12 max-w-[600px] rounded-[28px] bg-white p-8 shadow-[0_4px_48px_rgba(0,0,0,0.07)] md:p-10"
            noValidate
          >
            {errors.form && (
              <div className="mb-6 rounded-xl bg-accent/10 p-4 text-sm font-medium text-accent">
                {errors.form}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              {/* Email */}
              <label className="mb-6 block text-sm font-medium text-zinc-800 md:col-span-2" htmlFor="email">
                Mail ID
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  className={cn(
                    "mt-2 min-h-14 w-full rounded-xl border bg-zinc-50 px-5 text-base text-ink outline-none transition focus:border-accent",
                    errors.email ? "border-accent" : "border-zinc-200"
                  )}
                />
                {errors.email && <span className="mt-2 block text-xs font-semibold text-accent">{errors.email}</span>}
              </label>

              {/* Designation */}
              <label className="mb-6 block text-sm font-medium text-zinc-800 col-span-1" htmlFor="designation">
                Designation
                <input
                  id="designation"
                  name="designation"
                  type="text"
                  placeholder="e.g. Developer"
                  className={cn(
                    "mt-2 min-h-14 w-full rounded-xl border bg-zinc-50 px-5 text-base text-ink outline-none transition focus:border-accent",
                    errors.designation ? "border-accent" : "border-zinc-200"
                  )}
                />
                {errors.designation && <span className="mt-2 block text-xs font-semibold text-accent">{errors.designation}</span>}
              </label>

              {/* Organisation */}
              <label className="mb-6 block text-sm font-medium text-zinc-800 col-span-1" htmlFor="organization">
                Organisation
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  placeholder="e.g. Christ University"
                  className={cn(
                    "mt-2 min-h-14 w-full rounded-xl border bg-zinc-50 px-5 text-base text-ink outline-none transition focus:border-accent",
                    errors.organization ? "border-accent" : "border-zinc-200"
                  )}
                />
                {errors.organization && <span className="mt-2 block text-xs font-semibold text-accent">{errors.organization}</span>}
              </label>

              {/* Reason */}
              <label className="mb-6 block text-sm font-medium text-zinc-800 md:col-span-2" htmlFor="reason">
                Why do you want access?
                <textarea
                  id="reason"
                  name="reason"
                  rows={4}
                  placeholder="Explain why you need admin access..."
                  className={cn(
                    "mt-2 w-full rounded-xl border bg-zinc-50 p-5 text-base text-ink outline-none transition focus:border-accent resize-none",
                    errors.reason ? "border-accent" : "border-zinc-200"
                  )}
                />
                {errors.reason && <span className="mt-2 block text-xs font-semibold text-accent">{errors.reason}</span>}
              </label>
            </div>

            <button
              type="submit"
              disabled={status === "pending" || status === "success"}
              className="mt-8 min-h-14 w-full rounded-pill bg-accent px-8 text-base font-bold text-white shadow-primary transition hover:-translate-y-0.5 hover:bg-accent-dark disabled:cursor-wait disabled:opacity-75 disabled:hover:translate-y-0"
            >
              {status === "pending"
                ? "Submitting request..."
                : status === "success"
                  ? "Request submitted"
                  : "Request Access"}
            </button>
            <p className="mt-6 text-center text-sm text-zinc-500">
              <a href="/register" className="font-semibold text-accent underline-offset-4 hover:underline">
                Back to Registration
              </a>
            </p>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
