import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const root = createRoot(document.getElementById("root"));

if (!PUBLISHABLE_KEY) {
  // Show a readable setup hint instead of a blank white page.
  root.render(
    <div className="grid min-h-screen place-items-center p-6">
      <div className="card card-pad max-w-md text-center">
        <h1 className="text-xl font-extrabold text-ink">Missing Clerk key</h1>
        <p className="mt-2 text-sm text-slate-500">
          Add <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">VITE_CLERK_PUBLISHABLE_KEY</code> to{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">frontend/.env</code> and restart the dev server.
        </p>
      </div>
    </div>
  );
} else {
  root.render(
    <StrictMode>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
        appearance={{
          variables: { colorPrimary: "#7c3aed", borderRadius: "0.9rem", fontFamily: '"Plus Jakarta Sans", sans-serif' },
        }}
      >
        <App />
      </ClerkProvider>
    </StrictMode>
  );
}
