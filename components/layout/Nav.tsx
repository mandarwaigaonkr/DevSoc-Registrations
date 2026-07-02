"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { navMount } from "@/lib/animations";
import { cn } from "@/lib/utils";
import RollingText from "@/components/ui/RollingText";
import { auth, db, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";

function Logo() {
  return (
    <a href="/" className="group flex shrink-0 items-center gap-2 sm:gap-3 rounded-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
      <span className="relative grid size-10 sm:size-11 place-items-center">
        <img src="/devs-logo-static.svg" alt="DevS Logo" className="size-10 sm:size-11" />
      </span>
      <span className="font-display text-xs sm:text-sm font-bold tracking-normal text-ink hidden min-[360px]:block">
        <RollingText>Developer Society</RollingText>
      </span>
    </a>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let roleUnsub: (() => void) | null = null;

    const authUnsub = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      // Tear down any previous role listener
      if (roleUnsub) { roleUnsub(); roleUnsub = null; }

      if (currentUser) {
        // Real-time listener — picks up role changes without re-login
        roleUnsub = onSnapshot(doc(db, "users", currentUser.uid), (snap) => {
          setIsAdmin(snap.exists() && snap.data()?.role === "admin");
        });
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      authUnsub();
      if (roleUnsub) roleUnsub();
    };
  }, []);

  async function handleAuthAction() {
    if (user) {
      router.push("/profile");
      return;
    }

    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const newUser = result.user;
      
      if (!newUser.email?.includes("christuniversity.in")) {
         alert("Please login using your Christ University email ID.");
         await auth.signOut();
         setLoading(false);
         return;
      }
  
      const userDocRef = doc(db, "users", newUser.uid);
      const userSnap = await getDoc(userDocRef);
      
      if (userSnap.exists() && userSnap.data().onboardingCompleted) {
         router.push("/profile");
      } else {
         router.push("/onboarding");
      }
    } catch (error: any) {
      console.error(error);
      if (error.code !== "auth/popup-closed-by-user") {
        alert("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.header
      variants={navMount}
      initial="hidden"
      animate="show"
      className={cn("sticky top-0 z-50 transition-all duration-300", scrolled ? "pt-3" : "pt-4")}
    >
      <div className="container-main flex items-center justify-center gap-4">
        <nav
          aria-label="Primary"
          className={cn(
            "flex min-h-[56px] max-w-full items-center gap-2 sm:gap-4 rounded-pill bg-white px-2 py-1 shadow-[0_1px_20px_rgba(24,24,27,0.04)] transition sm:px-4 sm:pr-4",
            scrolled ? "border border-zinc-200/70" : "border border-transparent"
          )}
        >
          <Logo />

          {user && (
            <a
              href="/careers"
              className="hidden sm:flex h-9 sm:h-10 items-center justify-center rounded-pill px-4 text-xs sm:text-sm font-semibold text-zinc-600 transition hover:text-ink"
            >
              Open Positions
            </a>
          )}

          {isAdmin && (
            <a
              href="/admin/dashboard"
              className="hidden sm:flex h-9 sm:h-10 items-center justify-center rounded-pill px-4 text-xs sm:text-sm font-semibold text-accent transition hover:text-accent/80"
            >
              Admin
            </a>
          )}

          <button
            onClick={handleAuthAction}
            disabled={loading}
            className="group flex h-9 sm:h-10 shrink-0 items-center justify-center rounded-pill bg-zinc-100 px-4 sm:px-5 text-xs sm:text-sm font-semibold text-ink transition hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <RollingText>
              {loading ? "Wait..." : user ? "My Profile" : "Login"}
            </RollingText>
          </button>
        </nav>
      </div>
    </motion.header>
  );
}

