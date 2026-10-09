import { useEffect, useState } from 'react';
import { TrendingUp, ArrowDownUp } from 'lucide-react';
import { api } from '../api.js';

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;

// Bar chart of rent over time + change summary. Transparent about data source.
export default function PriceHistory({ listingId, currentRent }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let live = true;
    api.price.history(listingId).then((r) => live && setRows(r)).catch(() => { live && setRows([]); });
    return () => { live = false; };
  }, [listingId]);

  if (rows === null) return <p className="text-[12px] text-white/40">Loading price history…</p>;

  if (!rows.length) {
    return (
      <p className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 text-[12px] text-white/50">
        No rent changes recorded yet. Every owner rent change is recorded here automatically — never invented.
      </p>
    );
  }

  const points = rows.map((r) => ({ date: r.effectiveDate, price: r.newPrice }));
  const max = Math.max(...points.map((p) => p.price), currentRent);
  const min = Math.min(...points.map((p) => p.price), currentRent);
  const range = max - min || 1;

  const first = rows[0].oldPrice;
  const last = rows[rows.length - 1].newPrice;
  const diff = last - first;
  const months = rows.length > 1 ? monthDiff(rows[0].effectiveDate, rows[rows.length - 1].effectiveDate) : null;

  return (
    <div>
      {rows.length === 1 ? (
        <p className="text-[12px] text-white/55">
          {diff === 0 ? 'Rent unchanged since the first record.'
            : diff > 0 ? `Rent increased from ${fmt(first)} to ${fmt(last)}.`
            : `Rent decreased from ${fmt(first)} to ${fmt(last)}.`}
        </p>
      ) : (
        <p className={`flex items-center gap-1.5 text-[12.5px] font-medium ${diff > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
          {diff > 0 ? <TrendingUp size={13} /> : <ArrowDownUp size={13} />}
          Rent {diff > 0 ? 'increased' : 'decreased'} by {fmt(Math.abs(diff))}{months > 0 ? ` over the last ${months} month${months > 1 ? 's' : ''}` : ''}.
        </p>
      )}

      <div className="mt-4 flex h-28 items-end gap-2 sm:gap-3">
        {points.map((p, i) => {
          const pct = 100 - ((p.price - min) / range) * 68 - 32;
          return (
            <div key={`${p.date}-${i}`} className="group flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] text-white/0 transition group-hover:text-white/70">{fmt(p.price)}</span>
              <div className="flex h-20 w-full max-w-[38px] items-end">
                <div className="w-full rounded-t-md bg-gradient-to-t from-bronze/40 to-bronze"
                  style={{ height: `${pct}%` }} />
              </div>
              <span className="text-[9.5px] text-white/40">{prettyDate(p.date)}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.08]">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-white/[0.04] text-[10px] uppercase tracking-[0.15em] text-white/40">
            <tr><th className="px-3 py-2">Effective</th><th className="px-3 py-2">Old → New</th><th className="px-3 py-2">Changed by</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t border-white/[0.06]">
                <td className="px-3 py-2 text-white/70">{prettyDate(r.effectiveDate)}</td>
                <td className="px-3 py-2">
                  <span className="text-white/50">{fmt(r.oldPrice)}</span> → <span className="font-medium">{fmt(r.newPrice)}</span>
                </td>
                <td className="px-3 py-2 text-white/50">{r.changedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-white/35">
        <ArrowDownUp size={10} /> Actual database records — added when the owner changes the rent. Never estimated.
      </p>
    </div>
  );
}

function prettyDate(d) {
  try {
    return new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  } catch { return d; }
}

function monthDiff(a, b) {
  const da = new Date(a), db = new Date(b);
  return (db.getFullYear() - da.getFullYear()) * 12 + (db.getMonth() - da.getMonth());
}
