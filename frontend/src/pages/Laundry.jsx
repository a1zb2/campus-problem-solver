import { useState } from "react";
import { CalendarClock, Shirt, Sparkles, WandSparkles } from "lucide-react";

import { Alert, PageHeader, PreviewBanner, Spinner, SuccessState } from "../components/ui";
import { HOSTEL_BLOCKS } from "../lib/complaints";
import { accentVars, serviceById } from "../lib/services";

const svc = serviceById.laundry;

const slots = [
  "7:00 AM – 9:00 AM",
  "9:00 AM – 11:00 AM",
  "11:00 AM – 1:00 PM",
  "2:00 PM – 4:00 PM",
  "4:00 PM – 6:00 PM",
  "6:00 PM – 8:00 PM",
];

const days = ["Today", "Tomorrow", "Day After"];

function Choice({ active, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-all duration-200 ${
        active
          ? "border-transparent text-white shadow-[0_10px_24px_-10px_var(--accent)]"
          : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-slate-900"
      } ${className}`}
      style={active ? { background: "var(--accent)" } : undefined}
    >
      {children}
    </button>
  );
}

export default function Laundry() {
  const [nlInput, setNlInput] = useState("");
  const [parsed, setParsed] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booked, setBooked] = useState(false);
  const [block, setBlock] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");

  const handleNLParse = () => {
    if (!nlInput.trim()) return;
    setParsing(true);
    // Simulated AI parsing
    setTimeout(() => {
      const lower = nlInput.toLowerCase();
      let day = "Tomorrow";
      let slot = "9:00 AM – 11:00 AM";
      if (lower.includes("today")) day = "Today";
      if (lower.includes("day after")) day = "Day After";
      if (lower.includes("morning") || /\b(7|8)\b/.test(lower)) slot = "7:00 AM – 9:00 AM";
      if (lower.includes("afternoon") || /\b(2|3)\b/.test(lower)) slot = "2:00 PM – 4:00 PM";
      if (lower.includes("evening") || /\b(5|6)\b/.test(lower)) slot = "4:00 PM – 6:00 PM";
      if (/\b11\b/.test(lower) || lower.includes("noon")) slot = "11:00 AM – 1:00 PM";
      setParsed({ day, slot });
      setSelectedDay(day);
      setSelectedSlot(slot);
      setParsing(false);
    }, 1200);
  };

  const handleBook = () => {
    if (!selectedDay || !selectedSlot) return setError("Select a day and a time slot.");
    if (!block || !room.trim()) return setError("Enter your block and room number.");
    setError("");
    setBooked(true);
  };

  const reset = () => {
    setBooked(false);
    setParsed(null);
    setNlInput("");
    setSelectedDay(null);
    setSelectedSlot(null);
  };

  if (booked) {
    return (
      <div style={accentVars(svc)} className="py-6">
        <SuccessState icon={Shirt} title="Laundry booked!" action={<button onClick={reset} className="btn-accent">Book another</button>}>
          <p>
            Pickup scheduled for <b className="text-slate-800">{selectedDay}</b> during the <b className="text-slate-800">{selectedSlot}</b> slot.
          </p>
          <p className="text-sm text-slate-400">
            Block {block}, Room {room}
          </p>
        </SuccessState>
      </div>
    );
  }

  return (
    <div style={accentVars(svc)} className="mx-auto max-w-3xl animate-fade-up">
      <PageHeader
        eyebrow="Campus service"
        title="Laundry"
        description="Schedule a laundry pickup. Just type when you want it — AI figures out the rest."
        icon={svc.icon}
        accent={svc.accent}
        soft={svc.soft}
      />
      <PreviewBanner>Live laundry scheduling is coming soon. Explore the interface below.</PreviewBanner>

      <div className="relative mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-500 p-6 text-white shadow-[0_24px_50px_-24px_rgba(14,165,233,0.8)] sm:p-7">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
        <div className="relative">
          <h3 className="flex items-center gap-2 text-lg font-extrabold">
            <WandSparkles className="h-5 w-5" /> Just tell us when
          </h3>
          <p className="mt-1 text-sm text-sky-50/90">Type naturally — our AI will find the right slot for you.</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              placeholder={`"Book laundry tomorrow morning after 9"`}
              className="min-w-0 flex-1 rounded-2xl border border-white/30 bg-white/15 px-4 py-3 text-[15px] text-white placeholder:text-sky-50/70 backdrop-blur focus:border-white focus:bg-white/25 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleNLParse()}
            />
            <button onClick={handleNLParse} disabled={parsing} className="btn bg-white text-sky-700 shadow-lift hover:-translate-y-0.5">
              {parsing ? <Spinner /> : <Sparkles className="h-4 w-4" />}
              {parsing ? "Parsing…" : "Parse"}
            </button>
          </div>
          {parsed && (
            <div className="mt-3 inline-flex animate-fade-in items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm backdrop-blur">
              <CalendarClock className="h-4 w-4" />
              <span>
                AI suggests <b>{parsed.day} · {parsed.slot}</b>
              </span>
              <span className="text-xs text-sky-50/80">(you can change below)</span>
            </div>
          )}
        </div>
      </div>

      <div className="card card-pad space-y-6">
        <h3 className="font-extrabold text-ink">Or pick manually</h3>

        <div>
          <div className="label">Day</div>
          <div className="grid grid-cols-3 gap-2">
            {days.map((d) => (
              <Choice key={d} active={selectedDay === d} onClick={() => setSelectedDay(d)}>
                {d}
              </Choice>
            ))}
          </div>
        </div>

        <div>
          <div className="label">Time slot</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slots.map((s) => (
              <Choice key={s} active={selectedSlot === s} onClick={() => setSelectedSlot(s)} className="font-semibold">
                {s}
              </Choice>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select value={block} onChange={(e) => setBlock(e.target.value)} className="field" aria-label="Block">
            <option value="">Select block</option>
            {HOSTEL_BLOCKS.map((b) => (
              <option key={b} value={b}>
                Block {b}
              </option>
            ))}
          </select>
          <input
            placeholder="Room number"
            inputMode="numeric"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="field"
            aria-label="Room number"
          />
        </div>

        {error && <Alert>{error}</Alert>}

        <button onClick={handleBook} className="btn-accent btn-lg w-full">
          <Shirt className="h-5 w-5" /> Confirm booking
        </button>
      </div>
    </div>
  );
}
