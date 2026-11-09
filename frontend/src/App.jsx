import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { RedirectToSignIn, SignInButton, SignedIn, SignedOut, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import { ArrowRight, ChevronDown, Lock, LogIn, Menu, X } from "lucide-react";

import { setTokenGetter, warmUp } from "./api";
import { Logo, Spinner } from "./components/ui";
import { services } from "./lib/services";

import Home from "./pages/Home";
import Submit from "./pages/Submit";
import Track from "./pages/Track";
import Admin from "./pages/Admin";
import Canteen from "./pages/Canteen";
import Laundry from "./pages/Laundry";
import LostFound from "./pages/LostFound";
import DoubtPortal from "./pages/DoubtPortal";
import Marketplace from "./pages/Marketplace";
import NotFound from "./pages/NotFound";

// ── Auth helpers ──────────────────────────────────────────────────
function AuthBridge() {
  const { getToken, isSignedIn } = useAuth();
  useEffect(() => {
    setTokenGetter(isSignedIn ? () => getToken() : null);
  }, [getToken, isSignedIn]);
  return null;
}

function useIsAdmin() {
  const { user } = useUser();
  return user?.publicMetadata?.role === "admin";
}

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function AdminRoute() {
  const { isLoaded } = useUser();
  const isAdmin = useIsAdmin();

  if (!isLoaded) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-slate-400">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 text-center animate-fade-up">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-ink text-white shadow-lift">
          <Lock className="h-7 w-7" />
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight text-ink">Admins only</h2>
        <p className="text-slate-500">
          You don&apos;t have admin privileges. Contact your system administrator to get access.
        </p>
        <Link to="/" className="btn-ghost mt-2">
          Back to home
        </Link>
      </div>
    );
  }

  return <Admin />;
}

// ── Navbar ────────────────────────────────────────────────────────
const linkCls = ({ isActive }) =>
  `relative rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
    isActive ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
  }`;

function ServicesMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { pathname } = useLocation();
  const active = services.some((s) => s.path === pathname && s.id !== "complaints");

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={linkCls({ isActive: active || open }) + " flex items-center gap-1"}
      >
        Services
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          onClick={(e) => e.target.closest("a") && setOpen(false)}
          className="absolute left-1/2 top-full z-50 mt-3 w-[560px] -translate-x-1/2 animate-scale-in rounded-3xl border border-slate-200/70 bg-white/95 p-2.5 shadow-lift backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-1">
            {services.map((s) => (
              <Link
                key={s.id}
                to={s.path}
                className="group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-slate-50"
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                  style={{ background: s.soft, color: s.accent }}
                >
                  <s.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
                    {s.title}
                    {s.live && <span className="chip bg-emerald-50 px-1.5 py-0 text-[10px] text-emerald-700">LIVE</span>}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-slate-500">{s.short}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileMenu({ open, isAdmin, onClose }) {
  if (!open) return null;
  return (
    <div
      onClick={(e) => e.target.closest("a") && onClose()}
      className="mx-4 mt-2 animate-scale-in rounded-3xl border border-slate-200/70 bg-white/95 p-3 shadow-lift backdrop-blur-xl md:hidden">
      <div className="grid gap-1">
        <NavLink to="/" end className={linkCls}>
          Home
        </NavLink>
        <SignedIn>
          <NavLink to="/submit" className={linkCls}>
            Submit a complaint
          </NavLink>
          <NavLink to="/track" className={linkCls}>
            Track status
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={linkCls}>
              Dashboard
            </NavLink>
          )}
        </SignedIn>
      </div>
      <div className="micro mb-2 mt-4 px-3.5">Services</div>
      <div className="grid grid-cols-2 gap-1">
        {services.map((s) => (
          <Link key={s.id} to={s.path} className="flex items-center gap-2.5 rounded-2xl p-2.5 hover:bg-slate-50">
            <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: s.soft, color: s.accent }}>
              <s.icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-slate-700">{s.title}</span>
          </Link>
        ))}
      </div>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="btn-dark mt-3 w-full">
            <LogIn className="h-4 w-4" /> Sign in
          </button>
        </SignInButton>
      </SignedOut>
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = useIsAdmin();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="sticky top-0 z-50 pt-3">
      <div
        className={`mx-3 max-w-7xl rounded-2xl transition-all duration-300 sm:mx-4 xl:mx-auto ${
          scrolled || mobileOpen ? "glass shadow-soft" : "border border-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-3 py-2.5 sm:px-4">
          <Link to="/" aria-label="UniSync home" className="rounded-xl">
            <Logo />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={linkCls}>
              Home
            </NavLink>
            <ServicesMenu />
            <SignedIn>
              <NavLink to="/submit" className={linkCls}>
                Submit
              </NavLink>
              <NavLink to="/track" className={linkCls}>
                Track
              </NavLink>
              {isAdmin && (
                <>
                  <span className="mx-1.5 h-5 w-px bg-slate-200" />
                  <NavLink to="/admin" className={linkCls}>
                    Dashboard
                  </NavLink>
                </>
              )}
            </SignedIn>
          </div>

          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-dark hidden px-4 py-2 sm:inline-flex">
                  Sign in <ArrowRight className="h-4 w-4" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 ring-2 ring-white shadow-soft" } }} />
            </SignedIn>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 hover:bg-slate-100 md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      <MobileMenu open={mobileOpen} isAdmin={isAdmin} onClose={() => setMobileOpen(false)} />
    </nav>
  );
}

// ── Footer ────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200/70 bg-white/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-slate-500">
            One AI-powered platform for every campus need — from a broken fan to a late-night Maggi.
          </p>
        </div>
        <div>
          <div className="micro mb-4">Services</div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {services.map((s) => (
              <li key={s.id}>
                <Link to={s.path} className="text-slate-600 transition-colors hover:text-violet-700">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="micro mb-4">Complaints</div>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/submit" className="text-slate-600 transition-colors hover:text-violet-700">
                File a complaint
              </Link>
            </li>
            <li>
              <Link to="/track" className="text-slate-600 transition-colors hover:text-violet-700">
                Track status
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-slate-400 sm:flex-row">
          <span>Built for the AI/ML Hackathon</span>
          <span>Powered by Gemini AI &amp; Clerk</span>
        </div>
      </div>
    </footer>
  );
}

// ── Layout ────────────────────────────────────────────────────────
function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px]">
        <div className="bg-dots mask-fade-b absolute inset-0 opacity-70" />
        {!isHome && (
          <div className="absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />
        )}
      </div>

      <AuthBridge />
      <Navbar />

      <main className={isHome ? "flex-1" : "mx-auto w-full max-w-7xl flex-1 px-4 pb-8 pt-10 sm:px-6 sm:pt-14"}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/submit" element={<ProtectedRoute><Submit /></ProtectedRoute>} />
          <Route path="/track" element={<ProtectedRoute><Track /></ProtectedRoute>} />
          <Route path="/canteen" element={<ProtectedRoute><Canteen /></ProtectedRoute>} />
          <Route path="/laundry" element={<ProtectedRoute><Laundry /></ProtectedRoute>} />
          <Route path="/lost-found" element={<ProtectedRoute><LostFound /></ProtectedRoute>} />
          <Route path="/doubts" element={<ProtectedRoute><DoubtPortal /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute><AdminRoute /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    warmUp();
  }, []);

  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
