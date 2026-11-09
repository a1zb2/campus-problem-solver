import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Clock, MapPin, MessageSquareReply, Radar, Search, SearchX } from "lucide-react";

import { errorMessage, getImageUrl, getProblemById } from "../api";
import { Alert, CopyButton, InfoTile, PageHeader, Spinner } from "../components/ui";
import { STATUSES, categoryById, statusOf } from "../lib/complaints";
import { formatDateTime, percent, splitLocation, timeAgo } from "../lib/format";
import { getRecentIds } from "../lib/recent";
import { serviceById } from "../lib/services";

const svc = serviceById.complaints;

function Stepper({ status }) {
  const current = STATUSES.indexOf(status);
  return (
    <ol className="flex items-center">
      {STATUSES.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const StepIcon = statusOf(step).icon;
        return (
          <li key={step} className={`flex items-center ${i < STATUSES.length - 1 ? "flex-1" : ""}`}>
            <div className="flex flex-col items-center gap-2">
              <span
                className={`grid h-11 w-11 place-items-center rounded-2xl transition-all duration-500 ${
                  done
                    ? "bg-indigo-500 text-white"
                    : active
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-glow"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <Check className="h-5 w-5" strokeWidth={3} /> : <StepIcon className="h-5 w-5" />}
              </span>
              <span className={`whitespace-nowrap text-xs font-bold ${i <= current ? "text-indigo-700" : "text-slate-400"}`}>{step}</span>
            </div>
            {i < STATUSES.length - 1 && (
              <div className="relative mx-2 -mt-6 h-1 flex-1 overflow-hidden rounded-full bg-slate-100 sm:mx-4">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
                  style={{ width: i < current ? "100%" : "0%" }}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ProblemView({ problem }) {
  const cfg = statusOf(problem.status);
  const cat = categoryById[problem.category];
  const { block, room, text } = splitLocation(problem.description);
  const imageUrl = getImageUrl(problem.image_path);

  return (
    <div className="space-y-4 animate-fade-up">
      <div className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-gradient-to-r px-6 py-5 ${cfg.banner}`}>
        <div className="flex items-center gap-4">
          <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-soft ${cfg.text}`}>
            <cfg.icon className="h-6 w-6" />
          </span>
          <div>
            <div className="micro">Current status</div>
            <div className={`text-xl font-extrabold ${cfg.text}`}>{problem.status}</div>
            <div className="text-sm text-slate-500">{cfg.desc}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="micro">Tracking ID</div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold tracking-widest text-ink">{problem.id}</span>
            <CopyButton value={problem.id} />
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <Stepper status={problem.status} />
      </div>

      <div className="card card-pad space-y-5">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <InfoTile label="Category">
            {cat ? (
              <span className="flex items-center gap-1.5">
                <cat.icon className="h-4 w-4" style={{ color: cat.color }} /> {cat.label}
              </span>
            ) : (
              problem.category || "Classifying…"
            )}
          </InfoTile>
          <InfoTile label="Department">{problem.department || "Pending"}</InfoTile>
          {problem.confidence > 0 && <InfoTile label="AI confidence">{percent(problem.confidence)}</InfoTile>}
          {block && (
            <InfoTile label="Location">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-slate-400" /> Block {block}, Room {room}
              </span>
            </InfoTile>
          )}
          <InfoTile label="Submitted">{formatDateTime(problem.submitted_at)}</InfoTile>
          <InfoTile label="Last updated">
            <span title={formatDateTime(problem.updated_at)}>{timeAgo(problem.updated_at)}</span>
          </InfoTile>
        </div>

        <div className={`grid gap-5 ${imageUrl ? "md:grid-cols-[1fr_auto]" : ""}`}>
          <div>
            <div className="micro mb-2">Your complaint</div>
            <p className="rounded-2xl bg-slate-50 px-4 py-3.5 text-[15px] leading-relaxed text-slate-700 ring-1 ring-inset ring-slate-100">{text}</p>
          </div>
          {imageUrl && (
            <a href={imageUrl} target="_blank" rel="noreferrer" className="block md:w-56">
              <div className="micro mb-2">Photo</div>
              <img src={imageUrl} alt="Attached to complaint" className="h-40 w-full rounded-2xl object-cover ring-1 ring-slate-200 transition-opacity hover:opacity-90" />
            </a>
          )}
        </div>

        {problem.resolution ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
              <MessageSquareReply className="h-3.5 w-3.5" /> Admin response
            </div>
            <p className="text-[15px] leading-relaxed text-emerald-900">{problem.resolution}</p>
          </div>
        ) : (
          <p className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 py-4 text-sm text-slate-400">
            <Clock className="h-4 w-4" /> No admin response yet — check back soon.
          </p>
        )}
      </div>
    </div>
  );
}

export default function Track() {
  const [params, setParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(params.get("id")?.toUpperCase() || "");
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recent] = useState(getRecentIds);

  const search = useCallback(
    async (rawId) => {
      const id = rawId.trim().toUpperCase();
      if (!id) return setError("Please enter a tracking ID.");
      setError("");
      setLoading(true);
      setTrackingId(id);
      setParams({ id }, { replace: true });
      try {
        setProblem(await getProblemById(id));
      } catch (err) {
        setProblem(null);
        setError(err?.response?.status === 404 ? `No complaint found with ID "${id}".` : errorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [setParams]
  );

  // Auto-search when arriving with ?id=XXXX (e.g. from the Submit page).
  useEffect(() => {
    const id = params.get("id");
    if (id) search(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Student portal"
        title="Track your complaint"
        description="Enter your tracking ID to see live status."
        icon={Radar}
        accent={svc.accent}
        soft={svc.soft}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(trackingId);
        }}
        className="card mb-3 flex items-center gap-2 p-2"
      >
        <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" />
        <input
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          placeholder="Tracking ID, e.g. A720C7C7"
          maxLength={8}
          aria-label="Tracking ID"
          className="min-w-0 flex-1 bg-transparent px-2 py-3 font-mono text-lg font-bold tracking-[0.2em] text-ink placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none"
        />
        <button type="submit" disabled={loading} className="btn-primary shrink-0">
          {loading ? <Spinner /> : "Search"}
        </button>
      </form>

      {recent.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 px-1">
          <span className="text-xs font-semibold text-slate-400">Recent:</span>
          {recent.map((id) => (
            <button
              key={id}
              onClick={() => search(id)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-xs font-bold tracking-wider text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-700"
            >
              {id}
            </button>
          ))}
        </div>
      )}

      {error && <Alert className="mb-5">{error}</Alert>}

      {problem ? (
        <ProblemView problem={problem} />
      ) : (
        !error &&
        !loading && (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="relative mb-5 grid h-20 w-20 place-items-center">
              <span className="absolute inset-0 rounded-full bg-indigo-100" />
              <span className="absolute inset-3 rounded-full bg-indigo-50 ring-1 ring-indigo-100" />
              <SearchX className="relative h-8 w-8 text-indigo-400" />
            </span>
            <div className="font-bold text-slate-600">Nothing to show yet</div>
            <div className="mt-1 text-sm text-slate-400">Your tracking ID was shown when you submitted the complaint.</div>
          </div>
        )
      )}
    </div>
  );
}
