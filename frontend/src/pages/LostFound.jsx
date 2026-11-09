import { useEffect, useState } from "react";
import { Camera, CircleCheckBig, Link2, ListFilter, MapPin, Plus, Sparkles } from "lucide-react";

import { Alert, PageHeader, PreviewBanner, Spinner, SuccessState, Tabs } from "../components/ui";
import { accentVars, serviceById } from "../lib/services";

const svc = serviceById["lost-found"];

const mockItems = [
  { id: 1, type: "Lost", title: "Blue water bottle", tags: ["blue", "water bottle", "Milton"], location: "Mess Hall", date: "Apr 11", emoji: "🍶", match: true },
  { id: 2, type: "Found", title: "boAt Airdopes earphones", tags: ["boAt", "earphones", "black", "TWS"], location: "Library", date: "Apr 12", emoji: "🎧", match: false },
  { id: 3, type: "Lost", title: "Casio scientific calculator", tags: ["Casio", "calculator", "fx-991"], location: "Room 204", date: "Apr 10", emoji: "🔢", match: false },
  { id: 4, type: "Found", title: "Blue denim jacket", tags: ["jacket", "denim", "blue", "medium"], location: "Ground Floor", date: "Apr 13", emoji: "🧥", match: false },
];

const TYPE_STYLE = {
  Lost: "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200",
  Found: "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200",
};

export default function LostFound() {
  const [activeTab, setActiveTab] = useState("browse");
  const [reportType, setReportType] = useState("Lost");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [tags, setTags] = useState([]);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    // Simulate Gemini Vision tagging
    setAnalyzing(true);
    setTimeout(() => {
      setTags(["blue", "water bottle", "plastic", "Milton", "500ml"]);
      setAnalyzing(false);
    }, 1800);
  };

  const handleSubmit = () => {
    if (!description.trim() || !location.trim()) return setError("Please fill in the description and location.");
    setError("");
    setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false);
    setPreview(null);
    setTags([]);
    setDescription("");
    setLocation("");
  };

  const items = filter === "All" ? mockItems : mockItems.filter((i) => i.type === filter);

  return (
    <div style={accentVars(svc)} className="mx-auto max-w-4xl animate-fade-up">
      <PageHeader
        eyebrow="Campus service"
        title="Lost & Found"
        description="Upload a photo — Gemini Vision auto-tags it and matches it with other reports."
        icon={svc.icon}
        accent={svc.accent}
        soft={svc.soft}
      />
      <PreviewBanner>AI image matching is coming soon. Browse the demo below.</PreviewBanner>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "browse", label: "Browse items", icon: ListFilter },
          { id: "report", label: "Report item", icon: Plus },
        ]}
      />

      {activeTab === "browse" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex gap-2">
            {["All", "Lost", "Found"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} data-active={filter === f} className="pill-toggle">
                {f}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`card relative flex gap-4 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift ${
                  item.match ? "ring-2 ring-amber-300/70" : ""
                }`}
              >
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-slate-50 text-3xl ring-1 ring-inset ring-slate-100">
                  {item.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    <span className={`chip ${TYPE_STYLE[item.type]}`}>{item.type}</span>
                    {item.match && (
                      <span className="chip bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                        <Link2 className="h-3 w-3" /> Potential match
                      </span>
                    )}
                    <span className="ml-auto text-xs text-slate-400">{item.date}</span>
                  </div>
                  <div className="font-bold text-ink">{item.title}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5" /> {item.location}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "report" && !submitted && (
        <div className="card card-pad space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 gap-2">
            {["Lost", "Found"].map((t) => {
              const active = reportType === t;
              const color = t === "Lost" ? "#f43f5e" : "#10b981";
              return (
                <button
                  key={t}
                  onClick={() => setReportType(t)}
                  className={`rounded-2xl border py-3.5 text-sm font-bold transition-all ${active ? "text-white shadow-lift" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
                  style={active ? { background: color, borderColor: color } : undefined}
                >
                  {t === "Lost" ? "😢 I lost something" : "😊 I found something"}
                </button>
              );
            })}
          </div>

          <div>
            <span className="label">
              Upload a photo <span className="font-normal" style={{ color: svc.accent }}>(AI will auto-tag it)</span>
            </span>
            {!preview ? (
              <label className="group flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 p-9 transition-all hover:border-violet-300 hover:bg-violet-50/40">
                <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-violet-500 transition-transform group-hover:-translate-y-0.5">
                  <Camera className="h-6 w-6" />
                </span>
                <span className="text-sm font-semibold text-slate-600">Click to upload</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            ) : (
              <div className="space-y-3">
                <img src={preview} alt="Item preview" className="max-h-56 w-full rounded-2xl object-cover ring-1 ring-slate-200" />
                {analyzing ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-violet-600">
                    <Spinner /> Gemini Vision is analyzing your photo…
                  </div>
                ) : (
                  tags.length > 0 && (
                    <div className="animate-fade-in">
                      <div className="micro mb-2 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" /> AI-extracted tags
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span key={tag} className="chip bg-violet-100 text-violet-700">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div>
            <label className="label" htmlFor="lf-desc">
              Description
            </label>
            <textarea
              id="lf-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the item in detail…"
              className="field resize-none"
            />
          </div>

          <div>
            <label className="label" htmlFor="lf-loc">
              Where was it {reportType === "Lost" ? "lost" : "found"}?
            </label>
            <input
              id="lf-loc"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Library, Mess Hall, Block 3 corridor…"
              className="field"
            />
          </div>

          {error && <Alert>{error}</Alert>}

          <button onClick={handleSubmit} className="btn-accent btn-lg w-full">
            Submit report
          </button>
        </div>
      )}

      {activeTab === "report" && submitted && (
        <SuccessState icon={CircleCheckBig} title="Report submitted!" action={<button onClick={reset} className="btn-accent">Submit another</button>}>
          <p>We&apos;ll notify you if a matching item is found. AI is checking existing reports now.</p>
        </SuccessState>
      )}
    </div>
  );
}
