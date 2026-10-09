import { useState } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { studyScore } from '../utils/intelligence.js';

// Small SVG ring — stroke fills proportionally to score/10
export default function StudyScore({ listing, size = 'sm', showLabel = true }) {
  const [open, setOpen] = useState(false);
  const score = studyScore(listing);
  if (score == null) return null;

  const R = 15.5;
  const C = 2 * Math.PI * R;
  const color = score >= 8 ? 'text-emerald-300' : score >= 6 ? 'text-bronze' : 'text-rose-300';

  const s = listing.study || {};
  const legend = [
    [`WiFi ${s.wifiSpeed} Mbps`, 3],
    [s.quietHours ? 'Quiet hours' : 'No quiet hours', 2],
    [s.studyRoom ? 'Study room' : 'No study room', 2],
    [s.powerBackup ? 'Power backup' : 'No power backup', 1.5],
    [s.desk ? 'Desk in room' : 'No desk', 1.5],
  ];

  if (size === 'sm') {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="relative inline-flex items-center gap-1.5 text-[11px] font-medium text-white/60 transition hover:text-white"
        title="Study Score — how good this PG is for studying"
      >
        <span className={`inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 ${color}`}>
          <BookOpenCheck size={11} /> {score.toFixed(1)}/10
        </span>
        {open && (
          <span onClick={(e) => e.stopPropagation()} className="absolute left-0 top-6 z-20 w-52 rounded-xl border border-white/15 bg-[#181818] p-3 text-left shadow-2xl">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-bronze">Study Score</span>
            {legend.map(([label, pts]) => (
              <span key={label} className="mt-1 flex justify-between text-[10.5px] text-white/60">
                <span>{label}</span><span className="text-white/85">+{pts}</span>
              </span>
            ))}
          </span>
        )}
      </button>
    );
  }

  // large ring
  return (
    <div className="rounded-[20px] border border-white/10 bg-card p-5">
      <p className="flex items-center gap-2 text-[13px] font-semibold">
        <BookOpenCheck size={14} className="text-bronze" /> Study Score {showLabel && <span className="font-normal text-white/40">— built for exam week?</span>}
      </p>
      <div className="mt-3 flex items-center gap-5">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
            <circle cx="20" cy="20" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
            <circle
              cx="20" cy="20" r={R} fill="none" strokeWidth="4" strokeLinecap="round"
              className={color} stroke="currentColor"
              strokeDasharray={`${(score / 10) * C} ${C}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-serif text-xl leading-none ${color}`}>{score.toFixed(1)}</span>
            <span className="text-[9px] uppercase tracking-widest text-white/40">of 10</span>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          {legend.map(([label, pts]) => (
            <div key={label} className="flex justify-between text-[11.5px]">
              <span className="text-white/55">{label}</span>
              <span className="text-white/85">+{pts}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 border-t border-white/[0.08] pt-2 text-[11px] text-white/40">
        Combines tested WiFi speed, quiet hours, study room, power backup and desk-in-room. No other site scores PGs for studying.
      </p>
    </div>
  );
}
