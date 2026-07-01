"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { navMount } from "@/lib/animations";
import { cn } from "@/lib/utils";
import RollingText from "@/components/ui/RollingText";
import { auth, db, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

function Logo() {
  return (
    <a href="/" className="group flex items-center gap-3 rounded-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
      <span className="relative grid size-11 place-items-center">
        <img src="/devs-logo-static.svg" alt="DevS Logo" className="size-11" />
      </span>
      <span className="font-display text-sm font-bold tracking-normal text-ink">
        <RollingText>Developer Society</RollingText>
      </span>
    </a>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
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
            "flex min-h-[56px] items-center gap-7 rounded-pill bg-white px-3 shadow-[0_1px_20px_rgba(24,24,27,0.04)] transition md:px-4 md:pr-4",
            scrolled ? "border border-zinc-200/70" : "border border-transparent"
          )}
        >
          <Logo />
          
          <button
            onClick={handleAuthAction}
            disabled={loading}
            className="group flex h-10 items-center justify-center rounded-pill bg-zinc-100 px-5 text-sm font-semibold text-ink transition hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
