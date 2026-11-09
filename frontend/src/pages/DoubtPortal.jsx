import { useState } from "react";
import { ArrowRight, GraduationCap, Hand, MessagesSquare, UserRound } from "lucide-react";

import { Alert, PageHeader, PreviewBanner, Spinner, SuccessState, Tabs } from "../components/ui";
import { accentVars, serviceById } from "../lib/services";

const svc = serviceById.doubts;

const mockDoubts = [
  { id: 1, question: "Can someone explain semaphores vs mutex in OS? I have an exam tomorrow.", subject: "Operating Systems", year: "2nd Year", expert: "Arjun Mehta (3rd Year)", status: "Answered", answers: 3, emoji: "💻" },
  { id: 2, question: "What's the difference between malloc and calloc in C?", subject: "C Programming", year: "1st Year", expert: "Priya Sharma (2nd Year)", status: "Answered", answers: 2, emoji: "📟" },
  { id: 3, question: "How to solve recurrence relations using Master Theorem?", subject: "Data Structures", year: "2nd Year", expert: null, status: "Open", answers: 0, emoji: "📊" },
  { id: 4, question: "I'm confused about Laplace transforms — when do we use them?", subject: "Mathematics", year: "1st Year", expert: "Rohan Verma (3rd Year)", status: "In Progress", answers: 1, emoji: "📐" },
];

const subjects = ["Operating Systems", "C Programming", "Data Structures", "Mathematics", "Physics", "DBMS", "Computer Networks", "Other"];

const statusConfig = {
  Open: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  "In Progress": "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  Answered: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
};

export default function DoubtPortal() {
  const [activeTab, setActiveTab] = useState("browse");
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [routing, setRouting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!question.trim() || !subject || !year) return setError("Please fill in all fields.");
    setError("");
    setRouting(true);
    setTimeout(() => {
      setRouting(false);
      setSubmitted({ subject, expert: "Arjun Mehta (3rd Year CS)", eta: "~15 minutes" });
    }, 2000);
  };

  return (
    <div style={accentVars(svc)} className="mx-auto max-w-4xl animate-fade-up">
      <PageHeader
        eyebrow="Campus service"
        title="Doubt Portal"
        description="Post your academic doubts — AI routes them to the right senior student expert."
        icon={svc.icon}
        accent={svc.accent}
        soft={svc.soft}
      />
      <PreviewBanner>Real-time routing to seniors is coming soon. Explore the interface below.</PreviewBanner>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "browse", label: "Browse doubts", icon: MessagesSquare },
          { id: "ask", label: "Ask a doubt", icon: Hand },
        ]}
      />

      {activeTab === "browse" && (
        <div className="space-y-3 animate-fade-in">
          {mockDoubts.map((d) => (
            <div key={d.id} className="card group p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-2xl ring-1 ring-inset ring-emerald-100">
                  {d.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    <span className={`chip ${statusConfig[d.status]}`}>{d.status}</span>
                    <span className="chip bg-slate-100 text-slate-600">{d.subject}</span>
                    <span className="text-xs text-slate-400">{d.year}</span>
                  </div>
                  <p className="font-semibold leading-relaxed text-ink">{d.question}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    {d.expert ? (
                      <span className="flex items-center gap-1.5">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white">
                          <GraduationCap className="h-3 w-3" />
                        </span>
                        Routed to <b className="font-semibold text-slate-700">{d.expert}</b>
                      </span>
                    ) : (
                      <span className="text-slate-400">⏳ Awaiting expert assignment</span>
                    )}
                    <span className="flex items-center gap-1 font-semibold">
                      <MessagesSquare className="h-3.5 w-3.5" /> {d.answers}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "ask" && !submitted && (
        <div className="card card-pad space-y-5 animate-fade-in">
          <div>
            <label className="label" htmlFor="q">
              Your question
            </label>
            <textarea
              id="q"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={5}
              placeholder="e.g. Can someone explain how virtual memory works? I'm confused about page tables…"
              className="field resize-none leading-relaxed"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="subject">
                Subject
              </label>
              <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="field">
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="label">Your year</span>
              <div className="grid grid-cols-3 gap-2">
                {["1st Year", "2nd Year", "3rd Year"].map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYear(y)}
                    className={`rounded-2xl border py-3 text-sm font-bold transition-all ${
                      year === y ? "border-emerald-500 bg-emerald-500 text-white shadow-soft" : "border-slate-200 bg-slate-50/70 text-slate-600 hover:border-emerald-300"
                    }`}
                  >
                    {y.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <Alert>{error}</Alert>}

          <button onClick={handleSubmit} disabled={routing} className="btn-accent btn-lg w-full">
            {routing ? (
              <>
                <Spinner /> AI is routing your doubt…
              </>
            ) : (
              <>
                Ask &amp; route <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      )}

      {activeTab === "ask" && submitted && (
        <SuccessState
          icon={GraduationCap}
          title="Doubt routed!"
          action={
            <button
              onClick={() => {
                setSubmitted(null);
                setQuestion("");
                setSubject("");
                setYear("");
              }}
              className="btn-accent"
            >
              Ask another
            </button>
          }
        >
          <p>
            Your <b className="text-slate-700">{submitted.subject}</b> question has been assigned to:
          </p>
          <div className="mx-auto flex max-w-xs items-center gap-3 rounded-2xl bg-emerald-50 p-3 text-left ring-1 ring-inset ring-emerald-100">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-white">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-bold text-emerald-900">{submitted.expert}</div>
              <div className="text-xs text-emerald-700">Expected response {submitted.eta}</div>
            </div>
          </div>
        </SuccessState>
      )}
    </div>
  );
}
