import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquareText, X, ArrowUp, RotateCcw, Sparkles, ArrowUpRight } from 'lucide-react';
import { answer, starterChips } from '../utils/assistant.js';
import { LISTINGS } from '../data/listings.js';
import { useAuth } from '../context/AuthContext.jsx';

const STORE = 'pgfinder_chat_v1';
const LOG = 'pgfinder_chat_unanswered';
const MAX_STORED = 40;

const uid = () => Math.random().toString(36).slice(2, 9);
const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

// ─── tiny inline renderer: **bold** + ₹ numbers ─────────────────────
function Rich({ text }) {
  const parts = String(text).split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <strong key={i} className="font-semibold text-bronze">
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function load() {
  try {
    const raw = localStorage.getItem(STORE);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function logUnanswered(q) {
  try {
    const rows = JSON.parse(localStorage.getItem(LOG) || '[]');
    rows.push({ q: String(q).slice(0, 160), at: new Date().toISOString() });
    localStorage.setItem(LOG, JSON.stringify(rows.slice(-50)));
  } catch {
    /* ignore */
  }
}

// ─── one listing mini-card inside the transcript ────────────────────
function MiniListing({ listing, onOpen }) {
  const total = listing.rent + (listing.trueCost?.electricity || 0) + (listing.trueCost?.food || 0) + (listing.trueCost?.maintenance || 0);
  return (
    <Link
      to={`/pgs/${listing.id}`}
      onClick={onOpen}
      className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-2 transition hover:border-bronze/40 hover:bg-white/[0.07]"
    >
      <img src={listing.images[0]} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" loading="lazy" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[12.5px] font-semibold">{listing.name}</span>
          <span className="shrink-0 text-[11px] text-bronze">★ {listing.rating}</span>
        </span>
        <span className="mt-0.5 block truncate text-[10.5px] text-white/50">
          {listing.area} · {listing.bedsAvailable} bed{listing.bedsAvailable === 1 ? '' : 's'} left
        </span>
        <span className="mt-0.5 block text-[10.5px] text-white/70">
          {money(listing.rent)} rent · <span className="text-bronze">≈{money(total)} true cost</span>
        </span>
      </span>
      <ArrowUpRight size={13} className="shrink-0 text-white/30 transition group-hover:text-bronze" />
    </Link>
  );
}

export default function ChatBox() {
  const { user, token } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(load);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(false);
  const scroller = useRef(null);
  const inputRef = useRef(null);

  const ctx = useMemo(() => ({ user, token, pathname }), [user, token, pathname]);

  // persist transcript (local only — never sent anywhere)
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {
      /* ignore */
    }
  }, [messages]);

  // greet on first ever open
  useEffect(() => {
    if (!open || messages.length) return;
    let alive = true;
    answer('', ctx).then((r) => {
      if (alive) setMessages([{ id: uid(), role: 'bot', ...r }]);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const id = setTimeout(() => inputRef.current?.focus(), 120);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(id);
    };
  }, [open]);

  const send = useCallback(
    async (raw) => {
      const q = String(raw ?? input).trim();
      if (!q || typing) return;
      setInput('');
      setMessages((m) => [...m, { id: uid(), role: 'user', text: q }]);
      setTyping(true);
      let reply;
      try {
        reply = await answer(q, ctx);
      } catch {
        reply = {
          text: "Something went wrong building an answer from the data — that is a bug, not a fake answer. Try again or message support.",
          chips: starterChips(ctx),
        };
      }
      // small human-scale pause so the reply does not snap in
      await new Promise((r) => setTimeout(r, 260 + Math.random() * 320));
      setTyping(false);
      setMessages((m) => [...m, { id: uid(), role: 'bot', ...reply }]);
      if (reply.unmatched) logUnanswered(q);
    },
    [input, typing, ctx]
  );

  const reset = () => {
    setMessages([]);
    setTyping(false);
    answer('', ctx).then((r) => setMessages([{ id: uid(), role: 'bot', ...r }]));
  };

  const last = messages[messages.length - 1];
  const chips = last?.role === 'bot' && !typing ? last.chips?.length ? last.chips : starterChips(ctx) : [];

  return (
    <>
      {/* launcher */}
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            setUnread(false);
          }}
          aria-label="Open StayScout assistant"
          className="group fixed bottom-4 right-3 z-[60] flex items-center gap-2 rounded-full border border-bronze/40 bg-[#141414]/90 py-3 pl-3.5 pr-4 text-[12.5px] font-medium text-white shadow-2xl shadow-black/50 backdrop-blur-xl transition hover:border-bronze hover:bg-[#1b1b1b] sm:bottom-5 sm:right-5"
        >
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-bronze text-black">
            <MessageSquareText size={13} />
          </span>
          <span className="hidden sm:inline">Ask StayScout</span>
          {unread && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-bronze" />}
        </button>
      )}

      {/* panel */}
      {open && (
        <div
          role="dialog"
          aria-label="StayScout assistant"
          className="fixed bottom-3 right-2 z-[60] flex h-[min(76vh,580px)] w-[min(94vw,392px)] flex-col overflow-hidden rounded-[22px] border border-white/[0.12] bg-[#121212]/[0.97] shadow-2xl shadow-black/60 backdrop-blur-xl sm:bottom-5 sm:right-5"
        >
          {/* header */}
          <div className="flex items-center gap-2.5 border-b border-white/[0.08] bg-white/[0.03] px-3.5 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-bronze/40 bg-bronze/10 text-bronze">
              <Sparkles size={14} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold leading-tight">StayScout Assistant</p>
              <p className="truncate text-[10.5px] text-white/45">Answers from verified listing data — no guesses</p>
            </div>
            <button onClick={reset} aria-label="Reset conversation" title="Start over" className="flex h-7 w-7 items-center justify-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-white">
              <RotateCcw size={13} />
            </button>
            <button onClick={() => setOpen(false)} aria-label="Close assistant" className="flex h-7 w-7 items-center justify-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-white">
              <X size={14} />
            </button>
          </div>

          {/* transcript */}
          <div ref={scroller} role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-3 py-3.5">
            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-md bg-white px-3.5 py-2 text-[12.5px] font-medium leading-relaxed text-black">{m.text}</p>
                </div>
              ) : (
                <div key={m.id} className="space-y-2">
                  <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-white/[0.09] bg-white/[0.05] px-3.5 py-2.5">
                    <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-white/85">
                      <Rich text={m.text} />
                    </p>
                    {m.bullets?.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {m.bullets.map((b, i) => (
                          <li key={i} className="flex gap-1.5 text-[11.5px] leading-relaxed text-white/65">
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-bronze/70" />
                            <span>
                              <Rich text={b} />
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {m.extra && <p className="mt-2 rounded-xl border border-bronze/20 bg-bronze/[0.07] p-2 text-[11px] leading-relaxed text-bronze/90">{m.extra}</p>}
                    {m.actions?.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {m.actions.map((a, i) =>
                          a.href ? (
                            <a key={i} href={a.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-medium text-emerald-300 transition hover:bg-emerald-400/20">
                              {a.label} <ArrowUpRight size={11} />
                            </a>
                          ) : (
                            <Link
                              key={i}
                              to={a.to}
                              onClick={() => setOpen(false)}
                              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-white/90"
                            >
                              {a.label} <ArrowUpRight size={11} />
                            </Link>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {m.listings?.length > 0 && (
                    <div className="max-w-[92%] space-y-1.5">
                      {m.listings
                        .map((id) => LISTINGS.find((l) => l.id === id))
                        .filter(Boolean)
                        .map((l) => (
                          <MiniListing key={l.id} listing={l} onOpen={() => setOpen(false)} />
                        ))}
                    </div>
                  )}

                  {m.source && <p className="pl-1 text-[10px] uppercase tracking-[0.14em] text-white/25">{m.source}</p>}
                </div>
              )
            )}

            {typing && (
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/[0.09] bg-white/[0.05] px-3.5 py-3 w-fit">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-bronze/80" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            )}
          </div>

          {/* suggested questions */}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-white/[0.06] px-3 pt-2.5">
              {chips.slice(0, 4).map((c) => (
                <button
                  key={c}
                  onClick={() => send(c)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10.5px] text-white/60 transition hover:border-bronze/40 hover:text-bronze"
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 p-2.5"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about rent, deposit, safety, commute…"
              aria-label="Your question"
              className="min-w-0 flex-1 rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-[12.5px] text-white outline-none placeholder:text-white/35 focus:border-bronze/50"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Send question"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/90 disabled:opacity-35"
            >
              <ArrowUp size={15} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
