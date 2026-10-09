import { useState } from 'react';
import { BadgeCheck, MessageSquareQuote, GraduationCap, Star, PenLine, UtensilsCrossed } from 'lucide-react';
import { REVIEWS, COLLEGES } from '../data/listings.js';

// Only college emails earn the Verified Student badge
const COLLEGE_EMAIL = /\.(ac\.in|edu)$/i;

const Stars = ({ n, size = 11 }) => (
  <span className="inline-flex gap-0.5 text-bronze">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={size} fill={i <= n ? 'currentColor' : 'none'} strokeWidth={0} className={i <= n ? '' : 'text-white/20'} />
    ))}
  </span>
);

export default function Reviews({ listing }) {
  const [college, setCollege] = useState('');
  const [posted, setPosted] = useState(null);
  const [email, setEmail] = useState('');

  const all = REVIEWS.filter((r) => r.listingId === listing.id);
  const list = college ? all.filter((r) => r.college === college) : all;
  const seniors = list.filter((r) => r.senior);
  const foodAvg = all.length ? (all.reduce((s, r) => s + r.food, 0) / all.length).toFixed(1) : null;

  function submit(e) {
    e.preventDefault();
    const verified = COLLEGE_EMAIL.test(email.trim());
    setPosted({ verified, text: e.target.elements.review.value.trim(), name: verified ? 'You' : 'You (unverified)' });
    setEmail('');
  }

  return (
    <>
      <h2 className="flex items-center gap-2 font-serif text-xl">
        <MessageSquareQuote size={17} className="text-bronze" /> Student reviews
        {foodAvg && (
          <span className="ml-2 flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[12px] text-white/70">
            <UtensilsCrossed size={11} className="text-bronze" /> food {foodAvg}/5
          </span>
        )}
      </h2>

      {/* College filter */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <GraduationCap size={13} className="text-white/40" />
        <button onClick={() => setCollege('')} className={`rounded-full border px-3 py-1 text-[11px] transition ${college === '' ? 'border-bronze/60 bg-bronze/15 text-bronze' : 'border-white/10 text-white/55'}`}>
          All colleges
        </button>
        {COLLEGES.filter((c) => all.some((r) => r.college === c.id)).map((c) => (
          <button key={c.id} onClick={() => setCollege(c.id)} className={`rounded-full border px-3 py-1 text-[11px] transition ${college === c.id ? 'border-bronze/60 bg-bronze/15 text-bronze' : 'border-white/10 text-white/55'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Verified-student review composer */}
      <form onSubmit={submit} className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="flex items-center gap-1.5 text-[12.5px] font-medium"><PenLine size={12} className="text-bronze" /> Stayed here? Add your review</p>
        <p className="mt-1 text-[11px] text-white/45">Sign in with your college email (…@ldarts.ac.in, …@nirmauni.ac.in) to post — that's what keeps every review real.</p>
        <textarea name="review" required rows={2} placeholder="How was the room, the food, the WiFi during exams?" className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[12.5px] outline-none focus:border-bronze/50" />
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@college.ac.in" className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[12.5px] outline-none focus:border-bronze/50" />
          <button type="submit" className="rounded-full border border-bronze/50 px-5 py-2 text-[12.5px] font-medium text-bronze transition hover:bg-bronze/10">Post review</button>
        </div>
        {posted && (
          <div className="mt-3 rounded-xl border border-bronze/25 bg-bronze/[0.07] p-3">
            <p className="flex items-center gap-1.5 text-[12px] text-white/85">
              {posted.name}
              {posted.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  <BadgeCheck size={10} /> Verified Student
                </span>
              )}
            </p>
            <p className="mt-1 text-[12px] text-white/65">{posted.text}</p>
            {!posted.verified && <p className="mt-1 text-[10.5px] text-amber-300">Posted without the badge — verify a college email to get it.</p>}
          </div>
        )}
      </form>

      {/* Senior tips */}
      {seniors.length > 0 && (
        <div className="mt-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/50">Tips from previous tenants</p>
          <div className="mt-2 space-y-2">
            {seniors.map((r) => (
              <div key={r.id} className="rounded-2xl border border-sky-400/20 bg-sky-400/[0.05] p-3.5">
                <p className="text-[12.5px] text-sky-100">💡 {r.tip}</p>
                <p className="mt-1 text-[10.5px] text-white/40">— {r.name}, {COLLEGES.find((c) => c.id === r.college)?.name} alumnus</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review list */}
      <div className="mt-5 space-y-3">
        {list.map((r) => (
          <div key={r.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[13px] font-medium">{r.name}</p>
              {r.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  <BadgeCheck size={10} /> Verified Student
                </span>
              )}
              <span className="text-[10.5px] text-white/35">{COLLEGES.find((c) => c.id === r.college)?.name} · {r.date}</span>
              <span className="ml-auto"><Stars n={r.rating} /></span>
            </div>
            <p className="mt-1.5 text-[12.5px] text-white/65">{r.text}</p>
            <p className="mt-1 text-[10.5px] text-white/35">food {r.food}/5</p>
          </div>
        ))}
        {list.length === 0 && <p className="text-[12px] text-white/45">No reviews from this college yet.</p>}
      </div>
    </>
  );
}
