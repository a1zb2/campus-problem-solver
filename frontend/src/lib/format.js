/**
 * Parse timestamps from the API. New rows are ISO-8601 UTC ("2026-11-09T14:00:00Z");
 * older rows were "YYYY-MM-DD HH:MM:SS" in server time, which we treat as UTC too.
 */
export function parseDate(value) {
  if (!value) return null;
  const iso = value.includes("T") ? value : value.replace(" ", "T") + "Z";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateTime(value) {
  const d = parseDate(value);
  if (!d) return "—";
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeAgo(value) {
  const d = parseDate(value);
  if (!d) return "—";
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** Complaints are stored as "[Block 3, Room 204] text" — split that back apart. */
export function splitLocation(description = "") {
  const m = description.match(/^\[Block\s+([^,\]]+),\s*Room\s+([^\]]+)\]\s*/i);
  if (!m) return { block: null, room: null, text: description };
  return { block: m[1], room: m[2], text: description.slice(m[0].length) };
}

export const percent = (c) => `${Math.round((c || 0) * 100)}%`;

export function confidenceTone(c) {
  if (c >= 0.8) return { label: "High", text: "text-emerald-700", bar: "bg-emerald-500", soft: "bg-emerald-50" };
  if (c >= 0.5) return { label: "Medium", text: "text-amber-700", bar: "bg-amber-500", soft: "bg-amber-50" };
  return { label: "Low", text: "text-rose-700", bar: "bg-rose-500", soft: "bg-rose-50" };
}
