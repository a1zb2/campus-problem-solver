import axios from "axios";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

// Render's free tier sleeps after inactivity and can take ~50s to wake up,
// so the timeout is generous.
const api = axios.create({ baseURL: BASE_URL, timeout: 90_000 });

// Clerk session token getter, registered by <AuthBridge /> in App.jsx.
let getToken = null;
export const setTokenGetter = (fn) => {
  getToken = fn;
};

api.interceptors.request.use(async (config) => {
  if (getToken) {
    try {
      const token = await getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      /* not signed in — send without a token */
    }
  }
  return config;
});

/** Turn an axios error into something a human can read. */
export function errorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (err?.code === "ECONNABORTED") return "The server took too long to respond. Please try again in a moment.";
  if (!err?.response) return "Can't reach the server right now. It may be waking up — try again in a few seconds.";
  const detail = err.response.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return fallback;
}

/** Fire-and-forget ping so a sleeping backend starts waking up as soon as the site loads. */
export const warmUp = () => api.get("/", { timeout: 90_000 }).catch(() => {});

export const submitProblem = (description, image) => {
  const formData = new FormData();
  formData.append("description", description);
  if (image) formData.append("image", image);
  return api.post("/problems", formData).then((r) => r.data);
};

export const getProblemById = (id) => api.get(`/problems/${encodeURIComponent(id)}`).then((r) => r.data);

export const getAllProblems = (status, department) =>
  api.get("/problems", { params: { status, department } }).then((r) => r.data);

export const updateProblemStatus = (id, status, resolution) =>
  api.patch(`/problems/${encodeURIComponent(id)}`, { status, resolution }).then((r) => r.data);

export const deleteProblem = (id) => api.delete(`/problems/${encodeURIComponent(id)}`).then((r) => r.data);

export const getStats = () => api.get("/stats").then((r) => r.data);

export const getImageUrl = (path) => (path ? `${BASE_URL}${path}` : null);
