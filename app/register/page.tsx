"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { reveal } from "@/lib/animations";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
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
    const password = String(data.get("password") || "");
    const nextErrors: Record<string, string> = {};

    if (name.length < 2) nextErrors.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email.";
    if (regNo.length < 5) nextErrors.regNo = "Enter your Registration / Roll Number.";
    if (password.length < 6) nextErrors.password = "Password must be at least 6 characters.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus("error");
      return;
    }

    setStatus("pending");

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Save user profile to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        regNo,
        createdAt: new Date().toISOString()
      });

      setStatus("success");
      form.reset();
      
      // Redirect to dashboard or success page after 1.5 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (error: any) {
      console.error(error);
      const code = error.code;
      if (code === "auth/email-already-in-use") {
        setErrors({ email: "Email is already in use." });
      } else {
        setErrors({ form: "An error occurred during registration. Please try again." });
      }
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

            {[
              ["name", "Full Name", "John Doe", "text"],
              ["email", "Email Address", "john@example.com", "email"],
              ["regNo", "Registration Number", "23BCE0000", "text"],
              ["password", "Password", "••••••••", "password"]
            ].map(([id, label, placeholder, type]) => (
              <label key={id} className="mb-6 block text-sm font-medium text-zinc-800" htmlFor={id}>
                {label}
                <input
                  id={id}
                  name={id}
                  type={type}
                  placeholder={placeholder}
                  className={cn("mt-2 min-h-14 w-full rounded-xl border bg-zinc-50 px-5 text-base text-ink outline-none transition focus:border-accent", errors[id] ? "border-accent" : "border-zinc-200")}
                />
                {errors[id] ? <span className="mt-2 block text-xs font-semibold text-accent">{errors[id]}</span> : null}
              </label>
            ))}
            
            <button
              type="submit"
              disabled={status === "pending" || status === "success"}
              className="mt-8 min-h-14 w-full rounded-pill bg-accent px-8 text-base font-bold text-white shadow-primary transition hover:-translate-y-0.5 hover:bg-accent-dark disabled:cursor-wait disabled:opacity-75 disabled:hover:translate-y-0"
            >
              {status === "pending" ? "Creating Account..." : status === "success" ? "Registered Successfully!" : "Register"}
            </button>
            <p className="mt-6 text-center text-sm text-zinc-500">
              Already a member? <a href="/login" className="font-semibold text-accent underline-offset-4 hover:underline">Log in</a>
            </p>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
