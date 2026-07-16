import React from 'react';
import { Terminal, Users, QrCode, ArrowRight, Code2 } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flyer | DevSoc',
};

export default function FlyerPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 0; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
          .min-h-screen { min-height: 100vh !important; }
        }
      `}} />
      <div className="min-h-screen bg-zinc-200 print:bg-transparent flex items-center justify-center py-12 print:py-0 font-sans">
        {/* The Flyer Container - A4 Aspect Ratio (800x1131) */}
        <div 
          className="relative overflow-hidden bg-page text-ink flex flex-col shadow-2xl print:shadow-none"
          style={{ 
            width: '800px', 
            height: '1131px',
            backgroundImage: 'radial-gradient(circle at 50% -10%, rgba(255,255,255,0.8), transparent 40rem), radial-gradient(rgb(var(--zinc-300) / 0.45) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 20px 20px'
          }}
        >
          {/* Top blur overlay */}
          <div className="pointer-events-none absolute inset-0 z-0 h-[122px]" style={{
            background: 'linear-gradient(to bottom, rgb(var(--color-page)) 0%, rgb(var(--color-page) / 0.85) 34%, transparent 100%)'
          }}></div>

          {/* Gentle yellowish bottom gradient overlay */}
          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-[350px] z-0" style={{
            background: 'linear-gradient(to top, rgba(253, 246, 227, 0.5) 0%, transparent 100%)'
          }}></div>


          {/* --- HEADER --- */}
          <header className="relative z-10 px-14 pt-12 pb-4 flex items-center justify-between h-[90px] shrink-0">
          </header>

          {/* --- HERO SECTION --- */}
          <div className="relative z-10 px-14 pt-4 pb-4 shrink-0">
            <h2 className="font-display text-2xl font-bold text-zinc-800 mb-2 tracking-tight">
              Developer's Society of Christ University
            </h2>
            <h1 className="font-display text-[5.5rem] font-bold leading-[0.95] tracking-tight text-zinc-950 mb-4 relative">
              Engineer <br/>
              <span className="text-zinc-400">The Future.</span>
              
            </h1>
            <p className="text-[1.35rem] text-zinc-600 max-w-2xl leading-relaxed mt-2">
              Not just another college club. We are a collective of engineers building real-world software and pushing boundaries.
            </p>
          </div>

          {/* --- TWO COLUMN CONTENT --- */}
          <div className="relative z-10 px-14 py-4 flex gap-10 flex-1 mb-2">
            
            {/* LEFT COLUMN - QR CODE & TIMELINE */}
            <div className="w-[42%] flex flex-col h-full justify-start pt-2">
              {/* Box for QR (Needed for contrast) */}
              <div className="rounded-2xl bg-white p-6 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center aspect-square text-center relative w-[85%] mx-auto transform -rotate-2 hover:rotate-0 transition-transform">
                <img src="/qr.png" alt="QR Code" className="w-[130px] h-[130px] mb-2 object-contain mix-blend-multiply" />
                <h4 className="font-display font-bold text-xl text-zinc-950 mb-1">Scan to Apply</h4>
              </div>
              
              {/* Borderless Typography for Timeline */}
              <div className="w-[85%] mx-auto mt-10">
                <div className="w-8 h-1 bg-accent mb-4"></div>
                <h4 className="font-display font-bold text-[1.1rem] text-zinc-500 uppercase tracking-widest mb-1">Timeline</h4>
                <p className="font-display font-bold text-[2rem] text-zinc-950 leading-none">Recruitment<br/>2026</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"></span> 
                  Limited Positions
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - LISTS */}
            <div className="w-[58%] flex flex-col gap-8 h-full justify-start">
              
              {/* Borderless text directly on the page background */}
              <div className="relative w-full pb-4">
                <div className="absolute top-0 right-0 text-zinc-100 opacity-60 pointer-events-none">
                   <Code2 size={100} strokeWidth={1.5} className="-mr-4 -mt-4 rotate-12" />
                </div>
                <div className="flex items-center gap-4 mb-5 relative z-10">
                  <div className="grid size-12 place-items-center text-accent shrink-0">
                    <Terminal size={32} />
                  </div>
                  <h3 className="font-display text-[2rem] font-bold text-zinc-950 tracking-tight leading-none pt-1">What You'll Do</h3>
                </div>
                <ul className="space-y-4 relative z-10 pl-2 border-l border-zinc-300 ml-5">
                  {[
                    "Build production-ready software",
                    "Collaborate on real engineering projects",
                    "Learn modern development practices",
                    "Ship products used across campus",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-[1.15rem] text-zinc-700 font-medium leading-tight pl-3 relative">
                      <span className="absolute -left-[1.32rem] top-1.5 w-2 h-2 rounded-full bg-accent border-[3px] border-page box-content"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Borderless styling for Looking For */}
              <div className="relative w-full mt-auto pb-4">
                <div className="flex items-center gap-4 mb-5 relative z-10">
                  <div className="grid size-12 place-items-center text-accent shrink-0">
                    <Users size={32} />
                  </div>
                  <h3 className="font-display text-[2rem] font-bold text-zinc-950 tracking-tight leading-none pt-1">Looking For</h3>
                </div>
                <ul className="space-y-4 relative z-10 pl-2 border-l border-zinc-300 ml-5">
                  {[
                    "Passionate aspiring engineers",
                    "Relentless problem solvers",
                    "Creative coders & builders",
                    "Obsessed with tech & impact"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-[1.15rem] text-zinc-700 font-medium leading-tight pl-3 relative">
                      <span className="absolute -left-[1.32rem] top-1.5 w-2 h-2 rounded-full bg-accent border-[3px] border-page box-content"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* --- BOTTOM DECORATIONS & FOOTER --- */}
          <div className="mt-auto flex flex-col relative z-10 w-full shrink-0">
            
            {/* Aesthetic Marquee Strip */}
            <div className="w-[120%] -ml-[10%] bg-accent/5 border-y border-accent/10 py-3 mb-6 transform -rotate-1 flex overflow-hidden whitespace-nowrap">
              <div className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-accent/60 flex items-center gap-6 select-none">
                 {[...Array(10)].map((_, i) => (
                   <React.Fragment key={i}>
                     <span>DESIGN</span><span className="w-1.5 h-1.5 rounded-sm bg-accent/40 rotate-45"></span>
                     <span>ENGINEER</span><span className="w-1.5 h-1.5 rounded-sm bg-accent/40 rotate-45"></span>
                     <span>DEPLOY</span><span className="w-1.5 h-1.5 rounded-sm bg-accent/40 rotate-45"></span>
                     <span>SCALE</span><span className="w-1.5 h-1.5 rounded-sm bg-accent/40 rotate-45"></span>
                   </React.Fragment>
                 ))}
              </div>
            </div>

            {/* Abstract Tech Metrics / Details row */}
            <div className="px-14 flex justify-between items-end mb-5 text-zinc-400 font-mono text-[10px] uppercase tracking-widest font-bold">
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-400">Sys_Status</span>
                  <span className="text-secondary flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div> Online</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-400">Version</span>
                  <span className="text-zinc-500">v2.0.26</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-zinc-500">
                Apply Now <ArrowRight size={14} className="text-accent" />
              </div>
            </div>

            {/* Footer Bar */}
            <div className="px-14 pt-2 pb-10 flex justify-between items-center w-full">
              <span className="font-display font-bold text-zinc-950 text-xl">Developer's Society</span>
              <span className="text-zinc-500 font-bold tracking-[0.2em] uppercase text-xs">Ideas Into Impact.</span>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
