import { useState } from 'react';
import { PackageCheck, ClipboardCheck, Ticket, Plus } from 'lucide-react';
import useComplaints from '../hooks/useComplaints.js';

const CHECKLIST = [
  'Carry token receipt + signed agreement copy',
  'ID proof & 2 passport photos for the register',
  'Collect keys + get the WiFi password written down',
  'Photo of the electricity meter reading (day 1)',
  'Save owner & warden numbers as emergency contacts',
  'Confirm deposit receipt is signed and stamped',
];

const PACKING = [
  'Bedding: bedsheet, pillow, blanket (mattress provided)',
  'Bucket & mug, toiletries, 2 towels',
  'Extension board + 2-pin to 3-pin adapters',
  'Desk lamp for late-night study',
  'Lock for the cupboard / almirah',
  'Medicines + first-aid basics',
];

const CATEGORIES = ['Maintenance', 'WiFi', 'Food', 'Water', 'Electricity', 'Other'];

export default function AfterBooking({ listing }) {
  const [done, setDone] = useState({});
  const [showTicket, setShowTicket] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Maintenance');
  const { mine, file } = useComplaints();

  const tick = (k) => setDone((d) => ({ ...d, [k]: !d[k] }));
  const section = (label, icon, items) => {
    const Icon = icon;
    return (
      <div>
        <p className="flex items-center gap-2 text-[12.5px] font-semibold"><Icon size={13} className="text-bronze" /> {label}</p>
        <div className="mt-2 space-y-1.5">
          {items.map((it) => (
            <button key={it} onClick={() => tick(it)} className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-[12px] transition ${done[it] ? 'border-emerald-400/30 bg-emerald-400/[0.07] text-emerald-200' : 'border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25'}`}>
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${done[it] ? 'border-emerald-300 bg-emerald-300/20' : 'border-white/30'}`}>
                {done[it] && <span className="text-[9px]">✓</span>}
              </span>
              <span className={done[it] ? 'line-through opacity-70' : ''}>{it}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-[20px] border border-emerald-400/25 bg-emerald-400/[0.04] p-5">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-emerald-200">
        <PackageCheck size={14} /> You're moving in — here's your kit
      </p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {section('Move-in checklist', ClipboardCheck, CHECKLIST)}
        {section('Packing list', PackageCheck, PACKING)}
      </div>

      {/* Complaint ticket — post-booking */}
      <div className="mt-5 border-t border-white/[0.08] pt-4">
        {!showTicket ? (
          <button onClick={() => setShowTicket(true)} className="flex items-center gap-1.5 text-[12.5px] text-bronze hover:underline">
            <Plus size={13} /> Something broken already? Raise a complaint ticket
          </button>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-card p-4">
            <p className="flex items-center gap-2 text-[12.5px] font-semibold"><Ticket size={13} className="text-bronze" /> New complaint ticket</p>
            <form
              className="mt-3 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!title.trim()) return;
                file(listing.id, title.trim(), category);
                setTitle('');
                setShowTicket(false);
              }}
            >
              <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Geyser not heating in bathroom 2" className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[12.5px] outline-none focus:border-bronze/50" />
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button type="button" key={c} onClick={() => setCategory(c)} className={`rounded-full border px-2.5 py-1 text-[11px] transition ${category === c ? 'border-bronze/60 bg-bronze/15 text-bronze' : 'border-white/10 text-white/55'}`}>{c}</button>
                ))}
              </div>
              <button type="submit" className="w-full rounded-full bg-white py-2 text-[12.5px] font-semibold text-black hover:bg-white/90">File ticket</button>
            </form>
          </div>
        )}
        {mine.filter((t) => t.listingId === listing.id).map((t) => (
          <p key={t.id} className="mt-2 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-3 py-2 text-[11.5px] text-amber-200">
            🎫 {t.title} — <span className="font-medium">{t.status}</span> · {t.category} · owner notified
          </p>
        ))}
      </div>
    </div>
  );
}
