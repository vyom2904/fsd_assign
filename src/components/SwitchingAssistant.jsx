import { useEffect, useMemo, useState } from 'react';
import { Repeat, CheckCircle2, Circle } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { LISTINGS } from '../data/listings.js';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const DEFAULT_STEPS = [
  'Check notice period', 'Submit notice to current PG', 'Confirm deposit settlement',
  'Find new PG', 'Confirm new PG', 'Upload move-out evidence', 'Complete move-out', 'Track deposit refund',
];

export default function SwitchingAssistant({ className = '' }) {
  const { user, token } = useAuth();
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ currentPGId: 'sunrise-house', currentRent: 8500, deposit: 17000, noticePeriodDays: 30, deductions: 1000 });

  // Load last plan for logged-in user
  useEffect(() => {
    if (!user) return;
    api.switching.mine(token).then((rows) => { if (rows.length) setPlan(rows[0]); }).catch(() => {});
  }, [user, token]);

  const calc = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + Number(form.noticePeriodDays || 0));
    return {
      earliestMoveOut: d,
      refund: Math.max(0, Number(form.deposit || 0) - Number(form.deductions || 0)),
    };
  }, [form]);

  const create = async () => {
    if (!user) { alert('Sign in first to save your switching plan.'); return; }
    setBusy(true);
    try {
      const r = await api.switching.create({
        currentPGId: form.currentPGId,
        currentRent: Number(form.currentRent) || 0,
        deposit: Number(form.deposit) || 0,
        noticePeriodDays: Number(form.noticePeriodDays) || 0,
        deductions: Number(form.deductions) || 0,
      }, token);
      setPlan(r.plan);
    } catch (ex) {
      alert(ex.message || 'Could not create plan');
    } finally { setBusy(false); }
  };

  const toggleStep = async (index) => {
    if (!plan) return;
    try {
      const r = await api.switching.step(plan._id, { index, done: !plan.steps?.[index]?.done }, token);
      setPlan({ ...plan, steps: r.steps.map((s, i) => ({ i, label: DEFAULT_STEPS[i], ...s })) });
    } catch (ex) {
      alert(ex.message || 'Could not update step');
    }
  };

  const list = plan
    ? plan.steps.map((s, i) => ({ i, label: s.label || DEFAULT_STEPS[i], done: s.done }))
    : null;
  const pct = list ? Math.round((list.filter((s) => s.done).length / list.length) * 100) : 0;

  const input = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[12.5px] text-white outline-none focus:border-bronze/50';

  // Alternative PGs: fits current rent, honest availability wording
  const alternatives = LISTINGS.filter((l) => l.id !== plan?.currentPGId && l.id !== form.currentPGId)
    .slice(0, 3)
    .map((l) => ({
      ...l,
      fits: l.rent <= (Number(form.currentRent) || 99999),
      availLabel: l.bedsAvailable > 2 ? 'Available' : l.bedsAvailable > 0 ? 'Limited beds' : 'Currently Full',
    }));

  return (
    <div className={`rounded-[20px] border border-white/10 bg-card p-5 ${className}`}>
      <p className="flex items-center gap-2 text-[13px] font-semibold"><Repeat size={14} className="text-bronze" /> PG Switching Assistant</p>

      {/* ── Planner form ── */}
      <div className="mt-4 space-y-2">
        <label className="block text-[11px] uppercase tracking-[0.18em] text-white/45">Current PG</label>
        <select className={input} value={form.currentPGId} onChange={(e) => {
          const l = LISTINGS.find((x) => x.id === e.target.value);
          setForm({ ...form, currentPGId: e.target.value, currentRent: l?.rent || form.currentRent, deposit: l?.trueCost?.deposit || form.deposit });
        }}>
          {LISTINGS.map((l) => <option key={l.id} value={l.id} className="bg-[#1c1c1c]">{l.name} — {fmt(l.rent)}/mo</option>)}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-white/45">Monthly rent (₹)</label>
            <input type="number" min="0" className={input} value={form.currentRent} onChange={(e) => setForm({ ...form, currentRent: e.target.value })} />
          </div>
          <div>
            <label className="block text-[11px] text-white/45">Security deposit (₹)</label>
            <input type="number" min="0" className={input} value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} />
          </div>
          <div>
            <label className="block text-[11px] text-white/45">Notice period (days)</label>
            <input type="number" min="0" className={input} value={form.noticePeriodDays} onChange={(e) => setForm({ ...form, noticePeriodDays: e.target.value })} />
          </div>
          <div>
            <label className="block text-[11px] text-white/45">Expected deductions (₹)</label>
            <input type="number" min="0" className={input} value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} />
          </div>
        </div>
      </div>

      {/* ── Calculations (estimates) ── */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">Earliest move-out</p>
          <p className="mt-1 font-serif text-lg">{fmtDate(calc.earliestMoveOut)}</p>
          <p className="text-[10px] text-white/35">Today + {form.noticePeriodDays || 0} days notice</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">Estimated refund</p>
          <p className="mt-1 font-serif text-lg text-emerald-300">{fmt(calc.refund)}</p>
          <p className="text-[10px] text-white/35">Deposit − deductions</p>
        </div>
      </div>

      {/* ── Alternatives ── */}
      <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-white/45">Alternative PGs</p>
      <div className="mt-2 space-y-2">
        {alternatives.map((l) => (
          <div key={l.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
            <span className="flex-1 text-[12px] text-white/80">{l.name}</span>
            <span className="text-[11.5px] text-bronze">{fmt(l.rent)}/mo</span>
            <span className={`text-[10.5px] ${l.bedsAvailable ? 'text-emerald-300' : 'text-rose-300'}`}>{l.availLabel}</span>
            {l.fits && <span className="text-[10.5px] text-emerald-300">✓ Fits</span>}
          </div>
        ))}
      </div>

      {!user && <p className="mt-3 text-[11px] text-amber-300">Sign in to save this plan and mark steps done.</p>}
      {!plan && (
        <button onClick={create} disabled={busy}
          className="mt-4 w-full rounded-full bg-white py-2.5 text-[13px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-50">
          {busy ? 'Creating…' : 'Create step-by-step plan'}
        </button>
      )}

      {/* ── 8-step plan + progress ── */}
      {user && plan && list && (
        <div className="mt-5 border-t border-white/[0.08] pt-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Switching plan progress</p>
            <span className="text-[12px] font-semibold text-bronze">{pct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-bronze transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>

          <div className="mt-3 space-y-1.5">
            {list.map((s) => (
              <button key={s.i} onClick={() => toggleStep(s.i)}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-white/[0.04]">
                {s.done ? <CheckCircle2 size={15} className="shrink-0 text-emerald-400" /> : <Circle size={15} className="shrink-0 text-white/30" />}
                <span className={`text-[12.5px] ${s.done ? 'text-white/40 line-through' : 'text-white/85'}`}>
                  STEP {s.i + 1} · {s.label}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10.5px] text-white/35">Tap a step to mark it done. Saved to your account automatically.</p>
        </div>
      )}
    </div>
  );
}
