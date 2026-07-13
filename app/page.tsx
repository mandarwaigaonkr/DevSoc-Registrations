"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Code2, PenTool, LayoutTemplate, MessageSquare, Briefcase, Zap } from "lucide-react";
import type { User } from "firebase/auth";
import { reveal, stagger } from "@/lib/animations";
import ArrowButton from "@/components/ui/ArrowButton";
import { SectionHeader } from "@/components/ui/SectionHeader";

const processSteps = [
  ["01", "Apply", "Login with your Christ ID and fill out your profile details to view open positions."],
  ["02", "Interview", "Shortlisted candidates will be invited for a technical, design, or management interview."],
  ["03", "Onboarding", "Welcome to the team! Start contributing to real software used by the campus."]
];

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
      {/* Hero Section matching DevSoc Website */}
      <section className="container-main pt-28 md:pt-32 pb-16 md:pb-24">
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid items-start gap-12 pt-4 lg:grid-cols-[auto_1fr] lg:gap-20">
          
          {/* Floating brand card — left */}
          <motion.div
            variants={reveal}
            className="hidden md:flex mx-auto w-fit flex-col items-center gap-5 rounded-[32px] bg-white p-6 shadow-[0_4px_48px_rgba(0,0,0,0.07)] md:p-8 lg:mx-0 lg:mt-2"
          >
            <div className="grid size-[140px] place-items-center rounded-2xl bg-zinc-50 p-4 md:size-[180px]">
              <Image src="/devs-logo.svg" alt="Developer Society logo" width={180} height={180} className="h-full w-full object-contain" priority />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-display text-lg font-bold text-ink md:text-xl">Dev<span className="text-[#A8872E]">·</span>Soc</span>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-600">Campus Recruitment</span>
            </div>
          </motion.div>

          {/* Title + buttons — right */}
          <div className="text-center lg:text-left">
            <motion.h1 variants={reveal} className="font-display text-[clamp(3.8rem,13vw,9.5rem)] font-bold leading-[0.95] tracking-tight text-ink">
              Join the Society
              <br />
              <span className="text-[clamp(1.5rem,6vw,4rem)] font-medium text-zinc-400">Build the future.</span>
            </motion.h1>
            <motion.p variants={reveal} className="mt-6 text-[clamp(1rem,3vw,1.25rem)] text-zinc-600 max-w-2xl mx-auto lg:mx-0">
              We are a collective of developers, designers, and innovators at Christ University building real-world software and pushing boundaries.
            </motion.p>
            <motion.div variants={reveal} className="mt-8 flex flex-col items-center justify-center lg:items-start lg:justify-start gap-5 lg:mt-10" style={{ minHeight: 56 }}>
              <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                {authReady && (
                  currentUser ? (
                    <>
                      <ArrowButton onClick={() => router.push("/careers")} label="Campus Recruitment" />
                      <ArrowButton onClick={() => router.push("/profile")} label="My Profile" variant="ghost" />
                    </>
                  ) : (
                    <ArrowButton onClick={handleLogin} label={loading ? "Authenticating..." : "Login with Christ ID"} />
                  )
                )}
              </div>
              
              <a href="https://dev-society-website.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-zinc-500 hover:text-ink transition flex items-center gap-1.5 mt-2">
                Explore DevSoc Main Website <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Why Join Us */}
      <section className="bg-zinc-50/50 py-16 md:py-20 border-y border-zinc-100">
        <div className="container-main">
          <SectionHeader eyebrow="Benefits" title="Why Join DevSoc?" />

          <motion.div variants={stagger} initial="hidden" animate="show" viewport={{ once: true, amount: 0.15 }} className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { icon: <Zap className="text-accent" size={32} />, title: "Real-world Projects", desc: "Stop building to-do apps. Build software that actually gets used by thousands of students on campus." },
              { icon: <MessageSquare className="text-accent" size={32} />, title: "Mentorship", desc: "Learn from seniors who have cracked top internships and mastered industry-standard tech stacks." },
              { icon: <Briefcase className="text-accent" size={32} />, title: "Career Growth", desc: "Boost your resume with proven experience. Our alumni work at top tech companies worldwide." }
            ].map((feature, i) => (
              <motion.div key={i} variants={reveal} className="flex flex-col items-center text-center p-8 md:p-10 rounded-[32px] bg-white border border-zinc-100 shadow-sm transition-all duration-300 hover:border-accent hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="grid size-16 place-items-center rounded-2xl bg-zinc-50 mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-ink mb-3">{feature.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Teams */}
      <section className="py-16 md:py-20">
        <div className="container-main">
          <SectionHeader eyebrow="Departments" title="Find your fit" />

          <motion.div variants={stagger} initial="hidden" animate="show" viewport={{ once: true, amount: 0.15 }} className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { icon: <Code2 size={24} />, name: "Technical", roles: "Frontend, Backend, DevOps" },
              { icon: <PenTool size={24} />, name: "Design", roles: "UI/UX, Graphic Design" },
              { icon: <LayoutTemplate size={24} />, name: "Management", roles: "Product, Events, Social Media" }
            ].map((team, i) => (
              <motion.div key={i} variants={reveal} className="group relative flex flex-col items-start p-8 md:p-10 rounded-[32px] bg-zinc-50/50 border border-transparent transition-all duration-300 hover:bg-white hover:border-accent hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="grid size-12 place-items-center rounded-xl bg-zinc-100 text-zinc-600 transition group-hover:bg-accent/10 group-hover:text-accent mb-6">
                  {team.icon}
                </div>
                <h3 className="font-display text-2xl font-bold text-ink mb-2">{team.name}</h3>
                <p className="text-zinc-500 text-sm">{team.roles}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The Process - matching DevSoc Website design */}
      <section className="py-16 md:py-24">
        <div className="container-main grid gap-12 lg:grid-cols-[0.8fr_1fr] lg:gap-24">
          <SectionHeader eyebrow="Process" title="How to get recruited" className="lg:sticky lg:top-32 lg:self-start lg:text-left" />
          <motion.div variants={stagger} initial="hidden" animate="show" viewport={{ once: true, amount: 0.15 }} className="grid gap-5">
            {processSteps.map(([num, title, description]) => (
              <motion.article key={title} variants={reveal} className="rounded-[28px] p-8 md:p-10 bg-white border border-zinc-100 shadow-sm transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <span className="inline-flex min-h-10 flex-wrap items-center gap-2 rounded-pill bg-accent px-4 font-display text-base font-bold text-white shadow-primary md:min-h-11 md:gap-4 md:px-6 md:text-lg">
                  {num}—
                  {title}
                </span>
                <h3 className="sr-only">{title}</h3>
                <p className="mt-7 text-xl md:text-2xl leading-relaxed text-ink">{description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
