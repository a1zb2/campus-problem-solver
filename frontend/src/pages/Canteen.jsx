import { useState } from "react";
import { Clock, Minus, PartyPopper, Plus, ShoppingCart } from "lucide-react";

import { Alert, PageHeader, PreviewBanner, SuccessState } from "../components/ui";
import { HOSTEL_BLOCKS } from "../lib/complaints";
import { accentVars, serviceById } from "../lib/services";

const svc = serviceById.canteen;

const menu = [
  { id: 1, name: "Rajma Chawal", price: 60, emoji: "🍛", category: "Main Course", time: "20 min", tint: "#fef3c7" },
  { id: 2, name: "Aloo Paratha", price: 40, emoji: "🫓", category: "Breakfast", time: "10 min", tint: "#ffedd5" },
  { id: 3, name: "Maggi", price: 30, emoji: "🍜", category: "Snacks", time: "7 min", tint: "#fef9c3" },
  { id: 4, name: "Paneer Bhurji", price: 70, emoji: "🥘", category: "Main Course", time: "15 min", tint: "#fee2e2" },
  { id: 5, name: "Masala Chai", price: 15, emoji: "☕", category: "Beverages", time: "5 min", tint: "#f5e6d8" },
  { id: 6, name: "Cold Coffee", price: 35, emoji: "🧋", category: "Beverages", time: "5 min", tint: "#ede9fe" },
  { id: 7, name: "Samosa (2 pcs)", price: 20, emoji: "🥟", category: "Snacks", time: "5 min", tint: "#fef3c7" },
  { id: 8, name: "Dal Tadka + Rice", price: 55, emoji: "🫕", category: "Main Course", time: "15 min", tint: "#ffedd5" },
];

const categories = ["All", "Main Course", "Breakfast", "Snacks", "Beverages"];

function Qty({ qty, onAdd, onRemove }) {
  if (!qty) {
    return (
      <button onClick={onAdd} className="btn-accent h-9 px-4 py-0 text-xs" aria-label="Add to cart">
        <Plus className="h-4 w-4" /> Add
      </button>
    );
  }
  return (
    <div className="flex h-9 items-center overflow-hidden rounded-xl text-white shadow-soft" style={{ background: "var(--accent)" }}>
      <button onClick={onRemove} className="grid h-9 w-9 place-items-center hover:bg-black/10" aria-label="Remove one">
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-6 text-center text-sm font-extrabold tabular-nums">{qty}</span>
      <button onClick={onAdd} className="grid h-9 w-9 place-items-center hover:bg-black/10" aria-label="Add one">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function Canteen() {
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState("All");
  const [ordered, setOrdered] = useState(false);
  const [block, setBlock] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");

  const filtered = activeCategory === "All" ? menu : menu.filter((m) => m.category === activeCategory);

  const addToCart = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const removeFromCart = (id) =>
    setCart((c) => {
      const updated = { ...c };
      if (updated[id] > 1) updated[id]--;
      else delete updated[id];
      return updated;
    });

  const cartItems = Object.entries(cart).map(([id, qty]) => ({ ...menu.find((m) => m.id === Number(id)), qty }));
  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const handleOrder = () => {
    if (!block || !room.trim()) return setError("Please enter your block and room number.");
    setError("");
    setOrdered(true);
  };

  if (ordered) {
    return (
      <div style={accentVars(svc)} className="py-6">
        <SuccessState
          icon={PartyPopper}
          title="Order placed!"
          action={
            <button
              onClick={() => {
                setOrdered(false);
                setCart({});
              }}
              className="btn-accent"
            >
              Order again
            </button>
          }
        >
          <p>
            Your food will be delivered to <b className="text-slate-800">Block {block}, Room {room}</b> in about 20–30 minutes.
          </p>
          <div className="rounded-2xl bg-orange-50/70 p-4 text-left ring-1 ring-inset ring-orange-100">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between py-1 text-sm text-slate-700">
                <span>
                  {item.emoji} {item.name} × {item.qty}
                </span>
                <span className="font-bold">₹{item.price * item.qty}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-orange-200/70 pt-2 font-extrabold text-ink">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </SuccessState>
      </div>
    );
  }

  return (
    <div style={accentVars(svc)} className="animate-fade-up">
      <PageHeader
        eyebrow="Campus service"
        title="Canteen"
        description="Order food from the campus canteen. Delivered to your room."
        icon={svc.icon}
        accent={svc.accent}
        soft={svc.soft}
      />
      <PreviewBanner>Online ordering is coming soon. This is a preview of the interface.</PreviewBanner>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} onClick={() => setActiveCategory(c)} data-active={activeCategory === c} className="pill-toggle">
                {c}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((item) => (
              <div key={item.id} className="card group flex items-center gap-4 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                <span
                  className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl text-4xl transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
                  style={{ background: item.tint }}
                >
                  {item.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold text-ink">{item.name}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                    {item.category} · <Clock className="h-3 w-3" /> {item.time}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-ink">₹{item.price}</span>
                    <Qty qty={cart[item.id]} onAdd={() => addToCart(item.id)} onRemove={() => removeFromCart(item.id)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside>
          <div className="card card-pad sticky top-24">
            <h3 className="mb-4 flex items-center gap-2 font-extrabold text-ink">
              <ShoppingCart className="h-5 w-5" style={{ color: svc.accent }} />
              Your order
              {itemCount > 0 && (
                <span className="chip ml-auto text-white" style={{ background: svc.accent }}>
                  {itemCount} item{itemCount > 1 ? "s" : ""}
                </span>
              )}
            </h3>
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 py-10 text-center">
                <span className="text-3xl">🍽️</span>
                <p className="mt-2 text-sm text-slate-400">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2.5">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">
                        {item.emoji} {item.name} <span className="text-slate-400">× {item.qty}</span>
                      </span>
                      <span className="font-bold text-ink">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 text-lg font-extrabold text-ink">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select value={block} onChange={(e) => setBlock(e.target.value)} className="field py-2.5 text-sm" aria-label="Block">
                    <option value="">Block</option>
                    {HOSTEL_BLOCKS.map((b) => (
                      <option key={b} value={b}>
                        Block {b}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Room no."
                    inputMode="numeric"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="field py-2.5 text-sm"
                    aria-label="Room number"
                  />
                </div>
                {error && <Alert>{error}</Alert>}
                <button onClick={handleOrder} className="btn-accent btn-lg w-full">
                  Place order · ₹{total}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
