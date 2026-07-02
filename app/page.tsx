"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import RollingText from "@/components/ui/RollingText";
import { Code2, PenTool, LayoutTemplate, MessageSquare, Briefcase, Zap } from "lucide-react";
import type { User } from "firebase/auth";

/* Minimal mount-only animation — no scroll observers */
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: (d: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const, delay: d },
  }),
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setCurrentUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogin = useCallback(async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.email?.includes("christuniversity.in")) {
        alert("Please login using your Christ University email ID.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      setTimeout(() => {
        if (userSnap.exists() && userSnap.data().onboardingCompleted) {
          router.push("/careers");
        } else {
          router.push("/onboarding");
        }
      }, 800);
    } catch (error: any) {
      console.error(error);
      if (error.code !== "auth/popup-closed-by-user") {
        alert("Authentication failed. Please try again.");
      }
      setLoading(false);
    }
  }, [router]);

  const authReady = currentUser !== undefined;

  return (
    <main>
      {/* Hero Section — mount animation only, no scroll observers */}
      <section className="container-main pt-24 md:pt-32 pb-20">
        <div className="grid items-center gap-12 pt-4 lg:grid-cols-[auto_1fr] lg:gap-20">
          <motion.div
            variants={fadeIn}
            custom={0}
            initial="hidden"
            animate="show"
            className="mx-auto hidden md:flex w-fit flex-col items-center gap-5 rounded-[32px] bg-white p-6 shadow-[0_2px_24px_rgba(0,0,0,0.06)] md:p-8 lg:mx-0"
          >
            <div className="grid size-[140px] place-items-center rounded-2xl bg-zinc-50 p-4 md:size-[180px]">
              <Image src="/devs-logo.svg" alt="Developer Society logo" width={180} height={180} className="h-full w-full object-contain" priority />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-display text-lg font-bold text-ink md:text-xl">Dev<span className="text-[#A8872E]">·</span>Soc</span>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-600">Careers</span>
            </div>
          </motion.div>

          <div className="text-center lg:text-left">
            <motion.h1 variants={fadeIn} custom={0.1} initial="hidden" animate="show" className="font-display text-[clamp(3.2rem,11vw,8rem)] font-bold leading-[0.95] tracking-tight text-ink">
              Join the Society.
              <br />
              <span className="text-[clamp(1.5rem,6vw,3.5rem)] font-medium text-zinc-400">Build your future.</span>
            </motion.h1>
            <motion.p variants={fadeIn} custom={0.2} initial="hidden" animate="show" className="mt-6 text-lg text-zinc-600 max-w-2xl mx-auto lg:mx-0">
              We are a collective of developers, designers, and innovators at Christ University building real-world software and pushing boundaries.
            </motion.p>
            <motion.div variants={fadeIn} custom={0.3} initial="hidden" animate="show" className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:mt-10 lg:justify-start" style={{ minHeight: 56 }}>
              {authReady && (
                currentUser ? (
                  <>
                    <Button onClick={() => router.push("/careers")}>
                      <RollingText>View Open Positions</RollingText>
                    </Button>
                    <Button variant="secondary" onClick={() => router.push("/profile")} icon={false}>
                      My Profile
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleLogin} disabled={loading}>
                    <RollingText>{loading ? "Connecting..." : "Login with Google"}</RollingText>
                  </Button>
                )
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Join Us — no framer-motion, pure CSS */}
      <section className="bg-white py-24 border-y border-zinc-100">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-4xl font-bold text-ink">Why Join DevSoc?</h2>
            <p className="mt-4 text-zinc-600">Accelerate your career with hands-on experience, mentorship, and a thriving community of builders.</p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { icon: <Zap className="text-accent" size={32} />, title: "Real-world Projects", desc: "Stop building to-do apps. Build software that actually gets used by thousands of students on campus." },
              { icon: <MessageSquare className="text-accent" size={32} />, title: "Mentorship", desc: "Learn from seniors who have cracked top internships and mastered industry-standard tech stacks." },
              { icon: <Briefcase className="text-accent" size={32} />, title: "Career Growth", desc: "Boost your resume with proven experience. Our alumni work at top tech companies worldwide." }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-8 rounded-[32px] bg-zinc-50 transition-shadow duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
                <div className="grid size-16 place-items-center rounded-2xl bg-white shadow-sm mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-ink mb-3">{feature.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Teams — no framer-motion */}
      <section className="py-24">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-4xl font-bold text-ink">Open Departments</h2>
            <p className="mt-4 text-zinc-600">Find your fit. We are currently recruiting for the following teams.</p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { icon: <Code2 size={24} />, name: "Technical", roles: "Frontend, Backend, DevOps" },
              { icon: <PenTool size={24} />, name: "Design", roles: "UI/UX, Graphic Design" },
              { icon: <LayoutTemplate size={24} />, name: "Management", roles: "Product, Events, Social Media" }
            ].map((team, i) => (
              <div key={i} className="group relative flex flex-col items-start p-8 rounded-[32px] bg-white border border-zinc-200 transition-all duration-300 hover:border-accent hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="grid size-12 place-items-center rounded-xl bg-zinc-100 text-zinc-600 transition group-hover:bg-accent/10 group-hover:text-accent mb-6">
                  {team.icon}
                </div>
                <h3 className="font-display text-2xl font-bold text-ink mb-1">{team.name}</h3>
                <p className="text-zinc-500 text-sm">{team.roles}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Process — no framer-motion */}
      <section className="bg-ink py-24 text-white">
        <div className="container-main text-center">
          <h2 className="font-display text-4xl font-bold">The Process</h2>
          <div className="mt-16 grid gap-12 md:grid-cols-3 relative">
            <div className="hidden md:block absolute top-6 left-1/6 right-1/6 h-px bg-white/20" />
            {[
              { step: "01", title: "Apply", desc: "Login with your Christ ID and fill out your profile details." },
              { step: "02", title: "Interview", desc: "Shortlisted candidates will be invited for a technical or design interview." },
              { step: "03", title: "Onboarding", desc: "Welcome to the team! Start contributing to real projects." }
            ].map((process, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className="grid size-12 place-items-center rounded-full bg-accent text-lg font-bold mb-6">
                  {process.step}
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{process.title}</h3>
                <p className="text-zinc-400 text-sm max-w-[240px]">{process.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

