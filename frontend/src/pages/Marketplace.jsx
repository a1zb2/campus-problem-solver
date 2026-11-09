import { useState } from "react";
import { BadgeIndianRupee, PartyPopper, ShoppingBag, Sparkles, Store, WandSparkles } from "lucide-react";

import { PageHeader, PreviewBanner, Spinner, SuccessState, Tabs } from "../components/ui";
import { accentVars, serviceById } from "../lib/services";

const svc = serviceById.marketplace;

const mockListings = [
  { id: 1, title: "Higher Engineering Mathematics", seller: "Rohan K.", price: 280, condition: "Good", category: "Books", emoji: "📗", age: "2 days ago", tint: "#dcfce7" },
  { id: 2, title: "Usha Room Cooler (40L)", seller: "Priya S.", price: 2500, condition: "Fair", category: "Appliances", emoji: "❄️", age: "1 day ago", tint: "#e0f2fe" },
  { id: 3, title: "Mini Drafter Set", seller: "Amit V.", price: 150, condition: "Like New", category: "Stationery", emoji: "📐", age: "5 hrs ago", tint: "#fef9c3" },
  { id: 4, title: "Casio FX-991EX Calculator", seller: "Sneha R.", price: 600, condition: "Good", category: "Electronics", emoji: "🔢", age: "3 hrs ago", tint: "#ede9fe" },
  { id: 5, title: "Mattress (single, foam)", seller: "Dev M.", price: 800, condition: "Fair", category: "Furniture", emoji: "🛏️", age: "Just now", tint: "#ffe4e6" },
];

const categories = ["All", "Books", "Appliances", "Electronics", "Stationery", "Furniture", "Other"];

const conditionColor = {
  "Like New": "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  Good: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  Fair: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
};

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState("browse");
  const [filterCat, setFilterCat] = useState("All");
  const [nlInput, setNlInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [listed, setListed] = useState(false);

  const filtered = filterCat === "All" ? mockListings : mockListings.filter((l) => l.category === filterCat);

  const handleNLParse = () => {
    if (!nlInput.trim()) return;
    setParsing(true);
    setTimeout(() => {
      const lower = nlInput.toLowerCase();
      let title = "Item";
      let price = 0;
      let condition = "Good";
      let category = "Other";

      const priceMatch = nlInput.match(/₹?\s?(\d+)/);
      if (priceMatch) price = parseInt(priceMatch[1], 10);

      if (lower.includes("book") || lower.includes("textbook")) {
        category = "Books";
        title = "Textbook";
      } else if (lower.includes("cooler") || lower.includes("fan")) {
        category = "Appliances";
        title = "Room Cooler";
      } else if (lower.includes("calculator")) {
        category = "Electronics";
        title = "Calculator";
      } else if (lower.includes("mattress")) {
        category = "Furniture";
        title = "Mattress";
      } else if (lower.includes("drafter")) {
        category = "Stationery";
        title = "Drafter Set";
      }

      if (lower.includes("like new") || /\bnew\b/.test(lower)) condition = "Like New";
      else if (lower.includes("fair") || lower.includes("used") || lower.includes("wear")) condition = "Fair";

      const titleMatch = nlInput.match(/"([^"]+)"/);
      if (titleMatch) title = titleMatch[1];

      setParsed({ title, price, condition, category });
      setParsing(false);
    }, 1500);
  };

  return (
    <div style={accentVars(svc)} className="mx-auto max-w-5xl animate-fade-up">
      <PageHeader
        eyebrow="Campus service"
        title="Marketplace"
        description="Buy and sell campus items. Just describe what you have — AI creates the listing."
        icon={svc.icon}
        accent={svc.accent}
        soft={svc.soft}
      />
      <PreviewBanner>The full marketplace is coming soon. Try the AI listing tool below.</PreviewBanner>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "browse", label: "Browse", icon: ShoppingBag },
          { id: "sell", label: "Sell", icon: Store },
        ]}
      />

      {activeTab === "browse" && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} onClick={() => setFilterCat(c)} data-active={filterCat === c} className="pill-toggle">
                {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No listings in this category yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <div key={item.id} className="card group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <div className="relative grid h-36 place-items-center text-6xl" style={{ background: item.tint }}>
                    <span className="transition-transform duration-300 group-hover:scale-110">{item.emoji}</span>
                    <span className={`chip absolute right-3 top-3 ${conditionColor[item.condition]}`}>{item.condition}</span>
                  </div>
                  <div className="p-5">
                    <div className="font-bold leading-snug text-ink">{item.title}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {item.category} · {item.age}
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <span className="text-2xl font-extrabold tracking-tight text-ink">₹{item.price.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-slate-500">by {item.seller}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "sell" && !listed && (
        <div className="space-y-5 animate-fade-in">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-pink-500 p-6 text-white shadow-[0_24px_50px_-24px_rgba(244,63,94,0.8)] sm:p-7">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
            <div className="relative">
              <h3 className="flex items-center gap-2 text-lg font-extrabold">
                <WandSparkles className="h-5 w-5" /> Describe it, we&apos;ll list it
              </h3>
              <p className="mt-1 text-sm text-rose-50/90">Just type naturally — AI extracts the details and formats a clean listing.</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  value={nlInput}
                  onChange={(e) => setNlInput(e.target.value)}
                  placeholder={`"Selling my maths textbook, slight wear, 300 bucks"`}
                  className="min-w-0 flex-1 rounded-2xl border border-white/30 bg-white/15 px-4 py-3 text-[15px] text-white placeholder:text-rose-50/70 backdrop-blur focus:border-white focus:bg-white/25 focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleNLParse()}
                />
                <button onClick={handleNLParse} disabled={parsing} className="btn bg-white text-rose-600 shadow-lift hover:-translate-y-0.5">
                  {parsing ? <Spinner /> : <Sparkles className="h-4 w-4" />}
                  {parsing ? "Parsing…" : "Parse"}
                </button>
              </div>
            </div>
          </div>

          {parsed && (
            <div className="card card-pad space-y-5 animate-scale-in">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-sm font-bold text-slate-600">AI-generated listing preview</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="micro mb-1.5 block">Item name</label>
                  <input value={parsed.title} onChange={(e) => setParsed({ ...parsed, title: e.target.value })} className="field" />
                </div>
                <div>
                  <label className="micro mb-1.5 block">Price (₹)</label>
                  <div className="relative">
                    <BadgeIndianRupee className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min={0}
                      value={parsed.price}
                      onChange={(e) => setParsed({ ...parsed, price: e.target.value })}
                      className="field pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="micro mb-1.5 block">Category</label>
                  <select value={parsed.category} onChange={(e) => setParsed({ ...parsed, category: e.target.value })} className="field">
                    {categories
                      .filter((c) => c !== "All")
                      .map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="micro mb-1.5 block">Condition</label>
                  <select value={parsed.condition} onChange={(e) => setParsed({ ...parsed, condition: e.target.value })} className="field">
                    <option>Like New</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>
              </div>

              <button onClick={() => setListed(true)} className="btn-accent btn-lg w-full">
                <ShoppingBag className="h-5 w-5" /> Post listing
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "sell" && listed && (
        <SuccessState
          icon={PartyPopper}
          title="Listed!"
          action={
            <button
              onClick={() => {
                setListed(false);
                setParsed(null);
                setNlInput("");
              }}
              className="btn-accent"
            >
              List another item
            </button>
          }
        >
          <p>
            Your <b className="text-slate-700">{parsed.title}</b> is now live on the marketplace for{" "}
            <b className="text-slate-700">₹{parsed.price}</b>.
          </p>
        </SuccessState>
      )}
    </div>
  );
}
