import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center text-center animate-fade-up">
      <span className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-inset ring-violet-100">
        <Compass className="h-8 w-8" />
      </span>
      <p className="font-mono text-sm font-bold text-violet-600">404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">This page wandered off campus</h1>
      <p className="mt-3 text-slate-500">The link might be broken, or the page may have moved.</p>
      <Link to="/" className="btn-dark mt-8">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>
    </div>
  );
}
