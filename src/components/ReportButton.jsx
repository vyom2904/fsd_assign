import { useState } from 'react';
import { Flag, X } from 'lucide-react';

const REASONS = [
  'Scam / owner asking money directly',
  'Photos do not match the room',
  'Wrong price or hidden charges',
  'Bed was already full',
  'Safety concern',
  'Other',
];

export default function ReportButton({ listing }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[11.5px] text-white/40 transition hover:text-rose-300"
      >
        <Flag size={11} /> Report this listing
      </button>
      {open && !sent && (
        <div className="absolute bottom-7 right-0 z-30 w-64 rounded-2xl border border-white/15 bg-[#181818] p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold">Why are you reporting?</p>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-white/40 hover:text-white"><X size={12} /></button>
          </div>
          <div className="mt-2 space-y-1">
            {REASONS.map((r) => (
              <button
                key={r}
                onClick={() => { setSent(true); setTimeout(() => { setOpen(false); setSent(false); }, 2200); }}
                className="block w-full rounded-lg px-2.5 py-1.5 text-left text-[11.5px] text-white/65 transition hover:bg-white/[0.06] hover:text-white"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
      {sent && <p className="text-[11.5px] text-emerald-300">✓ Reported — our trust team reviews within 24h</p>}
    </div>
  );
}
