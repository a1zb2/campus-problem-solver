import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  Building2,
  CircleCheckBig,
  ImagePlus,
  Lightbulb,
  Plus,
  Radar,
  Sparkles,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";

import { errorMessage, submitProblem } from "../api";
import { Alert, CopyButton, InfoTile, PageHeader, Spinner } from "../components/ui";
import { CATEGORIES, HOSTEL_BLOCKS, categoryById } from "../lib/complaints";
import { confidenceTone, percent } from "../lib/format";
import { rememberId } from "../lib/recent";
import { accentVars, serviceById } from "../lib/services";

const svc = serviceById.complaints;
const MAX_IMAGE_MB = 5;
const MAX_CHARS = 1900; // backend allows 2000 incl. the "[Block x, Room y]" prefix
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const LOADING_STEPS = ["Uploading your complaint…", "Gemini is reading it…", "Picking the right department…"];

/** Rotating status text while submitting, derived from how long we've been waiting. */
function useLoadingCopy(startedAt) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [startedAt]);
  const elapsed = startedAt ? Math.max(0, now - startedAt) : 0;
  return {
    text: LOADING_STEPS[Math.min(Math.floor(elapsed / 1800), LOADING_STEPS.length - 1)],
    slow: elapsed > 9000,
  };
}

function Result({ result, onReset }) {
  const navigate = useNavigate();
  const cat = categoryById[result.category] || categoryById.Other;
  const tone = confidenceTone(result.confidence);

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-up" style={accentVars(svc)}>
      <div className="flex items-center gap-4 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white px-5 py-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white shadow-[0_8px_20px_-8px_rgba(16,185,129,0.8)]">
          <CircleCheckBig className="h-6 w-6" />
        </span>
        <div>
          <div className="font-extrabold text-emerald-900">Complaint submitted</div>
          <div className="text-sm text-emerald-700">Routed to {result.department}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Ticket header */}
        <div className="relative bg-ink px-6 py-6 text-white sm:px-7">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-violet-500/40 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-200/70">Your tracking ID</div>
              <div className="mt-1 font-mono text-3xl font-bold tracking-[0.2em]">{result.tracking_id}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-200/70">Location</div>
              <div className="mt-1 font-semibold">
                Block {result.block}, Room {result.room}
              </div>
            </div>
          </div>
        </div>
        <div className="relative h-0 border-t-2 border-dashed border-slate-200">
          <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#f7f7fb]" />
          <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#f7f7fb]" />
        </div>

        <div className="space-y-4 p-6 sm:p-7">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile label="Category">
              <span className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: `${cat.color}18`, color: cat.color }}>
                  <cat.icon className="h-4 w-4" />
                </span>
                {cat.label}
              </span>
            </InfoTile>
            <InfoTile label="AI confidence">
              <div className="flex items-center gap-3">
                <span className={`text-lg font-extrabold ${tone.text}`}>{percent(result.confidence)}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/70">
                  <div className={`h-full rounded-full ${tone.bar} animate-bar-fill`} style={{ width: percent(result.confidence) }} />
                </div>
              </div>
            </InfoTile>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-violet-50/70 p-4 ring-1 ring-inset ring-violet-100">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
              <Building2 className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="micro !text-violet-500">Routed to</div>
              <div className="font-bold text-violet-950">{result.department}</div>
            </div>
            {result.executive?.name && (
              <div className="hidden items-center gap-2 text-right text-sm sm:flex">
                <UserRound className="h-4 w-4 text-violet-400" />
                <div>
                  <div className="font-semibold text-violet-900">{result.executive.name}</div>
                  <div className="text-xs text-violet-500">{result.executive.email}</div>
                </div>
              </div>
            )}
          </div>

          {result.fallback && (
            <Alert tone="warn">Low AI confidence — sent to General Administration for manual review.</Alert>
          )}

          <div className="rounded-2xl border border-slate-100 p-4">
            <div className="micro mb-1.5 flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5" /> AI reasoning
            </div>
            <p className="text-sm leading-relaxed text-slate-600">{result.reasoning}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-xs font-medium text-slate-500">Save your tracking ID to check the status later.</span>
            <CopyButton value={result.tracking_id} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => navigate(`/track?id=${result.tracking_id}`)} className="btn-primary">
          <Radar className="h-4 w-4" /> Track this complaint
        </button>
        <button onClick={onReset} className="btn-ghost">
          <Plus className="h-4 w-4" /> Submit another
        </button>
      </div>
    </div>
  );
}

export default function Submit() {
  const [description, setDescription] = useState("");
  const [block, setBlock] = useState("");
  const [room, setRoom] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loadingSince, setLoadingSince] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef();
  const loading = loadingSince !== null;
  const loadingCopy = useLoadingCopy(loadingSince);

  // Free the preview blob when it changes / on unmount.
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pickFile = (file) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) return setError("Photo must be a JPG, PNG, WEBP or GIF image.");
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return setError(`Photo is too large (max ${MAX_IMAGE_MB} MB).`);
    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const text = description.trim();
    const roomNum = Number(room);
    if (!block) return setError("Please select your hostel block.");
    if (!room || !Number.isInteger(roomNum) || roomNum < 1 || roomNum > 999) return setError("Please enter a valid room number (1–999).");
    if (!text) return setError("Please describe your problem.");
    if (text.length < 10) return setError("Description is too short (min 10 characters).");

    setLoadingSince(Date.now());
    try {
      const data = await submitProblem(`[Block ${block}, Room ${roomNum}] ${text}`, image);
      rememberId(data.tracking_id);
      setResult({ ...data, block, room: roomNum });
      setDescription("");
      setBlock("");
      setRoom("");
      clearImage();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoadingSince(null);
    }
  };

  if (result) return <Result result={result} onReset={() => setResult(null)} />;

  const len = description.trim().length;

  return (
    <div style={accentVars(svc)} className="animate-fade-up">
      <PageHeader
        eyebrow="Student portal"
        title="File a complaint"
        description="Our AI agent classifies it and routes it to the right team instantly."
        icon={svc.icon}
        accent={svc.accent}
        soft={svc.soft}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form onSubmit={handleSubmit} className="card card-pad space-y-6" noValidate>
          <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
            <div>
              <span className="label">
                Hostel block <span className="text-rose-400">*</span>
              </span>
              <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-label="Hostel block">
                {HOSTEL_BLOCKS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    role="radio"
                    aria-checked={block === b}
                    onClick={() => setBlock(b)}
                    className={`h-12 rounded-2xl border text-base font-extrabold transition-all duration-200 ${
                      block === b
                        ? "border-indigo-500 bg-indigo-500 text-white shadow-[0_8px_20px_-8px_rgba(99,102,241,0.9)]"
                        : "border-slate-200 bg-slate-50/70 text-slate-600 hover:border-indigo-300 hover:bg-white"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="room" className="label">
                Room number <span className="text-rose-400">*</span>
              </label>
              <input
                id="room"
                type="number"
                inputMode="numeric"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. 204"
                min={1}
                max={999}
                className="field h-12"
              />
            </div>
          </div>

          <div>
            <label htmlFor="desc" className="label">
              Describe your problem <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX_CHARS))}
              rows={6}
              placeholder="e.g. Bathroom on the 3rd floor has had no water since yesterday morning. The tap is completely dry…"
              className="field resize-none leading-relaxed"
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">Be specific — a better description means better routing.</span>
              <span className={`font-semibold tabular-nums ${len > 0 && len < 10 ? "text-rose-500" : "text-slate-400"}`}>
                {description.length}/{MAX_CHARS}
              </span>
            </div>
          </div>

          <div>
            <span className="label">
              Attach a photo <span className="font-normal text-slate-400">(optional)</span>
            </span>
            {!preview ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pickFile(e.dataTransfer.files?.[0]);
                }}
                className={`group flex w-full flex-col items-center rounded-2xl border-2 border-dashed px-6 py-9 text-center transition-all duration-200 ${
                  dragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40"
                }`}
              >
                <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-500 transition-transform group-hover:-translate-y-0.5">
                  <ImagePlus className="h-6 w-6" />
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  Drop a photo here or <span className="text-indigo-600">browse</span>
                </span>
                <span className="mt-1 text-xs text-slate-400">JPG, PNG, WEBP — up to {MAX_IMAGE_MB} MB</span>
              </button>
            ) : (
              <div className="group relative overflow-hidden rounded-2xl ring-1 ring-slate-200">
                <img src={preview} alt="Selected attachment" className="max-h-64 w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8 text-xs text-white">
                  <span className="truncate font-medium">{image?.name}</span>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1.5 font-bold text-slate-800 hover:bg-white"
                  >
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept={ACCEPTED.join(",")} onChange={(e) => pickFile(e.target.files?.[0])} className="hidden" />
          </div>

          {error && <Alert>{error}</Alert>}
          {loading && loadingCopy.slow && (
            <Alert tone="info">The server is waking up after being idle — this can take up to a minute the first time.</Alert>
          )}

          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
            {loading ? (
              <>
                <Spinner /> {loadingCopy.text}
              </>
            ) : (
              <>
                Submit complaint <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <aside className="space-y-4">
          <div className="card card-pad">
            <div className="mb-4 flex items-center gap-2 text-sm font-extrabold text-ink">
              <Sparkles className="h-4 w-4 text-indigo-500" /> AI sorts it into
            </div>
            <ul className="space-y-2">
              {CATEGORIES.map((c) => (
                <li key={c.id} className="flex items-center gap-3 rounded-xl px-2 py-1.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${c.color}14`, color: c.color }}>
                    <c.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-slate-600">{c.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-amber-200/70 bg-amber-50/60 p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-amber-900">
              <Lightbulb className="h-4 w-4" /> Tips for faster resolution
            </div>
            <ul className="space-y-1.5 text-sm leading-relaxed text-amber-900/80">
              <li>• Say <b className="font-bold">where</b> exactly (floor, wing, washroom no.)</li>
              <li>• Say <b className="font-bold">since when</b> it&apos;s been happening</li>
              <li>• Attach a photo if you can</li>
            </ul>
          </div>
          <div className="flex items-start gap-3 rounded-3xl border border-rose-200/70 bg-rose-50/60 p-5 text-sm text-rose-900/80">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <span>
              <b className="text-rose-900">In danger right now?</b> Ragging or safety emergencies — contact campus security directly as well.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
