import { useEffect, useState } from 'react';
import { CalendarCheck, Info } from 'lucide-react';
import { api } from '../api.js';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Move-In Availability — estimate only. Never claims certainty.
export default function MoveInAvailability({ listingId, listingName }) {
  const [date, setDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 7); // next week default
    return d.toISOString().slice(0, 10);
  });
  const [est, setEst] = useState(null);
  const [busy, setBusy] = useState(false);

  const daysAhead = Math.max(1, Math.round((new Date(date) - new Date()) / 86400000));

  const run = async () => {
    setBusy(true);
    try {
      const r = await api.availability.estimate(listingId, Math.min(90, Math.max(1, daysAhead)));
      setEst(r);
    } catch {
      setEst({ enough: false, note: 'Could not reach the availability service.' });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { run(); /* initial */ }, [listingId]);

  const badge = () => {
    if (!est) return null;
    if (!est.enough) return <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/60">⚠ Availability Uncertain</span>;
    if (est.confidence === 'likely') return <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-medium text-emerald-300">🟢 Likely Available</span>;
    if (est.confidence === 'full') return <span className="rounded-full bg-rose-400/15 px-3 py-1 text-[11px] font-medium text-rose-300">🔴 Currently Full</span>;
    return <span className="rounded-full bg-amber-400/15 px-3 py-1 text-[11px] font-medium text-amber-300">⚠ Availability Uncertain</span>;
  };

  return (
    <div className="rounded-[20px] border border-white/10 bg-card p-5">
      <p className="flex items-center gap-2 text-[13px] font-semibold"><CalendarCheck size={14} className="text-bronze" /> Move-in availability</p>

      <label className="mt-4 block text-[11px] uppercase tracking-[0.18em] text-white/45">Desired move-in date</label>
      <input type="date" value={date} min={new Date().toISOString().slice(0, 10)}
        onChange={(e) => setDate(e.target.value)}
        className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-white outline-none focus:border-bronze/50" />
      <button onClick={run} disabled={busy}
        className="mt-2 w-full rounded-full border border-bronze/50 py-2 text-[12px] font-medium text-bronze transition hover:bg-bronze/10 disabled:opacity-50">
        {busy ? 'Checking…' : `Check availability for ${fmtDate(date)}`}
      </button>

      {est && (
        <>
          <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] font-medium">{listingName}</p>
              {badge()}
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11.5px]">
              <p className="text-white/50">Current available rooms:<span className="ml-1.5 font-medium text-white/85">{est.current}</span></p>
              <p className="text-white/50">Last updated:<span className="ml-1.5 font-medium text-white/85">{est.lastUpdatedAt ? fmtDate(est.lastUpdatedAt) : 'recently'}</span></p>
              {est.enough && (
                <>
                  <p className="text-white/50">For {fmtDate(date)}:<span className="ml-1.5 font-medium text-white/85">≈{est.estimated} room{est.estimated !== 1 ? 's' : ''} (estimate)</span></p>
                </>
              )}
            </div>
          </div>

          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-white/45">
            <Info size={12} className="mt-0.5 shrink-0 text-sky-300" />
            {est.enough
              ? `${est.note} This is an estimate based on past records — availability can change any day. The owner's live count on the booking call always wins.`
              : `${est.note} The owner's live room count above is the reliable source.`}
          </p>
        </>
      )}
    </div>
  );
}
