"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2, ArrowLeft, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ApplyPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [career, setCareer] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  
  const [step, setStep] = useState<"form" | "review" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [phone, setPhone] = useState("");
  const [alternateEmail, setAlternateEmail] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.replace("/login");
        return;
      }

      try {
        // 1. Fetch user data
        const userDoc = await getDoc(doc(db, "users", u.uid));
        const uData = userDoc.exists() ? userDoc.data() : { name: u.displayName, email: u.email, department: "", year: "", regNo: "" };
        setUserData({ uid: u.uid, ...uData });

        // 2. Fetch career data
        const careerDoc = await getDoc(doc(db, "careers", id));
        if (!careerDoc.exists() || careerDoc.data().status !== "Published") {
          router.replace("/careers");
          return;
        }
        setCareer({ id: careerDoc.id, ...careerDoc.data() });

        // 3. Check if already applied
        const q = query(collection(db, "applications"), where("userId", "==", u.uid), where("careerId", "==", id));
        const snap = await getDocs(q);
        if (!snap.empty) setHasApplied(true);
        
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [id, router]);

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (career?.resumeRequired && !resumeLink) {
      alert("Resume link is required.");
      return;
    }
    setStep("review");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await addDoc(collection(db, "applications"), {
        userId: userData.uid,
        careerId: id,
        careerTitle: career.title,
        applicantDetails: {
          name: userData.name || "",
          email: userData.email || "",
          studentId: userData.regNo || "",
          department: userData.department || "",
          year: userData.year || "",
          phone: phone || "",
          alternateEmail: alternateEmail || ""
        },
        professionalLinks: {
          resumeLink: resumeLink || "",
          github: github || "",
          linkedin: linkedin || "",
          portfolio: portfolio || ""
        },
        customAnswers: customAnswers || {},
        status: "Submitted",
        submittedAt: serverTimestamp(),
      });
      setStep("success");
    } catch (error) {
      console.error(error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]"><Loader2 className="animate-spin text-accent" size={32} /></div>;
  }

  if (hasApplied || step === "success") {
    return (
      <main className="min-h-screen bg-[#f8f9fa] pt-28 pb-24 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-[32px] bg-white p-8 text-center shadow-sm border border-zinc-200">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-50 text-green-600">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink mb-2">Application Submitted</h1>
          <p className="text-sm text-zinc-500 mb-8">You have successfully applied for <strong>{career?.title}</strong>. We will review your application and get back to you soon.</p>
          <Link href="/profile" className="inline-block w-full rounded-pill bg-accent px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-accent/90 transition">
            View My Applications
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-28 pb-24">
      <div className="container-main max-w-3xl">
        <Link href={`/careers/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-ink mb-8 transition group">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to Role
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent"><FileText size={18} /></div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Apply for {career?.title}</h1>
            <p className="text-sm text-zinc-500">Please fill out the form below to complete your application.</p>
          </div>
        </div>

        {step === "form" && (
          <form onSubmit={handleReview} className="rounded-[32px] bg-white p-6 sm:p-10 shadow-sm border border-zinc-200">
            
            <section className="mb-10">
              <h2 className="font-semibold text-lg text-ink mb-6 border-b border-zinc-100 pb-3">Personal Details</h2>
              <div className="grid gap-5 md:grid-cols-2 text-sm">
                <div className="space-y-1">
                  <p className="text-zinc-500 font-medium">Full Name</p>
                  <p className="font-semibold text-ink">{userData?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 font-medium">Email</p>
                  <p className="font-semibold text-ink">{userData?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 font-medium">Department</p>
                  <p className="font-semibold text-ink">{userData?.department || "Not specified"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 font-medium">Year</p>
                  <p className="font-semibold text-ink">{userData?.year || "Not specified"}</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-4 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                These details are auto-populated from your profile. If you need to change them, please update your profile settings.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-semibold text-lg text-ink mb-6 border-b border-zinc-100 pb-3">Contact Information</h2>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-ink">Phone Number <span className="text-accent">*</span></label>
                  <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-ink">Alternate Email <span className="text-zinc-400 font-normal">(optional)</span></label>
                  <input type="email" value={alternateEmail} onChange={(e) => setAlternateEmail(e.target.value)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" />
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="font-semibold text-lg text-ink mb-6 border-b border-zinc-100 pb-3">Professional Links</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {career?.resumeRequired && (
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-semibold text-ink">Google Drive Resume Link <span className="text-accent">*</span></label>
                    <input required type="url" value={resumeLink} onChange={(e) => setResumeLink(e.target.value)} placeholder="https://drive.google.com/file/d/..." className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" />
                    <p className="text-xs text-orange-600 font-medium">Please ensure your Google Drive link is accessible to "Anyone with the link".</p>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-ink">LinkedIn URL <span className="text-zinc-400 font-normal">(optional)</span></label>
                  <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-ink">GitHub URL <span className="text-zinc-400 font-normal">(optional)</span></label>
                  <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-ink">Portfolio Website <span className="text-zinc-400 font-normal">(optional)</span></label>
                  <input type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" />
                </div>
              </div>
            </section>

            {career?.customQuestions && career.customQuestions.length > 0 && (
              <section className="mb-10">
                <h2 className="font-semibold text-lg text-ink mb-6 border-b border-zinc-100 pb-3">Application Questions</h2>
                <div className="grid gap-6">
                  {career.customQuestions.map((question: string, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-ink">{question} <span className="text-accent">*</span></label>
                      <textarea 
                        required 
                        rows={3} 
                        value={customAnswers[question] || ""} 
                        onChange={(e) => setCustomAnswers({...customAnswers, [question]: e.target.value})} 
                        className="resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" 
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="flex justify-end pt-4">
              <button type="submit" className="flex items-center gap-2 rounded-pill bg-zinc-900 px-8 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-black transition">
                Review Application <ChevronRight size={16} />
              </button>
            </div>
          </form>
        )}

        {step === "review" && (
          <div className="rounded-[32px] bg-white p-6 sm:p-10 shadow-sm border border-zinc-200">
            <h2 className="font-display text-2xl font-bold text-ink mb-8">Review Application</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-4">Contact Info</h3>
                <div className="grid gap-4 md:grid-cols-2 text-sm bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                  <div><span className="text-zinc-500 font-medium block">Phone</span><span className="font-semibold">{phone}</span></div>
                  {alternateEmail && <div><span className="text-zinc-500 font-medium block">Alt Email</span><span className="font-semibold">{alternateEmail}</span></div>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-4">Links</h3>
                <div className="grid gap-4 md:grid-cols-2 text-sm bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                  {career?.resumeRequired && <div><span className="text-zinc-500 font-medium block">Resume</span><a href={resumeLink} target="_blank" className="font-semibold text-accent hover:underline truncate block">{resumeLink}</a></div>}
                  {linkedin && <div><span className="text-zinc-500 font-medium block">LinkedIn</span><a href={linkedin} target="_blank" className="font-semibold text-accent hover:underline truncate block">{linkedin}</a></div>}
                  {github && <div><span className="text-zinc-500 font-medium block">GitHub</span><a href={github} target="_blank" className="font-semibold text-accent hover:underline truncate block">{github}</a></div>}
                  {portfolio && <div><span className="text-zinc-500 font-medium block">Portfolio</span><a href={portfolio} target="_blank" className="font-semibold text-accent hover:underline truncate block">{portfolio}</a></div>}
                </div>
              </div>

              {career?.customQuestions && career.customQuestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-4">Answers</h3>
                  <div className="space-y-4">
                    {career.customQuestions.map((q: string) => (
                      <div key={q} className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                        <p className="text-sm font-semibold text-ink mb-2">{q}</p>
                        <p className="text-sm text-zinc-600 whitespace-pre-wrap">{customAnswers[q]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-zinc-100 pt-6">
              <button type="button" onClick={() => setStep("form")} className="w-full sm:w-auto rounded-pill px-6 py-3 text-sm font-semibold text-zinc-600 hover:text-ink transition">
                Edit Information
              </button>
              <button onClick={handleSubmit} disabled={submitting} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-pill bg-accent px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-accent/90 transition disabled:opacity-60">
                {submitting && <Loader2 className="animate-spin" size={16} />}
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
