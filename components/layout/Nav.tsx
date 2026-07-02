"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { navMount } from "@/lib/animations";
import { cn } from "@/lib/utils";
import RollingText from "@/components/ui/RollingText";
import { auth, db, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { User } from "firebase/auth";

function Logo() {
  return (
    <a href="/" className="group flex shrink-0 items-center gap-3 rounded-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
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
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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
      if (roleUnsub) { roleUnsub(); roleUnsub = null; }

      if (currentUser) {
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
    setOpen(false);
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

  const navLinks = [];
  if (user) navLinks.push({ label: "Open Positions", href: "/careers", requireAdmin: false });
  if (isAdmin) navLinks.push({ label: "Admin", href: "/admin/dashboard", requireAdmin: true });

  return (
    <motion.header
      variants={navMount}
      initial="hidden"
      animate="show"
      className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled ? "pt-3" : "pt-4")}
    >
      <div className="container-main flex items-center justify-between gap-4">
        <nav
          aria-label="Primary"
          className={cn(
            "flex min-h-[56px] flex-1 items-center gap-7 rounded-pill bg-white px-3 shadow-[0_1px_20px_rgba(24,24,27,0.04)] transition md:flex-none md:px-4 md:pr-9",
            scrolled ? "border border-zinc-200/70" : "border border-transparent"
          )}
        >
          <Logo />
          
          <div className="hidden items-center gap-9 text-sm font-semibold text-zinc-700 md:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn("group relative transition hover:text-ink active:text-accent", 
                    active ? (link.requireAdmin ? "text-accent" : "text-ink") : (link.requireAdmin ? "text-accent/80 hover:text-accent" : "text-zinc-700")
                  )}
                >
                  <RollingText>{link.label}</RollingText>
                  <span
                    className={cn(
                      "absolute -bottom-2 left-0 h-0.5 w-full origin-left rounded-full bg-accent transition-transform duration-200",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </a>
              );
            })}
          </div>

          <button
            className="ml-auto grid size-10 place-items-center rounded-pill bg-zinc-100 text-ink md:hidden"
            type="button"
            aria-label="Open navigation"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>
        </nav>

        <button
          onClick={handleAuthAction}
          disabled={loading}
          className="hidden md:flex group h-11 shrink-0 items-center justify-center rounded-pill bg-zinc-100 px-6 text-sm font-semibold text-ink shadow-sm transition hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <RollingText>
            {loading ? "Wait..." : user ? "My Profile" : "Login"}
          </RollingText>
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-zinc-950/30 transition md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          "fixed right-4 top-4 z-[70] w-[min(320px,calc(100vw-32px))] rounded-[28px] bg-white p-4 shadow-soft transition duration-300 md:hidden",
          open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <button
            className="grid size-10 place-items-center rounded-pill bg-zinc-100"
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-8 grid gap-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn("rounded-2xl px-4 py-4 font-display text-2xl font-bold transition active:text-accent", 
                link.requireAdmin ? "text-accent" : "text-ink"
              )}
              onClick={() => setOpen(false)}
            >
              <RollingText>{link.label}</RollingText>
            </a>
          ))}
          <button
            onClick={handleAuthAction}
            className="mt-4 flex w-full justify-center rounded-2xl bg-zinc-100 px-4 py-4 font-display text-2xl font-bold transition active:bg-zinc-200"
          >
            <RollingText>{loading ? "Wait..." : user ? "My Profile" : "Login"}</RollingText>
          </button>
        </div>
      </aside>
    </motion.header>
  );
}
