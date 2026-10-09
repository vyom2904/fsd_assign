import { useEffect, useMemo, useState } from 'react';
import { Wallet, CheckCircle2, AlertTriangle, Link2 } from 'lucide-react';
import { BUDGET_CATS, BUDGET_KEY } from './budgetConstants.js';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// Budget Survival Planner — an expense-planning tool, not financial advice.
export default function BudgetPlanner({ className = '', prefillPG = null }) {
  const [budget, setBudget] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BUDGET_KEY))?.budget || 15000; } catch { return 15000; }
  });
  const [vals, setVals] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BUDGET_KEY))?.vals || { rent: 8000, food: 2000, electricity: 600, wifi: 300, transport: 1500, laundry: 200, personal: 2000, other: 500 }; } catch { return {}; }
  });
  const [comparePG, setComparePG] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BUDGET_KEY))?.comparePG || null; } catch { return null; }
  });

  useEffect(() => {
    try { localStorage.setItem(BUDGET_KEY, JSON.stringify({ budget, vals, comparePG })); } catch { /* ignore */ }
  }, [budget, vals, comparePG]);

  // "Use This PG" on the detail page pre-fills the rent row
  useEffect(() => {
    if (prefillPG) setVals((v) => ({ ...v, rent: prefillPG.rent }));
  }, [prefillPG]);

  const total = useMemo(() => Object.values(vals).reduce((s, n) => s + Number(n || 0), 0), [vals]);
  const remaining = budget - total;
  const over = remaining < 0;

  const row = (key, label) => (
    <div key={key} className="flex items-center gap-2">
      <span className="w-[110px] shrink-0 text-[11.5px] text-white/55">{label}</span>
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-white/30">₹</span>
        <input type="number" min="0" value={vals[key] ?? ''}
          onChange={(e) => setVals({ ...vals, [key]: Number(e.target.value) })}
          className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-1.5 pl-6 pr-2 text-[12px] text-white outline-none focus:border-bronze/50" />
      </div>
    </div>
  );

  const barColor = ['bg-bronze', 'bg-emerald-400/70', 'bg-amber-400/70', 'bg-sky-400/70', 'bg-violet-400/70', 'bg-pink-400/70', 'bg-cyan-400/70', 'bg-white/30'];

  return (
    <div className={`rounded-[20px] border border-white/10 bg-card p-5 ${className}`}>
      <p className="flex items-center gap-2 text-[13px] font-semibold"><Wallet size={14} className="text-bronze" /> Budget Survival Planner</p>
      <p className="mt-1 text-[11px] text-white/40">An expense-planning tool — not financial advice.</p>

      <label className="mt-4 block text-[11px] uppercase tracking-[0.18em] text-white/45">
        Total monthly budget — {fmt(budget)}
      </label>
      <input type="range" min="5000" max="40000" step="500" value={budget}
        onChange={(e) => setBudget(Number(e.target.value))}
        className="mt-1 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-bronze" />

      <div className="mt-3 space-y-1.5">
        {BUDGET_CATS.map((c) => row(c.key, c.label))}
      </div>

      {/* Stacked bar */}
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/5">
        {BUDGET_CATS.map((c, i) => (
          <div key={c.key} className={barColor[i]} title={`${c.label}: ${fmt(vals[c.key])}`}
            style={{ width: `${Math.max(0, (Number(vals[c.key]) / Math.max(total, budget)) * 100)}%` }} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">Total monthly expense</p>
          <p className="mt-1 font-serif text-xl">{fmt(total)}</p>
        </div>
        <div className={`rounded-xl border p-3 ${over ? 'border-rose-400/30 bg-rose-400/[0.06]' : 'border-emerald-400/25 bg-emerald-400/[0.06]'}`}>
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">Remaining budget</p>
          <p className={`mt-1 font-serif text-xl ${over ? 'text-rose-300' : 'text-emerald-300'}`}>{fmt(remaining)}</p>
        </div>
      </div>

      <div className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-[12px] ${over ? 'bg-rose-400/10 text-rose-200' : 'bg-emerald-400/10 text-emerald-200'}`}>
        {over ? <AlertTriangle size={14} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={14} className="mt-0.5 shrink-0" />}
        {over
          ? `Your estimated expenses exceed your monthly budget by ${fmt(Math.abs(remaining))}.`
          : `Your estimated monthly expenses fit within your budget.`}
      </div>

      {/* PG cost comparison (planner tool, not recommendations) */}
      {prefillPG && !comparePG && (
        <button onClick={() => setComparePG(prefillPG.id)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-white/15 py-2 text-[11.5px] text-white/70 hover:border-bronze/50 hover:text-bronze">
          <Link2 size={12} /> Remember this PG for cost comparison
        </button>
      )}
      {comparePG && prefillPG && comparePG !== prefillPG.id && (
        <div className="mt-3 rounded-xl border border-sky-400/25 bg-sky-400/[0.06] p-3 text-[12px] text-white/70">
          Compared with budgeted PG rent {fmt(vals.rent)} — this PG is {fmt(prefillPG.rent)} ({prefillPG.rent > vals.rent ? '+' : ''}{fmt(prefillPG.rent - vals.rent)}/mo difference).
        </div>
      )}
    </div>
  );
}
