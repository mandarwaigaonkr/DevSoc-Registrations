"use client";

import useSWR from "swr";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { reveal, stagger } from "@/lib/animations";
import { Bookmark, Building2, MapPin, Share2, Briefcase, Clock, Users } from "lucide-react";

interface Career {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  description: string;
  qualifications?: string[];
  status?: string;
  openings?: number;
  deadline?: string;
  weeklyCommitment?: string;
}

const fetchCareers = async () => {
  const querySnapshot = await getDocs(query(collection(db, "careers"), where("status", "==", "Published")));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Career[];
};

export default function CareersPage() {
  const { data: careers, isLoading: loading } = useSWR("published_careers", fetchCareers);

  const filteredCareers = careers || [];

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-28 pb-24">
      <div className="container-main max-w-7xl">
        
        {/* Top Bar matching Google Careers style */}
        <div className="mb-6 flex flex-col gap-4 border-b border-zinc-200 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="text-xl font-medium text-zinc-700">
            {loading ? (
              <span className="text-zinc-400">Loading open positions...</span>
            ) : (
              <>
                <span className="text-[#137333] font-semibold">{filteredCareers.length}</span> positions available
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1">
          
          {/* Main Content - Job Listings */}
          <div className="flex flex-col gap-6">

            <AnimatePresence mode="popLayout">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="flex h-40 items-center justify-center"
                >
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-[#1a73e8]" />
                </motion.div>
              ) : filteredCareers.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-12 text-center"
                >
                  <Briefcase size={40} className="mb-4 text-zinc-300" />
                  <h3 className="text-xl font-semibold text-zinc-800">No positions found</h3>
                  <p className="mt-2 text-zinc-500">Try adjusting your search or check back later.</p>
                </motion.div>
              ) : (
                <motion.div key="list" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} className="grid gap-6">
                  {filteredCareers.map((career) => (
                    <motion.div 
                      key={career.id} 
                      variants={reveal}
                      className="group flex flex-col gap-6 rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm transition duration-300 hover:border-accent hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-8"
                    >
                      {/* Job Header */}
                      <div className="flex flex-col-reverse items-start justify-between gap-4 sm:flex-row">
                        <Link href={`/careers/${career.id}`} className="hover:underline">
                          <h2 className="font-display text-2xl font-bold text-zinc-900 md:text-3xl">
                            {career.title}
                          </h2>
                        </Link>
                        <div className="flex shrink-0 items-center gap-2 text-zinc-500 self-end sm:self-auto">
                          <button className="grid size-10 place-items-center rounded-full transition hover:bg-accent/10 hover:text-accent">
                            <Share2 size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Job Meta Info */}
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm font-semibold text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={16} className="text-zinc-400" />
                          DevSoc, {career.department || "General"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={16} className="text-zinc-400" />
                          {career.location || "Christ University"}
                        </div>
                        {/* Removed openings count rendering */}
                        {career.deadline && (
                          <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
                            <Clock size={14} />
                            Deadline: {new Date(career.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Description Snippet */}
                      <p className="text-zinc-600 line-clamp-2 leading-relaxed">
                        {career.description}
                      </p>

                      {/* Divider */}
                      <div className="h-px w-full bg-zinc-100" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                            {career.type || "Part-time"}
                          </span>
                          {career.weeklyCommitment && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {career.weeklyCommitment}
                            </span>
                          )}
                        </div>
                        <Link 
                          href={`/careers/${career.id}`}
                          className="rounded-pill bg-accent px-6 py-2.5 text-sm font-bold !text-white shadow-sm transition hover:bg-accent/90 hover:-translate-y-0.5"
                        >
                          View Details
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </main>
  );
}
