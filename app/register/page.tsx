"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { reveal } from "@/lib/animations";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import { auth, db } from "@/lib/firebase";
// Firebase auth removed to bypass configuration error
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

type Status = "idle" | "pending" | "success" | "error";

export default function Register() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const regNo = String(data.get("regNo") || "").trim();
    const contact = String(data.get("contact") || "").trim();
    const nextErrors: Record<string, string> = {};

    if (name.length < 2) nextErrors.name = "Enter your full name.";
    if (!/^[^\s@]+@([a-zA-Z0-9-]+\.)*christuniversity\.in$/i.test(email))
      nextErrors.email = "Use a valid Christ University email id.";
    if (regNo.length < 5) nextErrors.regNo = "Enter your Register number.";
    if (!/^\+91[\s-]?\d{10}$/.test(contact))
      nextErrors.contact =
        "Contact number must start with +91 followed by 10 digits.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus("error");
      return;
    }

    setStatus("pending");

    try {
      // Save user profile directly to Firestore, bypassing Firebase Auth
      // We use the email address as the unique document ID
      await setDoc(doc(db, "users", email.toLowerCase()), {
        name,
        email,
        regNo,
        contact,
        createdAt: new Date().toISOString(),
      });

      setStatus("success");
      form.reset();

      // Redirect to dashboard or success page after 1.5 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
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
          <SectionHeader eyebrow="Join Now" title="Register for DevSoc" />

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
              {[
                ["name", "Full Name", "John Doe", "text", true],
                ["regNo", "Register number", "23BCE0000", "text", false],
                ["contact", "Contact number", "+91 9876543210", "tel", false],
                [
                  "email",
                  "Email ID",
                  "abhinav.jadhav@btech.christuniversity.in",
                  "email",
                  true
                ],
              ].map(([id, label, placeholder, type, fullWidth]) => (
                <label
                  key={id as string}
                  className={cn(
                    "mb-6 block text-sm font-medium text-zinc-800",
                    fullWidth ? "md:col-span-2" : "col-span-1"
                  )}
                  htmlFor={id as string}
                >
                  {label as string}
                  {id === "email" && (
                    <span className="font-normal text-zinc-400">
                      {" "}
                      (use only specific christ mail id)
                    </span>
                  )}
                  <input
                    id={id as string}
                    name={id as string}
                    type={type as string}
                    placeholder={placeholder as string}
                    className={cn(
                      "mt-2 min-h-14 w-full rounded-xl border bg-zinc-50 px-5 text-base text-ink outline-none transition focus:border-accent",
                      errors[id as string] ? "border-accent" : "border-zinc-200",
                    )}
                  />
                  {errors[id as string] ? (
                    <span className="mt-2 block text-xs font-semibold text-accent">
                      {errors[id as string]}
                    </span>
                  ) : null}
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={status === "pending" || status === "success"}
              className="mt-8 min-h-14 w-full rounded-pill bg-accent px-8 text-base font-bold text-white shadow-primary transition hover:-translate-y-0.5 hover:bg-accent-dark disabled:cursor-wait disabled:opacity-75 disabled:hover:translate-y-0"
            >
              {status === "pending"
                ? "Registering now..."
                : status === "success"
                  ? "Registered now"
                  : "Register now"}
            </button>
            <p className="mt-6 text-center text-sm text-zinc-500">
              <a
                href="/admin"
                className="font-semibold text-accent underline-offset-4 hover:underline"
              >
                Admin login
              </a>
            </p>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
