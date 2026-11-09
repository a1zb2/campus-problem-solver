import { useEffect, useState } from "react";
import { Bot, CircleCheckBig, MapPin, Sparkles, Truck } from "lucide-react";
import { categoryById } from "../lib/complaints";

const EXAMPLES = [
  {
    text: "Bathroom on the 3rd floor has had no water since yesterday morning.",
    loc: "Block 3 · Room 312",
    cat: "Bathroom & Hygiene",
    conf: 0.96,
    dept: "Maintenance Department",
    exec: "Mr. Rajesh Kumar",
    id: "7F3A91C2",
  },
  {
    text: "Mess food was stale again tonight and there were insects in the dal.",
    loc: "Block 1 · Room 108",
    cat: "Mess & Food Quality",
    conf: 0.93,
    dept: "Hostel & Mess Committee",
    exec: "Mr. Anil Verma",
    id: "B21E04DD",
  },
  {
    text: "Attendance shows wrong on the portal and my exam form is blocked.",
    loc: "Block 2 · Room 017",
    cat: "Academic Issues",
    conf: 0.91,
    dept: "Academic Office",
    exec: "Dr. Priya Nair",
    id: "C90F5A13",
  },
  {
    text: "The fan in my room stopped working and it's unbearably hot.",
    loc: "Block 5 · Room 204",
    cat: "Infrastructure/Maintenance",
    conf: 0.98,
    dept: "Maintenance Department",
    exec: "Mr. Rajesh Kumar",
    id: "4D6E88B0",
  },
];

const TYPE_MS = 28;
const ANALYZE_MS = 1300;
const HOLD_MS = 3200;

const initials = (name) =>
  name
    .replace(/^(Mr|Ms|Mrs|Dr)\.\s*/, "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

/** Looping, self-playing demo of a complaint being classified and routed. */
export default function HeroDemo() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState("typing"); // typing → analyzing → routed
  const ex = EXAMPLES[index];

  useEffect(() => {
    let t;
    if (phase === "typing") {
      if (typed < ex.text.length) t = setTimeout(() => setTyped((n) => n + 1), TYPE_MS);
      else t = setTimeout(() => setPhase("analyzing"), 350);
    } else if (phase === "analyzing") {
      t = setTimeout(() => setPhase("routed"), ANALYZE_MS);
    } else {
      t = setTimeout(() => {
        setIndex((i) => (i + 1) % EXAMPLES.length);
        setTyped(0);
        setPhase("typing");
      }, HOLD_MS);
    }
    return () => clearTimeout(t);
  }, [phase, typed, ex.text.length]);

  const cat = categoryById[ex.cat];
  const CatIcon = cat.icon;
  const routed = phase === "routed";
  const analyzing = phase === "analyzing";

  return (
    <div className="relative">
      {/* Floating side cards */}
      <div className="absolute -left-12 -top-7 z-20 hidden animate-float xl:block" style={{ animationDelay: "-2s" }}>
        <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lift">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-white">
            <CircleCheckBig className="h-5 w-5" />
          </span>
          <div className="text-left">
            <div className="text-xs font-bold text-ink">Complaint resolved</div>
            <div className="text-[11px] text-slate-500">Water restored · Block 3</div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-7 -right-12 z-20 hidden animate-float xl:block">
        <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lift">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-white">
            <Truck className="h-5 w-5" />
          </span>
          <div className="text-left">
            <div className="text-xs font-bold text-ink">Order on the way</div>
            <div className="text-[11px] text-slate-500">2× Maggi · arriving in 7 min</div>
          </div>
        </div>
      </div>

      {/* Window */}
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/80 shadow-[0_30px_80px_-30px_rgba(76,29,149,0.35)] backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-rose-400/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          <span className="mx-auto rounded-lg bg-white px-4 py-1 font-mono text-[11px] text-slate-400 ring-1 ring-slate-200/70">
            unisync / submit
          </span>
          <span className="w-[52px]" />
        </div>

        <div className="grid gap-4 p-4 text-left sm:p-6 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-3">
          {/* 1. Complaint */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="micro">New complaint</span>
              <span className="chip bg-slate-100 text-slate-600">
                <MapPin className="h-3 w-3" /> {ex.loc}
              </span>
            </div>
            <p className="min-h-[4.5rem] text-[15px] font-medium leading-relaxed text-slate-700">
              {ex.text.slice(0, typed)}
              {phase === "typing" && <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse bg-violet-500" />}
            </p>
          </div>

          {/* 2. AI node */}
          <div className="flex items-center justify-center gap-2 md:flex-col">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-violet-300 md:h-10 md:w-px md:bg-gradient-to-b" />
            <span className="relative grid h-14 w-14 place-items-center">
              {analyzing && <span className="absolute inset-0 animate-ping rounded-2xl bg-violet-400/40" />}
              <span
                className={`relative grid h-14 w-14 place-items-center rounded-2xl text-white transition-all duration-500 ${
                  analyzing ? "scale-110 bg-gradient-to-br from-violet-600 to-indigo-600 shadow-glow" : "bg-ink"
                }`}
              >
                <Bot className="h-6 w-6" />
              </span>
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-600">
              {analyzing ? "Classifying…" : routed ? "Routed" : "Gemini"}
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-violet-300 md:h-10 md:w-px md:bg-gradient-to-t" />
          </div>

          {/* 3. Result */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
            {routed ? (
              <div key={ex.id} className="space-y-3.5 animate-fade-in">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="chip"
                    style={{ background: `${cat.color}14`, color: cat.color }}
                  >
                    <CatIcon className="h-3.5 w-3.5" /> {cat.label}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-400">#{ex.id}</span>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[11px] font-bold">
                    <span className="text-slate-400">AI confidence</span>
                    <span className="text-emerald-600">{Math.round(ex.conf * 100)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full animate-bar-fill rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${ex.conf * 100}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-violet-50/70 p-2.5 ring-1 ring-inset ring-violet-100">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-extrabold text-white">
                    {initials(ex.exec)}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-violet-900">{ex.dept}</div>
                    <div className="truncate text-[11px] text-violet-600/80">Assigned to {ex.exec}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="skeleton h-6 w-36" />
                  <div className="skeleton h-4 w-16" />
                </div>
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-14 w-full" />
                {analyzing && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600">
                    <Sparkles className="h-3.5 w-3.5" /> Reading your complaint…
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
