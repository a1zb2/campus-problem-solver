import { useState } from "react";
import { Check, CircleAlert, Construction, Copy, LoaderCircle, TriangleAlert, CircleCheck, Info } from "lucide-react";

export function Logo({ size = "md" }) {
  const box = size === "sm" ? "h-7 w-7 rounded-lg" : "h-9 w-9 rounded-xl";
  const text = size === "sm" ? "text-base" : "text-xl";
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`${box} relative grid place-items-center bg-gradient-to-br from-violet-600 to-indigo-600 shadow-[0_6px_16px_-6px_rgba(124,58,237,0.8)]`}
      >
        <svg viewBox="0 0 64 64" className="h-[62%] w-[62%]" aria-hidden="true">
          <path d="M19 14v20a13 13 0 0 0 26 0V14" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
        </svg>
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-sky-400" />
      </span>
      <span className={`${text} font-extrabold tracking-tight text-ink`}>
        Uni<span className="text-gradient">Sync</span>
      </span>
    </span>
  );
}

export function Spinner({ className = "h-4 w-4" }) {
  return <LoaderCircle className={`${className} animate-spin`} aria-hidden="true" />;
}

/** Page title block. `service` (from lib/services) sets the accent colour + icon. */
export function PageHeader({ eyebrow, title, description, icon: Icon, accent = "#7c3aed", soft = "#f5f3ff", children }) {
  return (
    <header className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        {Icon && (
          <span
            className="mt-1 hidden h-14 w-14 shrink-0 place-items-center rounded-2xl ring-1 ring-inset sm:grid"
            style={{ background: soft, color: accent, "--tw-ring-color": `${accent}33` }}
          >
            <Icon className="h-7 w-7" strokeWidth={2.2} />
          </span>
        )}
        <div>
          <p className="eyebrow mb-2" style={{ color: accent }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
            {eyebrow}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.1]">{title}</h1>
          {description && <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-500">{description}</p>}
        </div>
      </div>
      {children}
    </header>
  );
}

export function PreviewBanner({ children }) {
  return (
    <div
      className="mb-6 flex items-start gap-3 rounded-2xl border border-dashed px-4 py-3.5 text-sm"
      style={{ borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)", background: "var(--accent-soft)" }}
    >
      <Construction className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
      <p className="text-slate-600">
        <span className="font-bold text-slate-800">Feature preview · </span>
        {children}
      </p>
    </div>
  );
}

const ALERT_TONES = {
  error: { cls: "border-rose-200 bg-rose-50 text-rose-700", icon: CircleAlert },
  warn: { cls: "border-amber-200 bg-amber-50 text-amber-800", icon: TriangleAlert },
  success: { cls: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: CircleCheck },
  info: { cls: "border-sky-200 bg-sky-50 text-sky-800", icon: Info },
};

export function Alert({ tone = "error", children, className = "" }) {
  const t = ALERT_TONES[tone];
  const Icon = t.icon;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium animate-fade-in ${t.cls} ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

/** Segmented control used for Browse / Report style tabs. */
export function Tabs({ tabs, value, onChange }) {
  return (
    <div role="tablist" className="mb-6 inline-flex rounded-2xl border border-slate-200/80 bg-white p-1 shadow-sm">
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
              active ? "bg-ink text-white shadow-soft" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Centered confirmation card shown after a form succeeds. */
export function SuccessState({ icon: Icon, title, children, action }) {
  return (
    <div className="card card-pad mx-auto max-w-lg text-center animate-scale-in">
      <div className="relative mx-auto mb-5 grid h-20 w-20 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full opacity-20" style={{ background: "var(--accent)", animationIterationCount: 2 }} />
        <span className="relative grid h-20 w-20 place-items-center rounded-full text-white shadow-lift" style={{ background: "var(--accent)" }}>
          <Icon className="h-9 w-9" strokeWidth={2.2} />
        </span>
      </div>
      <h2 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-slate-500">{children}</div>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon className="h-7 w-7" />
      </span>
      <div className="font-bold text-slate-700">{title}</div>
      {children && <div className="mt-1 max-w-sm text-sm text-slate-400">{children}</div>}
    </div>
  );
}

export function CopyButton({ value, className = "" }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — ignore */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:border-slate-300 hover:text-slate-900 ${className}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/** Small labelled value tile. */
export function InfoTile({ label, children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-slate-50 px-4 py-3.5 ring-1 ring-inset ring-slate-100 ${className}`}>
      <div className="micro mb-1">{label}</div>
      <div className="text-sm font-semibold text-slate-800">{children}</div>
    </div>
  );
}
