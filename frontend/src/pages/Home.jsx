import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { ArrowRight, ArrowUpRight, Bot, CircleCheckBig, PenLine, Radar, Send, Sparkles } from "lucide-react";

import HeroDemo from "../components/HeroDemo";
import Reveal from "../components/Reveal";
import { CATEGORIES } from "../lib/complaints";
import { serviceById, services } from "../lib/services";

const steps = [
  { icon: PenLine, label: "Describe", sub: "Tell us what's wrong, in your own words." },
  { icon: Bot, label: "AI reads", sub: "Gemini classifies it instantly." },
  { icon: Send, label: "Routed", sub: "Right department, right executive." },
  { icon: Radar, label: "Track", sub: "Live status with your tracking ID." },
  { icon: CircleCheckBig, label: "Resolved", sub: "Admin closes the loop with a response." },
];

const heroPills = [
  { label: "AI accuracy", value: "~90%" },
  { label: "Services", value: "6 live" },
  { label: "Powered by", value: "Gemini AI" },
  { label: "Departments", value: "5 covered" },
];

// Animated counter with ease-out, started when scrolled into view.
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let raf;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - start) / 1400);
          setCount(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

function PrimaryCta({ children, to = "/submit", size = "btn-lg" }) {
  const navigate = useNavigate();
  return (
    <>
      <SignedIn>
        <button onClick={() => navigate(to)} className={`btn-primary ${size} group`}>
          {children}
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <button className={`btn-primary ${size} group`}>
            Get started
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </SignInButton>
      </SignedOut>
    </>
  );
}

function ServiceCard({ s, delay }) {
  return (
    <Reveal delay={delay} className="h-full">
      <Link
        to={s.path}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
        style={{ "--accent": s.accent }}
      >
        <span
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: s.ring }}
        />
        <div className="relative mb-8 flex items-start justify-between">
          <span
            className="grid h-12 w-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
            style={{ background: s.soft, color: s.accent }}
          >
            <s.icon className="h-6 w-6" strokeWidth={2.2} />
          </span>
          <span className="chip" style={{ background: s.soft, color: s.accent }}>
            {s.tag}
          </span>
        </div>
        <div className="relative mt-auto">
          <h3 className="flex items-center gap-1.5 text-lg font-extrabold text-ink">
            {s.title}
            <ArrowUpRight className="h-4 w-4 -translate-x-1 text-slate-300 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" style={{ color: s.accent }} />
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.desc}</p>
        </div>
      </Link>
    </Reveal>
  );
}

function FeaturedComplaintCard() {
  const s = serviceById.complaints;
  return (
    <Reveal className="h-full md:col-span-2 md:row-span-2">
      <Link
        to={s.path}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-700 p-7 text-white shadow-[0_30px_60px_-25px_rgba(79,70,229,0.7)] transition-all duration-300 hover:-translate-y-1 sm:p-9"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sky-400/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-fuchsia-400/25 blur-3xl" />

        <div className="relative flex items-start justify-between">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
            <s.icon className="h-7 w-7" strokeWidth={2.2} />
          </span>
          <span className="chip bg-white/15 text-white ring-1 ring-inset ring-white/25">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> Live · {s.tag}
          </span>
        </div>

        <div className="relative mt-10 max-w-md">
          <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl">File a complaint</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-indigo-100">{s.desc}</p>
        </div>

        <div className="relative mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span key={c.id} className="chip bg-white/10 py-1.5 text-white/90 ring-1 ring-inset ring-white/15 backdrop-blur">
              <c.icon className="h-3.5 w-3.5" /> {c.label}
            </span>
          ))}
        </div>

        <div className="relative mt-auto pt-10">
          <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lift transition-transform group-hover:translate-x-1">
            Start now <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

export default function Home() {
  const others = services.filter((s) => s.id !== "complaints");

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative px-4 pb-20 pt-14 sm:px-6 sm:pt-20">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-28 bottom-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-[-12rem] h-[34rem] w-[34rem] -translate-x-[85%] animate-aurora rounded-full bg-violet-400/25 blur-3xl" />
          <div className="absolute left-1/2 top-[-8rem] h-[30rem] w-[30rem] -translate-x-[10%] animate-aurora rounded-full bg-sky-300/25 blur-3xl" style={{ animationDelay: "-6s" }} />
          <div className="absolute left-1/2 top-[14rem] h-[22rem] w-[22rem] -translate-x-1/2 animate-aurora rounded-full bg-indigo-300/20 blur-3xl" style={{ animationDelay: "-12s" }} />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-violet-200/80 bg-white/80 py-1.5 pl-2 pr-2 text-xs font-bold text-violet-700 shadow-soft backdrop-blur">
              <span className="relative grid h-5 w-5 place-items-center rounded-full bg-violet-100">
                <Sparkles className="h-3 w-3" />
              </span>
              AI-Powered Campus Platform
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                LIVE
              </span>
            </span>
          </div>

          <h1
            className="mt-8 animate-fade-up text-[3.2rem] font-extrabold leading-[0.98] tracking-[-0.035em] text-ink sm:text-7xl md:text-8xl lg:text-[7rem]"
            style={{ animationDelay: "80ms" }}
          >
            Your campus<span className="-ml-[0.06em]">,</span>
            <br />
            <span className="relative inline-block bg-gradient-to-r from-violet-600 via-indigo-500 to-sky-500 bg-[length:200%_auto] bg-clip-text pb-2 text-transparent animate-gradient-x">
              reimagined<span className="-ml-[0.04em]">.</span>
            </span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-slate-500 sm:text-xl"
            style={{ animationDelay: "160ms" }}
          >
            One platform for complaints, canteen orders, laundry, lost &amp; found, and more —{" "}
            <span className="font-semibold text-slate-800">all routed by AI instantly.</span>
          </p>

          <div className="mt-10 flex animate-fade-up flex-col justify-center gap-3 sm:flex-row" style={{ animationDelay: "240ms" }}>
            <PrimaryCta>File a complaint</PrimaryCta>
            <Link to="/track" className="btn-ghost btn-lg">
              Track status
            </Link>
          </div>

          <div className="mt-12 flex animate-fade-up justify-center" style={{ animationDelay: "320ms" }}>
            <dl className="glass grid grid-cols-2 divide-slate-200/70 rounded-2xl shadow-soft sm:grid-cols-4 sm:divide-x">
              {heroPills.map((p) => (
                <div key={p.label} className="px-6 py-3 text-center">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{p.label}</dt>
                  <dd className="mt-0.5 text-sm font-extrabold text-ink">{p.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl animate-fade-up sm:mt-20" style={{ animationDelay: "420ms" }}>
          <HeroDemo />
        </div>
      </section>

      {/* ── SERVICES BENTO ───────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow mb-3 text-violet-600">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-600" /> Student portal
              </p>
              <h2 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
                Everything you need,
                <br />
                <span className="text-slate-400">right here.</span>
              </h2>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-slate-500">
              Six campus services in one place. Sign in once and get everything from room repairs to a cold coffee.
            </p>
          </Reveal>

          <div className="grid auto-rows-[minmax(220px,auto)] gap-4 md:grid-cols-3 md:gap-5">
            <FeaturedComplaintCard />
            {others.map((s, i) => (
              <ServiceCard key={s.id} s={s} delay={i * 70} />
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────────────────── */}
      <section className="px-4 py-8 sm:px-6">
        <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-ink px-6 py-14 sm:px-12">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:44px_44px]" />
          <div aria-hidden className="pointer-events-none absolute -left-20 -top-32 h-80 w-80 rounded-full bg-violet-600/40 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 right-0 h-80 w-96 rounded-full bg-sky-500/25 blur-3xl" />
          <div className="relative grid grid-cols-2 gap-y-10 text-center md:grid-cols-4">
            {[
              { value: 90, suffix: "%", label: "AI classification accuracy" },
              { value: 6, suffix: "+", label: "Campus services" },
              { value: 5, suffix: "", label: "Departments connected" },
              { value: 30, suffix: "s", label: "Avg. routing time" },
            ].map((stat) => (
              <div key={stat.label} className="md:border-l md:border-white/10 md:first:border-l-0">
                <div className="bg-gradient-to-b from-white to-indigo-200 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent md:text-6xl">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-2 text-sm font-medium text-indigo-200/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-16 text-center">
            <p className="eyebrow mb-3 justify-center text-violet-600">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600" /> How it works
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Complaint in <span className="text-gradient">30 seconds.</span>
            </h2>
          </Reveal>

          <div className="relative">
            <div aria-hidden className="absolute left-[10%] right-[10%] top-9 hidden h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent md:block" />
            <ol className="grid gap-4 md:grid-cols-5 md:gap-6">
              {steps.map((step, i) => (
                <Reveal as="li" key={step.label} delay={i * 90} className="group relative flex items-start gap-4 rounded-3xl p-2 md:flex-col md:items-center md:text-center">
                  <span className="relative shrink-0">
                    <span className="grid h-[72px] w-[72px] place-items-center rounded-3xl border border-slate-200/80 bg-white text-violet-600 shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:border-violet-200 group-hover:shadow-glow">
                      <step.icon className="h-7 w-7" strokeWidth={2} />
                    </span>
                    <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-[11px] font-extrabold text-white shadow-md ring-2 ring-[#f7f7fb]">
                      {i + 1}
                    </span>
                  </span>
                  <div className="pt-2 md:pt-1">
                    <div className="font-extrabold text-ink">{step.label}</div>
                    <div className="mt-1 text-sm leading-snug text-slate-500">{step.sub}</div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6">
        <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-violet-200/60 bg-gradient-to-br from-violet-50 via-white to-sky-50 px-6 py-16 text-center shadow-soft sm:px-12">
          <div aria-hidden className="bg-dots mask-fade-b pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Something broken on campus?
              <span className="block text-gradient">Let AI route it.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-slate-500">
              Describe it once. We&apos;ll get it to the right desk and keep you posted until it&apos;s fixed.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <PrimaryCta>Try it now</PrimaryCta>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
