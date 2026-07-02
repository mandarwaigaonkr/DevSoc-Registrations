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
  onSnapshot,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";

import { reveal, stagger } from "@/lib/animations";
import { Plus, Trash2, CheckCircle, Loader2, LogOut, FileText, Search, Edit2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface Career {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  applicableYears: string[];
  description: string;
  responsibilities: string[];
  qualifications: string[];
  preferredSkills: string[];
  openings: number;
  deadline: string;
  weeklyCommitment: string;
  selectionProcess: string;
  customQuestions: string[];
  resumeRequired: boolean;
  status: string;
  createdAt?: any;
}

interface Application {
  id: string;
  userId: string;
  careerId: string;
  careerTitle: string;
  applicantDetails: {
    name: string;
    email: string;
    studentId?: string;
    course: string;
    year: string;
    phone: string;
    alternateEmail?: string;
  };
  professionalLinks: {
    resumeLink: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  customAnswers?: Record<string, string>;
  status: string;
  submittedAt?: any;
  adminNotes?: string;
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
const APPLICATION_STATUSES = ["Submitted", "Under Review", "Shortlisted", "Waitlisted", "Interview Scheduled", "Selected", "Rejected"];

const emptyForm = {
  title: "",
  department: "Technical",
  type: "Part-time",
  location: "Christ University, Bengaluru",
  applicableYears: [] as string[],
  description: "",
  responsibilities: "",
  qualifications: "",
  preferredSkills: "",
  openings: 1,
  deadline: "",
  weeklyCommitment: "",
  selectionProcess: "",
  customQuestions: "",
  resumeRequired: true,
  status: "Published",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [careers, setCareers] = useState<Career[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  
  const [tab, setTab] = useState<"positions" | "applications" | "requests">("positions");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const [loadingCareers, setLoadingCareers] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Pagination State for Applications
  const [lastAppDoc, setLastAppDoc] = useState<any>(null);
  const [hasMoreApps, setHasMoreApps] = useState(true);
  const [loadingMoreApps, setLoadingMoreApps] = useState(false);

  // Application Review State
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState("");

  /* ── Auth guard ── */
  useEffect(() => {
    let roleUnsub: (() => void) | null = null;

    const authUnsub = auth.onAuthStateChanged((user) => {
      if (!user) { router.replace("/"); return; }

      roleUnsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
        if (!snap.exists() || snap.data()?.role !== "admin") {
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
    getDocs(query(collection(db, "applications"), orderBy("submittedAt", "desc"), limit(50))).then((snap) => {
      const apps = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Application[];
      setApplications(apps);
      if (snap.docs.length > 0) {
        setLastAppDoc(snap.docs[snap.docs.length - 1]);
      }
      setHasMoreApps(snap.docs.length === 50);
      setLoadingApplications(false);
    });
    getDocs(query(collection(db, "admin_requests"), where("status", "==", "pending"))).then((snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminRequest[]);
      setLoadingRequests(false);
    });
  }, [isAdmin]);

  /* ── Load more applications ── */
  async function loadMoreApps() {
    if (!lastAppDoc || !hasMoreApps || loadingMoreApps) return;
    setLoadingMoreApps(true);
    try {
      const q = query(
        collection(db, "applications"),
        orderBy("submittedAt", "desc"),
        startAfter(lastAppDoc),
        limit(50)
      );
      const snap = await getDocs(q);
      const newApps = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Application[];
      
      setApplications((prev) => [...prev, ...newApps]);
      if (snap.docs.length > 0) {
        setLastAppDoc(snap.docs[snap.docs.length - 1]);
      }
      setHasMoreApps(snap.docs.length === 50);
    } catch (error) {
      console.error("Error loading more applications:", error);
    } finally {
      setLoadingMoreApps(false);
    }
  }

  /* ── Create or Edit position ── */
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || form.applicableYears.length === 0) {
      setSubmitMsg("Please fill in Role Name and select at least one applicable year.");
      return;
    }
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const splitLines = (str: string) => str.split("\n").map(s => s.trim()).filter(Boolean);

      const careerData = {
        title: form.title.trim(),
        department: form.department,
        type: form.type,
        location: form.location.trim(),
        applicableYears: form.applicableYears,
        description: form.description.trim(),
        responsibilities: typeof form.responsibilities === 'string' ? splitLines(form.responsibilities) : form.responsibilities,
        qualifications: typeof form.qualifications === 'string' ? splitLines(form.qualifications) : form.qualifications,
        preferredSkills: typeof form.preferredSkills === 'string' ? splitLines(form.preferredSkills) : form.preferredSkills,
        openings: Number(form.openings),
        deadline: form.deadline,
        weeklyCommitment: form.weeklyCommitment.trim(),
        selectionProcess: form.selectionProcess.trim(),
        customQuestions: typeof form.customQuestions === 'string' ? splitLines(form.customQuestions) : form.customQuestions,
        resumeRequired: form.resumeRequired,
        status: form.status,
      };

      if (editingId) {
        await updateDoc(doc(db, "careers", editingId), careerData);
        setCareers((prev) => prev.map((c) => (c.id === editingId ? { ...c, ...careerData } : c)));
        setSubmitMsg("Position updated successfully!");
      } else {
        const newCareer = { ...careerData, createdAt: serverTimestamp() };
        const ref = await addDoc(collection(db, "careers"), newCareer);
        setCareers((prev) => [{ id: ref.id, ...newCareer } as Career, ...prev]);
        setSubmitMsg("Position created successfully!");
      }
      
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setSubmitMsg(editingId ? "Failed to update position. Please try again." : "Failed to create position. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Edit position ── */
  function handleEdit(career: Career) {
    setForm({
      title: career.title || "",
      department: career.department || "Technical",
      type: career.type || "Part-time",
      location: career.location || "Christ University, Bengaluru",
      applicableYears: career.applicableYears || [],
      description: career.description || "",
      responsibilities: career.responsibilities ? career.responsibilities.join("\n") : "",
      qualifications: career.qualifications ? career.qualifications.join("\n") : "",
      preferredSkills: career.preferredSkills ? career.preferredSkills.join("\n") : "",
      openings: career.openings || 1,
      deadline: career.deadline || "",
      weeklyCommitment: career.weeklyCommitment || "",
      selectionProcess: career.selectionProcess || "",
      customQuestions: career.customQuestions ? career.customQuestions.join("\n") : "",
      resumeRequired: career.resumeRequired ?? true,
      status: career.status || "Published",
    });
    setEditingId(career.id);
    setShowForm(true);
    setSubmitMsg("");
  }

  /* ── Delete position ── */
  async function handleDelete(id: string) {
    if (!confirm("Delete this position? This cannot be undone.")) return;
    await deleteDoc(doc(db, "careers", id));
    setCareers((prev) => prev.filter((c) => c.id !== id));
  }

  /* ── Update Application Status ── */
  async function handleUpdateAppStatus(appId: string, newStatus: string) {
    try {
      await updateDoc(doc(db, "applications", appId), { status: newStatus });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      if (selectedApp?.id === appId) setSelectedApp({ ...selectedApp, status: newStatus });
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  }

  /* ── Export Shortlisted Applications ── */
  async function handleExportCSV() {
    try {
      // Query all Shortlisted applications
      const q = query(
        collection(db, "applications"),
        where("status", "==", "Shortlisted")
      );
      const snap = await getDocs(q);
      const exportApps = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Application[];

      if (exportApps.length === 0) {
        alert("No shortlisted applications found to export.");
        return;
      }

      const headers = ["Name", "Email", "Phone", "Student ID", "Department", "Year", "Role", "Status", "Resume", "GitHub", "LinkedIn", "Portfolio"];
      
      const escapeCsv = (str: string | undefined) => {
        if (!str) return '""';
        return `"${str.replace(/"/g, '""')}"`;
      };

      const rows = exportApps.map(app => [
        escapeCsv(app.applicantDetails.name),
        escapeCsv(app.applicantDetails.email),
        escapeCsv(app.applicantDetails.phone),
        escapeCsv(app.applicantDetails.studentId),
        escapeCsv(app.applicantDetails.course),
        escapeCsv(app.applicantDetails.year),
        escapeCsv(app.careerTitle),
        escapeCsv(app.status),
        escapeCsv(app.professionalLinks.resumeLink),
        escapeCsv(app.professionalLinks.github),
        escapeCsv(app.professionalLinks.linkedin),
        escapeCsv(app.professionalLinks.portfolio)
      ].join(','));

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shortlisted_candidates_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error(error);
      alert("Failed to export applications.");
    }
  }

  /* ── Save Admin Notes ── */
  async function handleSaveNotes() {
    if (!selectedApp) return;
    try {
      await updateDoc(doc(db, "applications", selectedApp.id), { adminNotes: adminNotesInput });
      setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, adminNotes: adminNotesInput } : a));
      setSelectedApp({ ...selectedApp, adminNotes: adminNotesInput });
      alert("Notes saved successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to save notes");
    }
  }

  /* ── Approve admin request ── */
  async function handleApprove(req: AdminRequest) {
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
      <div className="container-main max-w-6xl">
        {/* Header */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="mb-10">
          <motion.div variants={reveal} className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">Admin Dashboard</p>
              <h1 className="font-display text-4xl font-bold text-ink mt-1">Recruitment Management</h1>
            </div>
            <button
              onClick={() => auth.signOut().then(() => router.push("/"))}
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-ink transition mt-4 sm:mt-0"
            >
              <LogOut size={16} /> Sign out
            </button>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={reveal} className="mt-8 flex gap-1 rounded-2xl bg-white p-1 shadow-sm border border-zinc-100 w-fit overflow-x-auto max-w-full">
            {(["positions", "applications", "requests"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-xl px-5 py-2.5 text-sm font-semibold transition whitespace-nowrap",
                  tab === t
                    ? "bg-accent text-white shadow"
                    : "text-zinc-500 hover:text-ink"
                )}
              >
                {t === "positions" && "Open Positions"}
                {t === "applications" && "Applications"}
                {t === "requests" && `Pending Requests ${requests.length ? `(${requests.length})` : ""}`}
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
                  onClick={() => {
                    if (showForm) {
                      setShowForm(false);
                      setEditingId(null);
                      setForm(emptyForm);
                    } else {
                      setShowForm(true);
                      setEditingId(null);
                      setForm(emptyForm);
                    }
                  }}
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
                    <h2 className="font-display text-xl font-bold text-ink mb-6">{editingId ? "Edit Position" : "Create New Position"}</h2>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-ink">Role Title <span className="text-accent">*</span></label>
                        <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Frontend Developer" className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-ink">Department</label>
                        <select value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent">
                          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-ink">Status</label>
                        <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent">
                          <option>Published</option>
                          <option>Draft</option>
                          <option>Closed</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-ink">Number of Openings</label>
                        <input type="number" min="1" value={form.openings} onChange={(e) => setForm((p) => ({ ...p, openings: Number(e.target.value) }))} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-ink">Application Deadline</label>
                        <input type="date" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" />
                      </div>

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-sm font-semibold text-ink">Applicable Year(s) <span className="text-accent">*</span></span>
                        <div className="flex flex-wrap gap-2">
                          {YEARS.map((y) => (
                            <button type="button" key={y} onClick={() => toggleYear(y)} className={cn("rounded-pill px-4 py-2 text-xs font-semibold border transition", form.applicableYears.includes(y) ? "bg-accent text-white border-accent" : "bg-white text-zinc-600 border-zinc-200 hover:border-accent")}>
                              {y}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-ink">Type</label>
                        <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent">
                          {["Part-time", "Full-time", "Volunteer", "Internship"].map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-ink">Weekly Commitment</label>
                        <input value={form.weeklyCommitment} onChange={(e) => setForm((p) => ({ ...p, weeklyCommitment: e.target.value }))} placeholder="e.g. 10-12 hours/week" className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" />
                      </div>

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-ink">Detailed Job Description</label>
                        <textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" />
                      </div>

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-ink">Responsibilities <span className="text-zinc-400 font-normal">(one per line)</span></label>
                        <textarea rows={3} value={form.responsibilities} onChange={(e) => setForm((p) => ({ ...p, responsibilities: e.target.value }))} className="resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent font-mono" />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-ink">Requirements <span className="text-zinc-400 font-normal">(one per line)</span></label>
                        <textarea rows={3} value={form.qualifications} onChange={(e) => setForm((p) => ({ ...p, qualifications: e.target.value }))} className="resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent font-mono" />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-ink">Preferred Skills <span className="text-zinc-400 font-normal">(one per line)</span></label>
                        <textarea rows={3} value={form.preferredSkills} onChange={(e) => setForm((p) => ({ ...p, preferredSkills: e.target.value }))} className="resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent font-mono" />
                      </div>

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-ink">Selection Process <span className="text-zinc-400 font-normal">(optional)</span></label>
                        <textarea rows={2} value={form.selectionProcess} onChange={(e) => setForm((p) => ({ ...p, selectionProcess: e.target.value }))} placeholder="e.g. 1. Resume Shortlisting, 2. Technical Interview, 3. HR Round" className="resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" />
                      </div>

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-ink">Application Questions <span className="text-zinc-400 font-normal">(one question per line, optional)</span></label>
                        <textarea rows={3} value={form.customQuestions} onChange={(e) => setForm((p) => ({ ...p, customQuestions: e.target.value }))} placeholder="Why do you want to join this role?&#10;Describe your relevant experience." className="resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent font-mono" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={form.resumeRequired} onChange={(e) => setForm((p) => ({ ...p, resumeRequired: e.target.checked }))} className="h-4 w-4 rounded border-zinc-300 text-accent accent-accent" />
                          <span className="text-sm font-medium text-ink">Require resume link from applicants</span>
                        </label>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3">
                      <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="rounded-pill px-5 py-2.5 text-sm font-semibold text-zinc-500 hover:text-ink transition">Cancel</button>
                      <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-pill bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-accent/90 disabled:opacity-60">
                        {submitting && <Loader2 className="animate-spin" size={14} />} {submitting ? (editingId ? "Saving..." : "Creating...") : (editingId ? "Save Changes" : "Create Position")}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {loadingCareers ? (
                <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-zinc-300" size={28} /></div>
              ) : careers.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-zinc-200 bg-white p-12 text-center text-zinc-400">
                  <Plus size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No positions yet. Create one above.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {careers.map((career) => (
                    <motion.div key={career.id} variants={reveal} className="flex flex-col justify-between gap-4 rounded-[20px] border border-zinc-200 bg-white px-6 py-5 shadow-sm">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-display font-bold text-ink truncate">{career.title}</p>
                          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", career.status === "Published" ? "bg-green-50 text-green-700 border-green-200" : "bg-zinc-100 text-zinc-600 border-zinc-200")}>
                            {career.status}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-500">{career.department} · {career.openings} opening(s)</p>
                      </div>
                      <div className="flex justify-end pt-2 border-t border-zinc-100 gap-2">
                        <button onClick={() => handleEdit(career)} className="grid size-9 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-ink" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(career.id)} className="grid size-9 place-items-center rounded-full text-zinc-400 transition hover:bg-red-50 hover:text-red-500" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Applications Tab ── */}
          {tab === "applications" && (
            <motion.div key="applications" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {loadingApplications ? (
                <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-zinc-300" size={28} /></div>
              ) : applications.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-zinc-200 bg-white p-12 text-center text-zinc-400">
                  <FileText size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No applications received yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-zinc-500">Showing {applications.length} applications</p>
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-2 rounded-pill bg-white border border-zinc-200 px-4 py-2 text-sm font-bold text-ink shadow-sm transition hover:bg-zinc-50 hover:-translate-y-0.5"
                    >
                      <Download size={16} />
                      Export Shortlisted
                    </button>
                  </div>
                  <div className="overflow-x-auto rounded-[20px] border border-zinc-200 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-50 text-zinc-600">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Applicant</th>
                          <th className="px-6 py-4 font-semibold">Role</th>
                          <th className="px-6 py-4 font-semibold">Year</th>
                          <th className="px-6 py-4 font-semibold">Submitted</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {applications.map((app) => (
                          <tr 
                            key={app.id} 
                            onClick={() => { setSelectedApp(app); setAdminNotesInput(app.adminNotes || ""); }}
                            className="group cursor-pointer hover:bg-zinc-50/80 transition"
                          >
                            <td className="px-6 py-4 font-medium text-ink">{app.applicantDetails.name}</td>
                            <td className="px-6 py-4 text-zinc-600">{app.careerTitle}</td>
                            <td className="px-6 py-4 text-zinc-500">{app.applicantDetails.year}</td>
                            <td className="px-6 py-4 text-zinc-500">
                              {app.submittedAt?.toDate().toLocaleDateString() || "Unknown"}
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                app.status === "Selected" ? "bg-green-100 text-green-800" :
                                app.status === "Rejected" ? "bg-red-100 text-red-800" :
                                app.status === "Shortlisted" ? "bg-blue-100 text-blue-800" :
                                "bg-zinc-100 text-zinc-800"
                              )}>
                                {app.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {hasMoreApps && (
                    <div className="flex justify-center mt-4 mb-4">
                      <button 
                        onClick={loadMoreApps} 
                        disabled={loadingMoreApps}
                        className="rounded-pill bg-white border border-zinc-200 px-6 py-2 text-sm font-semibold text-zinc-600 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 flex items-center gap-2"
                      >
                        {loadingMoreApps && <Loader2 className="animate-spin" size={14} />}
                        {loadingMoreApps ? "Loading..." : "Load More"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Requests Tab ── */}
          {tab === "requests" && (
            <motion.div key="requests" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {loadingRequests ? (
                <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-zinc-300" size={28} /></div>
              ) : requests.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-zinc-200 bg-white p-12 text-center text-zinc-400">
                  <CheckCircle size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No pending admin requests.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {requests.map((req) => (
                    <div key={req.id} className="rounded-[20px] border border-zinc-200 bg-white px-6 py-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-ink">{req.email}</p>
                          <p className="text-sm text-zinc-500 mt-0.5">{req.designation} · {req.organization}</p>
                        </div>
                        <button onClick={() => handleApprove(req)} className="flex shrink-0 items-center gap-2 rounded-pill bg-green-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-green-700">
                          <CheckCircle size={14} /> Approve
                        </button>
                      </div>
                      {req.reason && <p className="mt-3 text-sm leading-relaxed text-zinc-600 border-t border-zinc-100 pt-3">{req.reason}</p>}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Application Review Dialog (Overlay) */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedApp(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-white p-6 sm:p-10 shadow-2xl"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink">{selectedApp.applicantDetails.name}</h2>
                  <p className="text-zinc-500">Applying for: <span className="font-semibold text-ink">{selectedApp.careerTitle}</span></p>
                </div>
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <select 
                    value={selectedApp.status}
                    onChange={(e) => handleUpdateAppStatus(selectedApp.id, e.target.value)}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-ink outline-none transition focus:border-accent"
                  >
                    {APPLICATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-3">Applicant Info</h3>
                    <ul className="space-y-2 text-sm text-zinc-700">
                      <li><strong>Email:</strong> {selectedApp.applicantDetails.email}</li>
                      <li><strong>Phone:</strong> {selectedApp.applicantDetails.phone}</li>
                      <li><strong>Student ID:</strong> {selectedApp.applicantDetails.studentId || "N/A"}</li>
                      <li><strong>Course:</strong> {selectedApp.applicantDetails.course}</li>
                      <li><strong>Year:</strong> {selectedApp.applicantDetails.year}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-3">Links</h3>
                    <ul className="space-y-2 text-sm">
                      {selectedApp.professionalLinks.resumeLink && (
                        <li><a href={selectedApp.professionalLinks.resumeLink} target="_blank" rel="noreferrer" className="text-accent hover:underline font-medium">View Resume ↗</a></li>
                      )}
                      {selectedApp.professionalLinks.github && (
                        <li><a href={selectedApp.professionalLinks.github} target="_blank" rel="noreferrer" className="text-accent hover:underline font-medium">GitHub ↗</a></li>
                      )}
                      {selectedApp.professionalLinks.linkedin && (
                        <li><a href={selectedApp.professionalLinks.linkedin} target="_blank" rel="noreferrer" className="text-accent hover:underline font-medium">LinkedIn ↗</a></li>
                      )}
                      {selectedApp.professionalLinks.portfolio && (
                        <li><a href={selectedApp.professionalLinks.portfolio} target="_blank" rel="noreferrer" className="text-accent hover:underline font-medium">Portfolio ↗</a></li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  {selectedApp.customAnswers && Object.keys(selectedApp.customAnswers).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-3">Application Answers</h3>
                      <div className="space-y-4">
                        {Object.entries(selectedApp.customAnswers).map(([q, a]) => (
                          <div key={q} className="rounded-xl bg-zinc-50 p-4 border border-zinc-100">
                            <p className="text-sm font-semibold text-ink mb-1">{q}</p>
                            <p className="text-sm text-zinc-600 whitespace-pre-wrap">{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-3">Admin Notes <span className="text-xs font-normal lowercase">(Private)</span></h3>
                    <textarea 
                      rows={4}
                      value={adminNotesInput}
                      onChange={(e) => setAdminNotesInput(e.target.value)}
                      placeholder="Add private notes about this candidate..."
                      className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-ink outline-none transition focus:border-accent"
                    />
                    <button 
                      onClick={handleSaveNotes}
                      className="mt-2 rounded-pill bg-zinc-800 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedApp(null)}
                className="mt-8 w-full rounded-pill border border-zinc-200 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
