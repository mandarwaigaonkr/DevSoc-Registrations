"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { reveal, stagger } from "@/lib/animations";
import { Loader2, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [tab, setTab] = useState<"details" | "applications">("details");
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().onboardingCompleted) {
            setProfile(docSnap.data());
          } else {
            router.push("/onboarding");
            return;
          }

          // Fetch applications
          const q = query(collection(db, "applications"), where("userId", "==", currentUser.uid));
          const appSnap = await getDocs(q);
          const appsData = appSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          appsData.sort((a: any, b: any) => (b.submittedAt?.toMillis() || 0) - (a.submittedAt?.toMillis() || 0));
          setApplications(appsData);

        } catch (error) {
          console.error(error);
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

  async function handleWithdraw(appId: string) {
    if (!confirm("Are you sure you want to withdraw this application? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "applications", appId));
      setApplications(prev => prev.filter(app => app.id !== appId));
    } catch (error) {
      console.error("Failed to withdraw", error);
      alert("Failed to withdraw application.");
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]"><Loader2 className="animate-spin text-accent" size={32} /></div>;
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-28 pb-24">
      <div className="container-main max-w-4xl">
        <motion.div variants={stagger} initial="hidden" animate="show" className="rounded-[32px] bg-white p-8 shadow-sm border border-zinc-200 md:p-12">
          
          <motion.div variants={reveal} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 pb-8">
            <div className="flex flex-col items-start gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-2xl font-bold text-accent">
                {profile?.name?.charAt(0) || "U"}
              </div>
              <h1 className="font-display text-4xl font-bold text-ink mt-2">{profile?.name}</h1>
              <p className="text-zinc-500 font-mono text-sm">{profile?.email}</p>
            </div>
            
          </motion.div>

          <motion.div variants={reveal} className="mt-8 flex gap-1 rounded-2xl bg-zinc-50 p-1 border border-zinc-100 w-fit">
            <button onClick={() => setTab("details")} className={cn("rounded-xl px-6 py-2.5 text-sm font-semibold transition", tab === "details" ? "bg-white text-ink shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-ink")}>
              Profile Details
            </button>
            <button onClick={() => setTab("applications")} className={cn("rounded-xl px-6 py-2.5 text-sm font-semibold transition flex items-center gap-2", tab === "applications" ? "bg-white text-ink shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-ink")}>
              My Applications
              {applications.length > 0 && (
                <span className={cn("flex size-5 items-center justify-center rounded-full text-xs font-bold", tab === "applications" ? "bg-accent text-white" : "bg-zinc-200 text-zinc-600")}>
                  {applications.length}
                </span>
              )}
            </button>
          </motion.div>

          <AnimatePresence mode="wait">
            {tab === "details" && (
              <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-10 grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-1 bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Registration Number</span>
                  <span className="font-medium text-ink">{profile?.regNo || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-1 bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Year of Study</span>
                  <span className="font-medium text-ink">{profile?.year} Year</span>
                </div>
                <div className="flex flex-col gap-1 bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Class & Section</span>
                  <span className="font-medium text-ink">{profile?.classSection || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-1 bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Department</span>
                  <span className="font-medium text-ink">{profile?.department || "N/A"}</span>
                </div>
              </motion.div>
            )}

            {tab === "applications" && (
              <motion.div key="applications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-10">
                {applications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-12 text-center">
                    <FileText size={32} className="mb-4 text-zinc-300" />
                    <p className="font-medium text-zinc-500">You haven't applied for any positions yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {applications.map((app) => {
                      const isExpanded = expandedApp === app.id;
                      return (
                        <div key={app.id} className="rounded-[24px] border border-zinc-200 bg-white overflow-hidden shadow-sm transition hover:border-zinc-300">
                          <div 
                            onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                            className="flex cursor-pointer items-center justify-between gap-4 p-6 hover:bg-zinc-50 transition"
                          >
                            <div>
                              <h3 className="font-display font-bold text-lg text-ink">{app.careerTitle}</h3>
                              <p className="text-sm text-zinc-500 mt-1">Applied on {app.submittedAt?.toDate().toLocaleDateString() || "Unknown date"}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={cn(
                                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border",
                                app.status === "Selected" ? "bg-green-50 text-green-700 border-green-200" :
                                app.status === "Rejected" ? "bg-red-50 text-red-700 border-red-200" :
                                app.status === "Shortlisted" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-zinc-100 text-zinc-700 border-zinc-200"
                              )}>
                                {app.status}
                              </span>
                              {isExpanded ? <ChevronUp size={20} className="text-zinc-400" /> : <ChevronDown size={20} className="text-zinc-400" />}
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-zinc-100 bg-zinc-50/50">
                                <div className="p-6 grid gap-6 md:grid-cols-2 text-sm">
                                  
                                  <div>
                                    <p className="font-semibold text-zinc-400 uppercase tracking-widest text-xs mb-3">Professional Links</p>
                                    <ul className="space-y-2">
                                      {app.professionalLinks?.resumeLink && <li><a href={app.professionalLinks.resumeLink} target="_blank" className="font-medium text-accent hover:underline">Resume / CV ↗</a></li>}
                                      {app.professionalLinks?.github && <li><a href={app.professionalLinks.github} target="_blank" className="font-medium text-accent hover:underline">GitHub ↗</a></li>}
                                      {app.professionalLinks?.linkedin && <li><a href={app.professionalLinks.linkedin} target="_blank" className="font-medium text-accent hover:underline">LinkedIn ↗</a></li>}
                                      {app.professionalLinks?.portfolio && <li><a href={app.professionalLinks.portfolio} target="_blank" className="font-medium text-accent hover:underline">Portfolio ↗</a></li>}
                                    </ul>
                                  </div>

                                  {app.customAnswers && Object.keys(app.customAnswers).length > 0 && (
                                    <div className="md:col-span-2">
                                      <p className="font-semibold text-zinc-400 uppercase tracking-widest text-xs mb-3">Your Answers</p>
                                      <div className="space-y-4">
                                        {Object.entries(app.customAnswers).map(([q, a]) => (
                                          <div key={q} className="bg-white p-4 rounded-xl border border-zinc-200">
                                            <p className="font-medium text-ink mb-1">{q}</p>
                                            <p className="text-zinc-600 whitespace-pre-wrap">{(a as string)}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                    
                                  <div className="md:col-span-2 pt-4 border-t border-zinc-100 flex justify-end">
                                    <button
                                      onClick={() => handleWithdraw(app.id)}
                                      className="rounded-pill border border-red-200 bg-red-50/30 px-5 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                                    >
                                      Withdraw Application
                                    </button>
                                  </div>
                                  
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div variants={reveal} className="mt-12 flex justify-end border-t border-zinc-100 pt-8">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-pill border border-red-200 bg-red-50/30 px-6 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 hover:border-red-300 hover:text-red-700"
            >
              Sign Out
            </button>
          </motion.div>

        </motion.div>
      </div>
    </main>
  );
}
