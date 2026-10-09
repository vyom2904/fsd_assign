import { useState } from 'react';
import { CalendarCheck, CheckCircle2 } from 'lucide-react';

// Morning visit slots — past days disabled
const SLOTS = ['10:00 AM', '11:30 AM', '4:00 PM', '5:30 PM'];

function nextDays(n) {
  const out = [];
  const d = new Date();
  while (out.length < n) {
    d.setDate(d.getDate() + 1);
    out.push(new Date(d));
  }
  return out;
}

export default function VisitSlotPicker({ listing, onBooked }) {
  const days = nextDays(7);
  const [dateIdx, setDateIdx] = useState(0);
  const [slot, setSlot] = useState('');
  const [booked, setBooked] = useState(false);

  const d = days[dateIdx];
  const fmt = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  if (booked) {
    return (
      <div className="rounded-[20px] border border-white/10 bg-card p-5">
        <h3 className="flex items-center gap-2 font-serif text-lg"><CalendarCheck size={15} className="text-bronze" /> Visit booked</h3>
        <p className="mt-3 flex items-center gap-2 text-[12.5px] text-emerald-300"><CheckCircle2 size={13} /> {fmt} at {slot} — {listing.name}</p>
        <p className="mt-1 text-[11.5px] text-white/45">Owner will confirm on WhatsApp. You can reschedule from the reminder message.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-white/10 bg-card p-5">
      <h3 className="flex items-center gap-2 font-serif text-lg"><CalendarCheck size={15} className="text-bronze" /> Book a visit slot</h3>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {days.map((day, i) => {
          const sel = i === dateIdx;
          return (
            <button
              key={i}
              onClick={() => setDateIdx(i)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-center transition ${sel ? 'border-bronze/60 bg-bronze/10' : 'border-white/10 bg-white/[0.03] hover:border-white/30'}`}
            >
              <span className={`block text-[10px] uppercase tracking-wide ${sel ? 'text-bronze' : 'text-white/40'}`}>
                {day.toLocaleDateString('en-IN', { weekday: 'short' })}
              </span>
              <span className={`block text-[14px] font-semibold ${sel ? 'text-bronze' : 'text-white/80'}`}>{day.getDate()}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        {SLOTS.map((s) => (
          <button key={s} onClick={() => setSlot(s)} className={`rounded-xl border px-3 py-2 text-[12px] transition ${slot === s ? 'border-bronze/60 bg-bronze/10 text-bronze' : 'border-white/10 text-white/60 hover:border-white/30'}`}>
            {s}
          </button>
        ))}
      </div>
      <button
        disabled={!slot}
        onClick={() => { setBooked(true); onBooked?.(fmt, slot); }}
        className="mt-3 w-full rounded-full bg-white py-2.5 text-[13px] font-semibold text-black transition enabled:hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {slot ? `Confirm visit — ${fmt}, ${slot}` : 'Pick a time slot'}
      </button>
    </div>
  );
}
