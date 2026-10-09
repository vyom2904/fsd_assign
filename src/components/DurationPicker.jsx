import { useState } from 'react';
import { CalendarRange } from 'lucide-react';
import { DURATIONS } from '../data/listings.js';
import { priceForStay } from '../utils/intelligence.js';

export default function DurationPicker({ listing, className = '' }) {
  const [sel, setSel] = useState('6m');
  const d = DURATIONS.find((x) => x.id === sel);
  const p = priceForStay(listing, d);

  return (
    <div className={`rounded-[20px] border border-white/10 bg-card p-5 ${className}`}>
      <p className="flex items-center gap-2 text-[13px] font-semibold">
        <CalendarRange size={14} className="text-bronze" /> Flexible stays
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {DURATIONS.map((x) => (
          <button
            key={x.id}
            onClick={() => setSel(x.id)}
            className={`rounded-2xl border px-2 py-2.5 text-center text-[11px] transition ${
              sel === x.id ? 'border-bronze/60 bg-bronze/10 text-bronze' : 'border-white/10 bg-white/[0.04] text-white/60 hover:border-white/30'
            }`}
          >
            <span className="block font-medium">{x.label.split('·')[0].trim()}</span>
            <span className="mt-0.5 block text-[10px] opacity-70">{x.id === '12m' ? '−10%' : x.id === '1m' ? '+15%' : 'standard'}</span>
          </button>
        ))}
      </div>
      {p && (
        <div className="mt-3 border-t border-white/[0.08] pt-3">
          <p className="flex items-baseline justify-between text-[12.5px]">
            <span className="text-white/55">{d.label}</span>
            <span className="font-medium">₹{p.monthly.toLocaleString('en-IN')}<span className="text-[10.5px] font-normal text-white/40">/month</span></span>
          </p>
          <p className="mt-1 flex items-baseline justify-between text-[12.5px]">
            <span className="text-white/55">Total for {d.months} {d.months === 1 ? 'month' : 'months'}</span>
            <span className="font-serif text-lg text-bronze">₹{p.total.toLocaleString('en-IN')}</span>
          </p>
          <p className="mt-1 text-[11px] text-white/40">{p.note}</p>
        </div>
      )}
    </div>
  );
}
