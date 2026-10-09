import { useState } from 'react';
import { ReceiptText, ChevronDown } from 'lucide-react';

export default function TrueCost({ listing, size = 'sm' }) {
  const [open, setOpen] = useState(false);
  const t = listing.trueCost;
  if (!t) return null;
  const total = listing.rent + t.electricity + t.food + t.maintenance;

  if (size === 'sm') {
    return (
      <p className="text-[11px] text-white/50">
        <span className="text-white/80">₹{total.toLocaleString('en-IN')}</span> true monthly cost
      </p>
    );
  }

  const rows = [
    ['Rent', listing.rent],
    ['Electricity (est.)', t.electricity],
    ['Food / mess', t.food],
    ['Maintenance', t.maintenance],
  ];

  return (
    <div className="rounded-[20px] border border-white/10 bg-card p-5">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <span className="flex items-center gap-2 text-[13px] font-semibold">
          <ReceiptText size={14} className="text-bronze" /> Price Honesty — true monthly cost
        </span>
        <span className="flex items-center gap-2">
          <span className="font-serif text-xl text-bronze">₹{total.toLocaleString('en-IN')}</span>
          <ChevronDown size={15} className={`text-white/50 transition ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {open && (
        <div className="mt-4 space-y-2 border-t border-white/[0.08] pt-4">
          {rows.map(([label, val]) => (
            <div key={label} className="flex justify-between text-[12.5px]">
              <span className="text-white/55">{label}</span>
              <span className="text-white/85">₹{val.toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-white/[0.08] pt-2 text-[12.5px]">
            <span className="text-white/55">Security deposit (one-time, refundable)</span>
            <span className="text-white/85">₹{t.deposit.toLocaleString('en-IN')}</span>
          </div>
          <p className="pt-1 text-[11px] text-white/40">{t.note}</p>
        </div>
      )}
    </div>
  );
}
