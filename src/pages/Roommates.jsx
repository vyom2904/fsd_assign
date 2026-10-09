import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Sparkles, BedSingle, Plus, Handshake, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { ROOMMATES, LISTINGS, COLLEGES } from '../data/listings.js';
import useBedBoard from '../hooks/useBedBoard.js';

const QUESTIONS = [
  { key: 'sleep', q: 'When do you usually sleep?', options: [['early', 'Early (before 11 PM)'], ['late', 'Late (after 1 AM)']] },
  { key: 'cleanliness', q: 'How clean is "clean enough" for a shared room?', options: [[5, 'Spotless — everything in its place'], [3, 'Reasonably tidy']] },
  { key: 'veg', q: 'Your food preference?', options: [[true, 'Vegetarian'], [false, 'Non-veg is fine']] },
  { key: 'study', q: 'When do you study best?', options: [['morning', 'Early morning'], ['night', 'Late night']] },
  { key: 'smoking', q: 'Okay with a roommate who smokes?', options: [[false, 'No, non-smoking only'], [true, "Doesn't matter"]] },
];

function score(user, r) {
  let s = 100;
  if (user.sleep !== r.sleep) s -= 20;
  if (user.study !== r.study) s -= 15;
  if (user.veg !== r.veg) s -= 10;
  if (Math.abs(user.cleanliness - r.cleanliness) >= 2) s -= 25;
  return Math.max(20, s);
}

export default function Roommates() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ cleanliness: 4 });
  const board = useBedBoard();
  const [showPost, setShowPost] = useState(false);
  const [form, setForm] = useState({ area: '', rent: '', note: '', contact: '' });

  const done = step >= QUESTIONS.length;
  const ranked = done
    ? [...ROOMMATES].map((r) => ({ ...r, match: score({ sleep: answers.sleep, study: answers.study, veg: answers.veg, cleanliness: answers.cleanliness }, r) }))
        .sort((a, b) => b.match - a.match)
    : null;

  const q = QUESTIONS[step];

  return (
    <div className="min-h-screen bg-canvas text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-3 pb-16 pt-24 sm:pt-28">
        <div className="rounded-[24px] border border-white/[0.08] bg-surface p-6 sm:rounded-[28px] sm:p-10">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-bronze">
            <Users size={12} /> Roommate matching
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Find someone you can actually live with.</h1>
          <p className="mt-2 text-[13px] text-white/55">Five quick questions — we match you with compatible students looking in the same areas.</p>

          {!done ? (
            <div className="mt-8">
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-bronze transition-all duration-300" style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
              </div>
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <p className="mt-6 font-serif text-2xl">{q.q}</p>
                <div className="mt-5 grid gap-3">
                  {q.options.map(([value, label]) => (
                    <button
                      key={String(label)}
                      onClick={() => {
                        setAnswers((a) => ({ ...a, [q.key]: value }));
                        setStep((s) => s + 1);
                      }}
                      className="rounded-2xl border border-white/10 bg-card px-5 py-4 text-left text-[14px] transition hover:border-bronze/50 hover:bg-cardhi"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {step > 0 && (
                  <button onClick={() => setStep((s) => s - 1)} className="mt-5 text-[12px] text-white/45 underline hover:text-white">← back</button>
                )}
              </motion.div>
            </div>
          ) : (
            <>
              <p className="mt-8 flex items-center gap-2 text-[13px] font-medium text-bronze"><Sparkles size={14} /> Your matches, best first</p>
              <div className="mt-4 space-y-3">
                {ranked.map((r) => (
                  <div key={r.id} className="flex items-center gap-4 rounded-[20px] border border-white/[0.08] bg-card p-4">
                    <img src={r.avatar} alt={r.name} className="h-14 w-14 rounded-full border border-white/15 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold">{r.name} <span className="ml-1 text-[11px] font-normal text-white/40">{r.course}, {r.college}</span></p>
                      <p className="mt-0.5 truncate text-[12px] text-white/55">{r.bio}</p>
                      <p className="mt-0.5 text-[11px] text-white/40">Budget ~₹{r.budget.toLocaleString('en-IN')} · {r.veg ? 'Veg' : 'Non-veg'} · {r.sleep === 'early' ? 'Early sleeper' : 'Night owl'}</p>
                    </div>
                    <div className="shrink-0 text-center">
                      <p className={`font-serif text-2xl ${r.match >= 80 ? 'text-emerald-300' : r.match >= 60 ? 'text-bronze' : 'text-white/50'}`}>{r.match}%</p>
                      <p className="text-[10px] uppercase tracking-widest text-white/35">match</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => { setStep(0); setAnswers({ cleanliness: 4 }); }} className="mt-6 rounded-full border border-white/15 px-5 py-2 text-[12.5px] text-white/70 hover:border-white/40">
                Retake quiz
              </button>
            </>
          )}
          {/* ── Vacant-bed board: "find a roommate for this room" ── */}
          <div className="mt-12 border-t border-white/[0.08] pt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-bronze"><BedSingle size={12} /> Vacant-bed board</p>
                <h2 className="mt-2 font-serif text-2xl">Have a spare bed? Fill it. Need one? Take it.</h2>
                <p className="mt-1 text-[12.5px] text-white/50">Students with a vacant bed post it here — split the rent, halve the cost. Request to join and the poster gets your email.</p>
              </div>
              <button onClick={() => setShowPost((s) => !s)} className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-black transition hover:bg-white/90">
                <Plus size={13} /> Post a vacant bed
              </button>
            </div>

            {showPost && (
              <form
                className="mt-4 grid gap-2.5 rounded-[20px] border border-white/10 bg-card p-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  board.addPost({
                    listingId: '',
                    area: form.area.trim(),
                    gender: 'any',
                    rent: Number(form.rent) || 0,
                    note: form.note.trim(),
                    postedBy: 'You',
                    college: '',
                    contact: form.contact.trim(),
                  });
                  setForm({ area: '', rent: '', note: '', contact: '' });
                  setShowPost(false);
                }}
              >
                <input required value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} placeholder="Area — e.g. Navrangpura" className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[12.5px] outline-none focus:border-bronze/50" />
                <input required type="number" min="1000" value={form.rent} onChange={(e) => setForm((f) => ({ ...f, rent: e.target.value }))} placeholder="Your share of rent (₹/month)" className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[12.5px] outline-none focus:border-bronze/50" />
                <textarea required rows={2} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Describe the room, timings, who you'd live well with…" className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[12.5px] outline-none focus:border-bronze/50 sm:col-span-2" />
                <input required type="email" value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} placeholder="College email (only shown on request)" className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[12.5px] outline-none focus:border-bronze/50 sm:col-span-2" />
                <button type="submit" className="rounded-full border border-bronze/50 py-2 text-[12.5px] font-medium text-bronze transition hover:bg-bronze/10 sm:col-span-2">Post it on the board</button>
              </form>
            )}

            <div className="mt-4 space-y-3">
              {board.posts.map((p) => (
                <div key={p.id} className="rounded-[20px] border border-white/[0.08] bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium">
                        {p.postedBy}
                        {p.college && <span className="ml-1.5 text-[11px] font-normal text-white/40">{COLLEGES.find((c) => c.id === p.college)?.name || p.college}</span>}
                        <span className="ml-2 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">{p.gender === 'girls' ? 'girls' : p.gender === 'boys' ? 'boys' : 'co-ed'} bed</span>
                      </p>
                      <p className="mt-1 text-[12.5px] text-white/65">{p.note}</p>
                      <p className="mt-1 text-[11px] text-white/40">
                        {p.area}
                        {p.listingId && LISTINGS.find((l) => l.id === p.listingId) ? ` · ${LISTINGS.find((l) => l.id === p.listingId).name}` : ''}
                        · posted {p.date}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-serif text-xl text-bronze">₹{p.rent.toLocaleString('en-IN')}<span className="ml-0.5 font-sans text-[10px] font-normal text-white/40">/mo</span></p>
                      <p className="text-[10.5px] text-white/40">{p.requests} requests</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => board.requestToJoin(p.id)}
                      disabled={p.requested}
                      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11.5px] font-medium transition ${p.requested ? 'cursor-default bg-emerald-400/15 text-emerald-300' : 'border border-bronze/50 text-bronze hover:bg-bronze/10'}`}
                    >
                      <Handshake size={12} /> {p.requested ? `Request sent ✓ (${p.requests})` : 'Request to join'}
                    </button>
                    {p.postedBy === 'You' && (
                      <button onClick={() => board.removePost(p.id)} className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11.5px] text-white/50 hover:text-rose-300">
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {board.posts.length === 0 && <p className="rounded-[20px] border border-dashed border-white/15 p-8 text-center text-[12.5px] text-white/45">No vacant beds posted yet — be the first.</p>}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
