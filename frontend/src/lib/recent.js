// Remembers the tracking IDs this browser submitted, so the Track page can offer them.
const KEY = "unisync:recent-complaints";
const MAX = 6;

export function getRecentIds() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function rememberId(id) {
  try {
    const next = [id, ...getRecentIds().filter((x) => x !== id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — not critical */
  }
}
