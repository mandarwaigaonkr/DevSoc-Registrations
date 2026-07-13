"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Loader2, ArrowLeft, Building2, MapPin, Clock, Users, CalendarDays, CheckCircle2 } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";

interface Career {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  applicableYears: string[];
  description: string;
  responsibilities?: string[];
  qualifications?: string[];
  preferredSkills?: string[];
  openings?: number;
  deadline?: string;
  weeklyCommitment?: string;
  selectionProcess?: string;
}

const fetchCareer = async (id: string) => {
  const docRef = doc(db, "careers", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Career;
  }
  throw new Error("Career not found");
};

const checkApplicationStatus = async ([_, userId, careerId]: [string, string, string]) => {
  const q = query(
    collection(db, "applications"),
    where("userId", "==", userId),
    where("careerId", "==", careerId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
};

export default function CareerDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [userLoading, setUserLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setUserLoading(false);
    });
    return () => unsub();
  }, []);

  const { data: career, error: careerError, isLoading: loading } = useSWR(
    id ? id : null,
    fetchCareer
  );

  useEffect(() => {
    if (careerError) {
      router.replace("/careers");
    }
  }, [careerError, router]);

  const { data: hasAppliedResponse, isLoading: checkingApplication } = useSWR(
    user && id ? ["app_status", user.uid, id] : null,
    checkApplicationStatus
  );

  const hasApplied = hasAppliedResponse || false;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (!career) return null;

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-28 pb-24">
      <div className="container-main max-w-4xl">
        <Link href="/careers" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-ink mb-8 transition group">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to open positions
        </Link>

        {/* Hero Section */}
        <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm p-8 md:p-12 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl font-bold text-ink mb-4">{career.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-600">
                <div className="flex items-center gap-1.5"><Building2 size={16} className="text-zinc-400" /> DevSoc, {career.department}</div>
                <div className="flex items-center gap-1.5"><MapPin size={16} className="text-zinc-400" /> {career.location}</div>
                <div className="flex items-center gap-1.5"><Clock size={16} className="text-zinc-400" /> {career.type}</div>
              </div>
            </div>
            
            <div className="shrink-0 flex flex-col gap-3">
              {checkingApplication || userLoading ? (
                <div className="h-12 w-32 bg-zinc-100 animate-pulse rounded-pill" />
              ) : hasApplied ? (
                <button disabled className="flex items-center justify-center gap-2 rounded-pill bg-green-50 border border-green-200 px-8 py-3 text-sm font-bold text-green-700 shadow-sm">
                  <CheckCircle2 size={18} /> Applied
                </button>
              ) : (
                <Link 
                  href={`/careers/${career.id}/apply`}
                  className="inline-flex items-center justify-center rounded-pill bg-accent px-10 py-3 text-sm font-bold !text-white shadow-sm transition hover:bg-accent/90 hover:-translate-y-0.5"
                >
                  Apply Now
                </Link>
              )}
              {career.deadline && (
                <p className="text-xs text-center text-zinc-500">
                  Deadline: {new Date(career.deadline).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="grid gap-8 md:grid-cols-[1fr_280px]">
          <div className="space-y-12">
            
            <section>
              <h2 className="font-display text-2xl font-bold text-ink mb-4">Role Overview</h2>
              <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">{career.description}</p>
            </section>

            {career.responsibilities && career.responsibilities.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold text-ink mb-4">What you'll do</h2>
                <ul className="space-y-3">
                  {career.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-700">
                      <div className="mt-1.5 size-1.5 rounded-full bg-accent shrink-0" />
                      <span className="leading-relaxed">{resp}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {career.qualifications && career.qualifications.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold text-ink mb-4">Minimum Requirements</h2>
                <ul className="space-y-3">
                  {career.qualifications.map((qual, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-700">
                      <div className="mt-1.5 size-1.5 rounded-full bg-accent shrink-0" />
                      <span className="leading-relaxed">{qual}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {career.preferredSkills && career.preferredSkills.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold text-ink mb-4">Preferred Skills</h2>
                <ul className="space-y-3">
                  {career.preferredSkills.map((skill, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-700">
                      <div className="mt-1.5 size-1.5 rounded-full bg-zinc-300 shrink-0" />
                      <span className="leading-relaxed">{skill}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {career.selectionProcess && (
              <section>
                <h2 className="font-display text-2xl font-bold text-ink mb-4">Selection Process</h2>
                <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">{career.selectionProcess}</p>
              </section>
            )}

          </div>

          {/* Right Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-ink mb-4">Role Summary</h3>
              <ul className="space-y-4">
                {/* Removed openings rendering */}
                {career.weeklyCommitment && (
                  <li className="flex items-start gap-3">
                    <Clock size={18} className="text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-ink">Commitment</p>
                      <p className="text-sm text-zinc-600">{career.weeklyCommitment}</p>
                    </div>
                  </li>
                )}
                {career.applicableYears && career.applicableYears.length > 0 && (
                  <li className="flex items-start gap-3">
                    <CalendarDays size={18} className="text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-ink">Eligible Years</p>
                      <p className="text-sm text-zinc-600">{career.applicableYears.join(", ")}</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
