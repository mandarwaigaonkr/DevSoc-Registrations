"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

import { reveal, stagger } from "@/lib/animations";
import { Plus, Trash2, CheckCircle, ChevronDown, ChevronUp, Loader2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface Career {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  applicableYears: string[];
  description: string;
  qualifications: string[];
  resumeRequired: boolean;
  createdAt?: any;
}

interface AdminRequest {
  id: string;
  email: string;
  designation: string;
  organization: string;
  reason: string;
  status: string;
  uid?: string;
}

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];
const DEPARTMENTS = ["Technical", "Design", "Management", "Content", "Operations"];

const emptyForm = {
  title: "",
  department: "Technical",
  type: "Part-time",
  location: "Christ University, Bengaluru",
  applicableYears: [] as string[],
  description: "",
  qualifications: "",
  resumeRequired: true,
};

export default function AdminDashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [careers, setCareers] = useState<Career[]>([]);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [tab, setTab] = useState<"positions" | "requests">("positions");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const [loadingCareers, setLoadingCareers] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  /* ── Auth guard ── */
  useEffect(() => {
    let roleUnsub: (() => void) | null = null;

    const authUnsub = auth.onAuthStateChanged((user) => {
      if (!user) { router.replace("/"); return; }

      // Real-time role check — catches the case where role was just set
      roleUnsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
        if (!snap.exists() || snap.data()?.role !== "admin") {
          // Only redirect if we've already waited for Firestore to respond
          // (snap.metadata.fromCache === false means it's a fresh server read)
          if (!snap.metadata.hasPendingWrites && !snap.metadata.fromCache) {
            router.replace("/");
          }
          return;
        }
        setIsAdmin(true);
        setAuthChecked(true);
      });
    });

    return () => {
      authUnsub();
      if (roleUnsub) roleUnsub();
    };
  }, [router]);


  /* ── Load data ── */
  useEffect(() => {
    if (!isAdmin) return;
    getDocs(collection(db, "careers")).then((snap) => {
      setCareers(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Career[]);
      setLoadingCareers(false);
    });
    getDocs(query(collection(db, "admin_requests"), where("status", "==", "pending"))).then((snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminRequest[]);
      setLoadingRequests(false);
    });
  }, [isAdmin]);

  /* ── Create position ── */
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || form.applicableYears.length === 0) {
      setSubmitMsg("Please fill in Role Name and select at least one applicable year.");
      return;
    }
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const qualList = form.qualifications
        .split("\n")
        .map((q) => q.trim())
        .filter(Boolean);
      const ref = await addDoc(collection(db, "careers"), {
        title: form.title.trim(),
        department: form.department,
        type: form.type,
        location: form.location.trim(),
        applicableYears: form.applicableYears,
        description: form.description.trim(),
        qualifications: qualList,
        resumeRequired: form.resumeRequired,
        createdAt: serverTimestamp(),
      });
      setCareers((prev) => [
        ...prev,
        {
          id: ref.id,
          title: form.title.trim(),
          department: form.department,
          type: form.type,
          location: form.location.trim(),
          applicableYears: form.applicableYears,
          description: form.description.trim(),
          qualifications: qualList,
          resumeRequired: form.resumeRequired,
        },
      ]);
      setForm(emptyForm);
      setShowForm(false);
      setSubmitMsg("Position created successfully!");
    } catch (err) {
      console.error(err);
      setSubmitMsg("Failed to create position. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Delete position ── */
  async function handleDelete(id: string) {
    if (!confirm("Delete this position? This cannot be undone.")) return;
    await deleteDoc(doc(db, "careers", id));
    setCareers((prev) => prev.filter((c) => c.id !== id));
  }

  /* ── Approve admin request ── */
  async function handleApprove(req: AdminRequest) {
    // Find user by email to get uid
    const usersSnap = await getDocs(
      query(collection(db, "users"), where("email", "==", req.email.toLowerCase()))
    );
    if (usersSnap.empty) {
      alert("User not found in Firestore. They need to log in first.");
      return;
    }
    const userDoc = usersSnap.docs[0];
    await updateDoc(doc(db, "users", userDoc.id), { role: "admin" });
    await updateDoc(doc(db, "admin_requests", req.id), { status: "approved" });
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
  }

  function toggleYear(year: string) {
    setForm((prev) => ({
      ...prev,
      applicableYears: prev.applicableYears.includes(year)
        ? prev.applicableYears.filter((y) => y !== year)
        : [...prev.applicableYears, year],
    }));
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-28 pb-24">
      <div className="container-main max-w-5xl">

        {/* Header */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="mb-10">
          <motion.div variants={reveal} className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">Admin Dashboard</p>
              <h1 className="font-display text-4xl font-bold text-ink mt-1">Manage Positions</h1>
            </div>
            <button
              onClick={() => auth.signOut().then(() => router.push("/"))}
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-ink transition mt-4 sm:mt-0"
            >
              <LogOut size={16} /> Sign out
            </button>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={reveal} className="mt-8 flex gap-1 rounded-2xl bg-white p-1 shadow-sm border border-zinc-100 w-fit">
            {(["positions", "requests"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-xl px-5 py-2.5 text-sm font-semibold transition",
                  tab === t
                    ? "bg-accent text-white shadow"
                    : "text-zinc-500 hover:text-ink"
                )}
              >
                {t === "positions" ? "Open Positions" : `Pending Requests ${requests.length ? `(${requests.length})` : ""}`}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Positions Tab ── */}
        <AnimatePresence mode="wait">
          {tab === "positions" && (
            <motion.div key="positions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Create form toggle */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500">{careers.length} position{careers.length !== 1 ? "s" : ""} listed</p>
                <button
                  onClick={() => setShowForm((v) => !v)}
                  className="flex items-center gap-2 rounded-pill bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-accent/90"
                >
                  <Plus size={16} />
                  {showForm ? "Cancel" : "New Position"}
                </button>
              </div>

              {submitMsg && (
                <div className={cn("mb-6 rounded-xl p-4 text-sm font-medium", submitMsg.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600")}>
                  {submitMsg}
                </div>
              )}

              {/* Create form */}
              <AnimatePresence>
                {showForm && (
                  <motion.form
                    onSubmit={handleCreate}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-8 rounded-[28px] bg-white p-6 sm:p-8 shadow-sm border border-zinc-100"
                  >
                    <h2 className="font-display text-xl font-bold text-ink mb-6">Create New Position</h2>

                    <div className="grid gap-5 md:grid-cols-2">
                      {/* Role Name */}
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-ink" htmlFor="title">Role Name <span className="text-accent">*</span></label>
                        <input
                          id="title"
                          required
                          value={form.title}
                          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                          placeholder="e.g. Frontend Developer"
                          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                        />
                      </div>

                      {/* Department */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-ink" htmlFor="dept">Department</label>
                        <select
                          id="dept"
                          value={form.department}
                          onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                        >
                          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                      </div>

                      {/* Type */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-ink" htmlFor="type">Type</label>
                        <select
                          id="type"
                          value={form.type}
                          onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                        >
                          {["Part-time", "Full-time", "Volunteer", "Internship"].map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>

                      {/* Applicable Years */}
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-sm font-semibold text-ink">Applicable Year(s) <span className="text-accent">*</span></span>
                        <div className="flex flex-wrap gap-2">
                          {YEARS.map((y) => (
                            <button
                              type="button"
                              key={y}
                              onClick={() => toggleYear(y)}
                              className={cn(
                                "rounded-pill px-4 py-2 text-xs font-semibold border transition",
                                form.applicableYears.includes(y)
                                  ? "bg-accent text-white border-accent"
                                  : "bg-white text-zinc-600 border-zinc-200 hover:border-accent"
                              )}
                            >
                              {y}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-ink" htmlFor="loc">Location</label>
                        <input
                          id="loc"
                          value={form.location}
                          onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                        />
                      </div>

                      {/* What the role looks like */}
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-ink" htmlFor="desc">What does this role look like?</label>
                        <textarea
                          id="desc"
                          rows={4}
                          value={form.description}
                          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Describe the day-to-day responsibilities, team size, tools used, what the candidate will be building or working on..."
                          className="resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                        />
                      </div>

                      {/* Preferred Qualifications */}
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-ink" htmlFor="quals">
                          Preferred Qualifications
                          <span className="ml-2 font-normal text-zinc-400">(one per line)</span>
                        </label>
                        <textarea
                          id="quals"
                          rows={4}
                          value={form.qualifications}
                          onChange={(e) => setForm((p) => ({ ...p, qualifications: e.target.value }))}
                          placeholder={"Experience with React or Next.js\nFamiliarity with Git and version control\nStrong communication skills"}
                          className="resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent font-mono"
                        />
                      </div>

                      {/* Resume required toggle */}
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.resumeRequired}
                            onChange={(e) => setForm((p) => ({ ...p, resumeRequired: e.target.checked }))}
                            className="h-4 w-4 rounded border-zinc-300 text-accent accent-accent"
                          />
                          <span className="text-sm font-medium text-ink">Require resume link from applicants</span>
                        </label>
                        {form.resumeRequired && (
                          <p className="mt-1.5 ml-7 text-xs text-zinc-400">
                            Applicants will be asked: "Upload your resume on Google Drive and share the link."
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3">
                      <button type="button" onClick={() => setShowForm(false)} className="rounded-pill px-5 py-2.5 text-sm font-semibold text-zinc-500 hover:text-ink transition">
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 rounded-pill bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-accent/90 disabled:opacity-60"
                      >
                        {submitting && <Loader2 className="animate-spin" size={14} />}
                        {submitting ? "Creating..." : "Create Position"}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Existing positions list */}
              {loadingCareers ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="animate-spin text-zinc-300" size={28} />
                </div>
              ) : careers.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-zinc-200 bg-white p-12 text-center text-zinc-400">
                  <Plus size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No positions yet. Create one above.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {careers.map((career) => (
                    <motion.div
                      key={career.id}
                      variants={reveal}
                      className="flex items-center justify-between gap-4 rounded-[20px] border border-zinc-200 bg-white px-6 py-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <p className="font-display font-bold text-ink truncate">{career.title}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="rounded-pill bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">{career.department}</span>
                          {career.applicableYears?.map((y) => (
                            <span key={y} className="rounded-pill bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">{y}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(career.id)}
                        className="shrink-0 grid size-9 place-items-center rounded-full text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Requests Tab ── */}
          {tab === "requests" && (
            <motion.div key="requests" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {loadingRequests ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="animate-spin text-zinc-300" size={28} />
                </div>
              ) : requests.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-zinc-200 bg-white p-12 text-center text-zinc-400">
                  <CheckCircle size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No pending admin requests.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-[20px] border border-zinc-200 bg-white px-6 py-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-ink">{req.email}</p>
                          <p className="text-sm text-zinc-500 mt-0.5">{req.designation} · {req.organization}</p>
                        </div>
                        <button
                          onClick={() => handleApprove(req)}
                          className="flex shrink-0 items-center gap-2 rounded-pill bg-green-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-green-700"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                      </div>
                      {req.reason && (
                        <p className="mt-3 text-sm leading-relaxed text-zinc-600 border-t border-zinc-100 pt-3">{req.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
