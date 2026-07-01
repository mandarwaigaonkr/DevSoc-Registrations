"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/Button";

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    regNo: "",
    year: "1st",
    classSection: "",
    department: "",
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        uid: user.uid,
        regNo: formData.regNo,
        year: formData.year,
        classSection: formData.classSection,
        department: formData.department,
        onboardingCompleted: true,
        createdAt: new Date(),
      }, { merge: true });

      router.push("/profile");
    } catch (error) {
      console.error(error);
      alert("Error saving profile. Please try again.");
      setSubmitting(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center font-display">Loading...</div>;
  }

  return (
    <main className="container-main min-h-[calc(100vh-100px)] flex items-center justify-center section-pad">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg rounded-[32px] bg-white p-8 shadow-[0_4px_48px_rgba(0,0,0,0.07)] md:p-12"
      >
        <h1 className="font-display text-3xl font-bold text-ink">Complete your profile</h1>
        <p className="mt-2 text-sm text-zinc-500">Welcome, {user?.displayName}. Tell us a bit about your studies at Christ University.</p>
        
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="regNo" className="text-sm font-semibold text-ink">Registration Number</label>
            <input
              id="regNo"
              name="regNo"
              type="text"
              required
              placeholder="e.g. 2460476"
              value={formData.regNo}
              onChange={handleChange}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="year" className="text-sm font-semibold text-ink">Year of Study</label>
            <select
              id="year"
              name="year"
              required
              value={formData.year}
              onChange={handleChange}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            >
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
              <option value="5th">5th Year</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="classSection" className="text-sm font-semibold text-ink">Class and Section</label>
            <input
              id="classSection"
              name="classSection"
              type="text"
              required
              placeholder="e.g. 5BTCS A"
              value={formData.classSection}
              onChange={handleChange}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="department" className="text-sm font-semibold text-ink">Department</label>
            <input
              id="department"
              name="department"
              type="text"
              required
              placeholder="e.g. CSE"
              value={formData.department}
              onChange={handleChange}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <Button type="submit" disabled={submitting} className="mt-4 w-full">
            {submitting ? "Saving Profile..." : "Complete Onboarding"}
          </Button>
        </form>
      </motion.div>
    </main>
  );
}
