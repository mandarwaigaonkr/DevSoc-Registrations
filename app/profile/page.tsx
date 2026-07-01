"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { reveal, stagger } from "@/lib/animations";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().onboardingCompleted) {
          setProfile(docSnap.data());
        } else {
          router.push("/onboarding");
        }
      } else {
        router.push("/");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  async function handleLogout() {
    await auth.signOut();
    router.push("/");
  }

  if (loading) {
    return <div className="flex min-h-[calc(100vh-100px)] items-center justify-center font-display">Loading profile...</div>;
  }

  return (
    <main className="container-main min-h-[calc(100vh-100px)] flex items-center justify-center section-pad">
      <motion.div
        variants={stagger} initial="hidden" animate="show"
        className="w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-[0_4px_48px_rgba(0,0,0,0.07)] md:p-12"
      >
        <motion.div variants={reveal} className="flex flex-col items-start gap-2 border-b border-zinc-100 pb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-2xl font-bold text-accent">
            {profile?.name?.charAt(0) || "U"}
          </div>
          <h1 className="font-display text-4xl font-bold text-ink mt-2">{profile?.name}</h1>
          <p className="text-zinc-500 font-mono text-sm">{profile?.email}</p>
        </motion.div>
        
        <motion.div variants={reveal} className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Registration Number</span>
            <span className="font-medium text-ink">{profile?.regNo}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Year of Study</span>
            <span className="font-medium text-ink">{profile?.year} Year</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Class & Section</span>
            <span className="font-medium text-ink">{profile?.classSection}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Department</span>
            <span className="font-medium text-ink">{profile?.department}</span>
          </div>
        </motion.div>

        <motion.div variants={reveal} className="mt-12 flex justify-end">
          <Button variant="secondary" onClick={handleLogout} icon={false}>
            Sign Out
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
}
