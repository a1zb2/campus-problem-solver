import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  MapPin,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import { deleteProblem, errorMessage, getAllProblems, getImageUrl, getStats, updateProblemStatus } from "../api";
import { Alert, EmptyState, InfoTile, PageHeader, Spinner } from "../components/ui";
import { DEPARTMENTS, STATUSES, STATUS, categoryById, statusOf } from "../lib/complaints";
import { formatDateTime, percent, splitLocation, timeAgo } from "../lib/format";

function StatCard({ label, value, icon: Icon, tint, children }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500">{label}</span>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${tint}`}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <div className="mt-3 text-4xl font-extrabold tracking-tight text-ink tabular-nums">{value}</div>
      {children}
    </div>
  );
}

function StatusChip({ status }) {
  const cfg = statusOf(status);
  return (
    <span className={`chip ${cfg.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

function ProblemRow({ problem, onChanged }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(problem.status);
  const [resolution, setResolution] = useState(problem.resolution || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Keep the form in sync when fresh data arrives from a refresh.
  useEffect(() => {
    setStatus(problem.status);
    setResolution(problem.resolution || "");
  }, [problem.status, problem.resolution, problem.updated_at]);

  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(false), 4000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  const cat = categoryById[problem.category];
  const { block, room, text } = splitLocation(problem.description);
  const imageUrl = getImageUrl(problem.image_path);
  const dirty = status !== problem.status || resolution.trim() !== (problem.resolution || "");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await updateProblemStatus(problem.id, status, resolution);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onChanged();
    } catch (err) {
      setError(errorMessage(err, "Failed to update. Try again."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirmDelete) return setConfirmDelete(true);
    setDeleting(true);
    setError("");
    try {
      await deleteProblem(problem.id);
      onChanged();
    } catch (err) {
      setError(errorMessage(err, "Failed to delete."));
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className={`card overflow-hidden transition-shadow ${open ? "shadow-lift" : "hover:shadow-lift"}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50/60"
      >
        <span
          className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl sm:grid"
          style={{ background: `${cat?.color || "#64748b"}14`, color: cat?.color || "#64748b" }}
        >
          {cat ? <cat.icon className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip status={problem.status} />
            <span className="font-mono text-xs font-bold tracking-wider text-slate-400">{problem.id}</span>
            {block && (
              <span className="hidden items-center gap-1 text-xs text-slate-400 sm:flex">
                <MapPin className="h-3 w-3" /> B{block} · {room}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm font-medium text-slate-700">{text}</p>
        </div>
        <div className="hidden shrink-0 text-right md:block">
          <div className="text-xs font-semibold text-slate-500">{problem.department || "—"}</div>
          <div className="text-xs text-slate-400" title={formatDateTime(problem.submitted_at)}>
            {timeAgo(problem.submitted_at)}
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="grid gap-6 border-t border-slate-100 bg-slate-50/40 px-5 py-5 animate-fade-in md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <div className="micro mb-1.5">Complaint</div>
              <p className="rounded-2xl bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 ring-1 ring-inset ring-slate-100">{text}</p>
            </div>
            {imageUrl && (
              <a href={imageUrl} target="_blank" rel="noreferrer" className="block">
                <div className="micro mb-1.5">Photo</div>
                <img src={imageUrl} alt="Attached to complaint" className="max-h-48 w-full rounded-2xl object-cover ring-1 ring-slate-200" />
              </a>
            )}
            <div className="grid grid-cols-2 gap-2.5">
              <InfoTile label="Category" className="bg-white">{cat?.label || problem.category || "—"}</InfoTile>
              <InfoTile label="Confidence" className="bg-white">{problem.confidence ? percent(problem.confidence) : "—"}</InfoTile>
              <InfoTile label="Location" className="bg-white">{block ? `Block ${block}, Room ${room}` : "—"}</InfoTile>
              <InfoTile label="Submitted" className="bg-white">{formatDateTime(problem.submitted_at)}</InfoTile>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="micro mb-1.5">Update status</div>
              <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-white p-1.5 ring-1 ring-inset ring-slate-200">
                {STATUSES.map((s) => {
                  const Icon = STATUS[s].icon;
                  const active = status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition-all sm:text-sm ${
                        active ? "bg-ink text-white shadow-soft" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="micro mb-1.5 block" htmlFor={`res-${problem.id}`}>
                Resolution / response to student
              </label>
              <textarea
                id={`res-${problem.id}`}
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={4}
                placeholder="Describe what action was taken…"
                className="field resize-none bg-white text-sm"
              />
            </div>
            {error && <Alert>{error}</Alert>}
            <div className="flex gap-2">
              <button onClick={save} disabled={saving || (!dirty && !saved)} className="btn-primary flex-1">
                {saved ? (
                  <>
                    <Check className="h-4 w-4" /> Saved
                  </>
                ) : saving ? (
                  <>
                    <Spinner /> Saving…
                  </>
                ) : (
                  "Save update"
                )}
              </button>
              <button
                onClick={remove}
                disabled={deleting}
                className={`btn border ${
                  confirmDelete ? "border-rose-500 bg-rose-500 text-white" : "border-rose-200 bg-white text-rose-500 hover:bg-rose-50"
                }`}
              >
                {deleting ? <Spinner /> : <Trash2 className="h-4 w-4" />}
                {confirmDelete ? "Confirm" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [p, s] = await Promise.all([
        getAllProblems(filterStatus !== "All" ? filterStatus : undefined, filterDept !== "All" ? filterDept : undefined),
        getStats(),
      ]);
      setProblems(p);
      setStats(s);
      setError("");
    } catch (err) {
      setError(errorMessage(err, "Couldn't load complaints."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterStatus, filterDept]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return problems;
    return problems.filter((p) => p.id.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
  }, [problems, query]);

  const resolvedRate = stats?.total ? stats.resolved / stats.total : 0;
  const countFor = (s) => (!stats ? null : s === "All" ? stats.total : stats[s === "In Progress" ? "in_progress" : s.toLowerCase()]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin panel"
        title="Dashboard"
        description="Manage and resolve student complaints."
        icon={LayoutDashboard}
      >
        <button onClick={fetchData} disabled={refreshing} className="btn-ghost self-start sm:self-auto">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </PageHeader>

      {error && <Alert>{error}</Alert>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats ? (
          <>
            <StatCard label="Total" value={stats.total} icon={ClipboardList} tint="bg-slate-100 text-slate-600">
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>Resolved</span>
                  <span>{percent(resolvedRate)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-700" style={{ width: percent(resolvedRate) }} />
                </div>
              </div>
            </StatCard>
            <StatCard label="Submitted" value={stats.submitted} icon={STATUS.Submitted.icon} tint="bg-sky-50 text-sky-600" />
            <StatCard label="In progress" value={stats.in_progress} icon={STATUS["In Progress"].icon} tint="bg-amber-50 text-amber-600" />
            <StatCard label="Resolved" value={stats.resolved} icon={STATUS.Resolved.icon} tint="bg-emerald-50 text-emerald-600" />
          </>
        ) : (
          [0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-[124px] !rounded-3xl" />)
        )}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {["All", ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} data-active={filterStatus === s} className="pill-toggle flex items-center gap-2">
              {s}
              {countFor(s) != null && (
                <span className={`rounded-full px-1.5 text-xs ${filterStatus === s ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
                  {countFor(s)}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ID or text…"
              className="field bg-white py-2.5 pl-10 text-sm sm:w-56"
            />
          </div>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="field bg-white py-2.5 text-sm sm:w-60">
            <option value="All">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-[76px] !rounded-3xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState icon={Inbox} title="No complaints found">
          {query || filterStatus !== "All" || filterDept !== "All" ? "Try changing your filters." : "New complaints will show up here."}
        </EmptyState>
      ) : (
        <div className="space-y-3">
          <div className="px-1 text-xs font-semibold text-slate-400">
            {visible.length} complaint{visible.length !== 1 ? "s" : ""}
          </div>
          {visible.map((p) => (
            <ProblemRow key={p.id} problem={p} onChanged={fetchData} />
          ))}
        </div>
      )}
    </div>
  );
}
