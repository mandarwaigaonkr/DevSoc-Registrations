"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { reveal } from "@/lib/animations";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { auth, db } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Status = "idle" | "pending" | "success" | "error";

export default function Login() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const router = useRouter();

  async function handleGoogleSignIn() {
    if (!/^\+91[\s-]?\d{10}$/.test(phone)) {
      setError("Please enter a valid contact number starting with +91.");
      return;
    }

    setStatus("pending");
    setError(null);

    const provider = new GoogleAuthProvider();
    // Force prompt to allow selecting different accounts if needed
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email || "";

      // Enforce Christ University domain
      if (!/^[^\s@]+@([a-zA-Z0-9-]+\.)*christuniversity\.in$/i.test(email)) {
        await signOut(auth);
        setError("Access denied. Please sign in using your official Christ University email ID.");
        setStatus("error");
        return;
      }

      // Check if user document exists in Firestore, if not create a minimal one
      const userDocRef = doc(db, "users", email.toLowerCase());
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName || "Unknown",
          email: email.toLowerCase(),
          contact: phone,
          createdAt: new Date().toISOString(),
          source: "google",
        });
      }

      setStatus("success");
      
      // Redirect to careers page after a short delay
      setTimeout(() => {
        router.push("/careers");
      }, 1000);
      
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/popup-closed-by-user") {
        setStatus("idle");
      } else {
        setError("An error occurred during sign in. Please try again.");
        setStatus("error");
      }
    }
  }

  return (
    <main className="min-h-screen pt-28">
      <section className="pb-12">
        <div className="container-main">
          <SectionHeader eyebrow="Welcome Back" title="Login to DevSoc" />

          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="mx-auto mt-12 max-w-[400px] rounded-[28px] bg-white p-8 text-center shadow-[0_4px_48px_rgba(0,0,0,0.07)] md:p-10"
          >
            {error && (
              <div className="mb-6 rounded-xl bg-accent/10 p-4 text-sm font-medium text-accent">
                {error}
              </div>
            )}

            <label className="mb-6 block text-left text-sm font-medium text-zinc-800" htmlFor="phone">
              Contact number
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 min-h-14 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-5 text-base text-ink outline-none transition focus:border-accent"
              />
            </label>

            <button
              onClick={handleGoogleSignIn}
              disabled={status === "pending" || status === "success"}
              className="flex min-h-14 w-full items-center justify-center gap-3 rounded-pill border border-zinc-200 bg-white px-6 text-base font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-wait disabled:opacity-75"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.81 15.74 17.58V20.35H19.3C21.38 18.43 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.3 20.35L15.74 17.58C14.75 18.25 13.48 18.66 12 18.66C9.13 18.66 6.7 16.73 5.84 14.13H2.17V16.98C4.03 20.67 7.73 23 12 23Z" fill="#34A853"/>
                <path d="M5.84 14.13C5.62 13.47 5.5 12.76 5.5 12C5.5 11.24 5.62 10.53 5.84 9.87V7.02H2.17C1.41 8.54 1 10.22 1 12C1 13.78 1.41 15.46 2.17 16.98L5.84 14.13Z" fill="#FBBC05"/>
                <path d="M12 5.34C13.62 5.34 15.06 5.9 16.2 6.99L19.38 3.8C17.45 2.01 14.96 1 12 1C7.73 1 4.03 3.33 2.17 7.02L5.84 9.87C6.7 7.27 9.13 5.34 12 5.34Z" fill="#EA4335"/>
              </svg>
              {status === "pending"
                ? "Signing in..."
                : status === "success"
                  ? "Signed in"
                  : "Sign in with Google"}
            </button>
            <p className="mt-6 text-sm text-zinc-500">
              Only @christuniversity.in emails are allowed.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
