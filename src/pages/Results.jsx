import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Clock, Sparkles, X, GitCompareArrows } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ListingCard from '../components/ListingCard.jsx';
import useWishlist from '../hooks/useWishlist.js';
import useCompare from '../hooks/useShortlist.js';
import { LISTINGS, CITIES, COLLEGES } from '../data/listings.js';
import { parseQuery, applyParsed, sortByCommute, bestCommute, commuteLabel } from '../utils/intelligence.js';

const AMENITIES = ['WiFi', 'Meals', 'AC', 'Laundry', 'Gym', 'Parking', 'CCTV', 'Housekeeping', 'Hot Water', 'Power Backup'];
const TYPES = ['Single Room', 'Sharing Room', 'Co-living'];

export default function Results() {
  const [params, setParams] = useSearchParams();
  const wishlist = useWishlist();
  const compare = useCompare();
  const [rush, setRush] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const aiQuery = params.get('q') || '';
  const parsed = useMemo(() => (aiQuery ? parseQuery(aiQuery) : null), [aiQuery]);

  const filters = {
    city: params.get('city') || '',
    gender: params.get('gender') || '',
    max: Number(params.get('max') || 20000),
    type: params.get('type') || '',
    amenities: (params.get('amenities') || '').split(',').filter(Boolean),
    college: params.get('college') || '',
    curfew: params.get('curfew') || '',
    policy: params.get('policy') || '',
  };

  function set(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  function toggleAmenity(name) {
    const next = filters.amenities.includes(name) ? filters.amenities.filter((a) => a !== name) : [...filters.amenities, name];
    set('amenities', next.join(','));
  }

  const results = useMemo(() => {
    let list = LISTINGS;
    if (parsed) list = applyParsed(list, parsed);
    if (filters.city) list = list.filter((l) => l.city === filters.city);
    if (filters.gender) list = list.filter((l) => l.gender === filters.gender || l.gender === 'any');
    list = list.filter((l) => l.rent <= filters.max);
    if (filters.type) list = list.filter((l) => l.roomType === filters.type);
    if (filters.amenities.length) list = list.filter((l) => filters.amenities.every((a) => l.amenities.includes(a)));
    if (filters.curfew === 'none') list = list.filter((l) => /^none/i.test(l.safety?.curfew || ''));
    if (filters.curfew === 'relaxed') list = list.filter((l) => l.safety?.curfew && !/^none/i.test(l.safety.curfew));
    if (filters.policy === 'women') list = list.filter((l) => l.safety?.womenOnlyFloor || l.gender === 'girls');
    if (filters.policy === 'guests') list = list.filter((l) => l.policy?.guestNights && !/not allowed/i.test(l.policy.guestNights));
    if (filters.college || parsed?.collegeId) list = sortByCommute(list, filters.college || parsed.collegeId, rush);
    return list;
  }, [params, parsed, rush]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeCollegeId = filters.college || parsed?.collegeId || '';

  const inputCls = 'w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-[13px] text-white outline-none focus:border-bronze/50 [&>option]:bg-[#1c1c1c]';

  return (
    <div className="min-h-screen bg-canvas text-white">
      <Navbar />
      <main className="mx-auto max-w-[1440px] px-2 pb-40 pt-24 sm:px-3 sm:pt-28">
        <div className="rounded-[24px] border border-white/[0.08] bg-surface p-5 sm:rounded-[28px] sm:p-8">
          {/* AI query banner */}
          {parsed && (
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-bronze/25 bg-bronze/[0.07] p-4">
              <Sparkles size={15} className="shrink-0 text-bronze" />
              <p className="flex-1 text-[12.5px] text-white/75">
                AI understood:{' '}
                <span className="font-medium text-white">
                  {[
                    parsed.gender ? (parsed.gender === 'girls' ? 'Girls only' : parsed.gender === 'boys' ? 'Boys only' : 'Co-ed') : null,
                    parsed.max ? `budget ≤ ₹${parsed.max.toLocaleString('en-IN')}` : null,
                    parsed.veg === true ? 'veg mess' : null,
                    parsed.roomType,
                    parsed.amenities.join(', '),
                    parsed.collegeId ? `near ${COLLEGES.find((c) => c.id === parsed.collegeId)?.name}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'showing everything'}
                </span>
              </p>
              <Link to="/pgs" className="text-[11.5px] text-white/50 underline hover:text-white">clear</Link>
            </div>
          )}

          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-bronze">Find your PG</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl">
              {results.length} {results.length === 1 ? 'stay' : 'stays'} found
            </h1>
            <Link to="/" className="text-[12.5px] text-white/50 transition hover:text-white">← Home</Link>
          </div>

          {/* Commute search bar */}
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <Clock size={15} className="ml-1 text-bronze" />
            <span className="text-[12px] text-white/60">Commute-first:</span>
            <select value={filters.college} onChange={(e) => set('college', e.target.value)} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[12.5px] outline-none [&>option]:bg-[#1c1c1c]">
              <option value="">Pick your college</option>
              {COLLEGES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={() => setRush((r) => !r)}
              className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-medium transition ${
                rush ? 'bg-rose-400/20 text-rose-300 border border-rose-400/40' : 'border border-white/15 text-white/60 hover:text-white'
              }`}
            >
              🕗 Rush-hour {rush ? 'ON' : 'OFF'}
            </button>
            {activeCollegeId && <span className="text-[11.5px] text-white/40">sorted by real travel time</span>}
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
            {/* Filters */}
            <aside className={`${showFilters ? '' : 'hidden lg:block'} space-y-5`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/60">
                  <SlidersHorizontal size={13} className="text-bronze" /> Filters
                </div>
                <button onClick={() => setParams(new URLSearchParams())} className="text-[11px] text-white/40 underline hover:text-white">reset</button>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-white/45">City</label>
                <select value={filters.city} onChange={(e) => set('city', e.target.value)} className={inputCls}>
                  <option value="">All</option>
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-white/45">Gender</label>
                <select value={filters.gender} onChange={(e) => set('gender', e.target.value)} className={inputCls}>
                  <option value="">Any</option>
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-white/45">Max budget — ₹{filters.max.toLocaleString('en-IN')}</label>
                <input type="range" min="4000" max="20000" step="500" value={filters.max} onChange={(e) => set('max', e.target.value)} className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-bronze" />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-white/45">Room type</label>
                <select value={filters.type} onChange={(e) => set('type', e.target.value)} className={inputCls}>
                  <option value="">Any type</option>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-white/45">Curfew & visitors</label>
                <select value={filters.curfew} onChange={(e) => set('curfew', e.target.value)} className={inputCls}>
                  <option value="">Any curfew policy</option>
                  <option value="none">No curfew</option>
                  <option value="relaxed">Curfew after 10 PM</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-white/45">Policy</label>
                <select value={filters.policy} onChange={(e) => set('policy', e.target.value)} className={inputCls}>
                  <option value="">Any policy</option>
                  <option value="women">Women-safe (guard + floor)</option>
                  <option value="guests">Guest nights allowed</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/45">Amenities</label>
                <div className="flex flex-wrap gap-1.5">
                  {AMENITIES.map((a) => {
                    const active = filters.amenities.includes(a);
                    return (
                      <button key={a} onClick={() => toggleAmenity(a)} className={`rounded-full border px-3 py-1 text-[11px] transition ${active ? 'border-bronze/60 bg-bronze/15 text-bronze' : 'border-white/10 bg-white/[0.04] text-white/60 hover:border-white/25'}`}>
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Grid */}
            <div>
              <button onClick={() => setShowFilters((s) => !s)} className="mb-4 rounded-full border border-white/15 px-4 py-2 text-[12px] text-white/70 lg:hidden">
                {showFilters ? 'Hide filters' : 'Show filters'}
              </button>

              {results.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-white/15 p-14 text-center">
                  <p className="text-3xl">🏙️</p>
                  <p className="mt-3 font-serif text-xl">No stays match</p>
                  <p className="mt-1 text-[12.5px] text-white/50">Try raising the budget or clearing a filter.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((l) => {
                    const c = activeCollegeId ? bestCommute(l, activeCollegeId, rush) : null;
                    return (
                      <ListingCard
                        key={l.id}
                        listing={l}
                        saved={wishlist.has(l.id)}
                        onToggleSave={wishlist.toggle}
                        compare={compare.has(l.id)}
                        onToggleCompare={compare.toggle}
                        commuteNote={c ? `→ ${commuteLabel(c)}` : null}
                        activeCollegeId={activeCollegeId}
                        rush={rush}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Compare tray */}
      {compare.ids.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3">
          <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-full border border-white/15 bg-[#181818]/95 px-5 py-3 shadow-2xl backdrop-blur-xl">
            <GitCompareArrows size={15} className="text-sky-300" />
            <p className="flex-1 text-[12.5px] text-white/75">
              {compare.ids.length}/3 shortlisted for comparison
              <span className="ml-2 text-white/40">{compare.ids.map((id) => LISTINGS.find((l) => l.id === id)?.name).filter(Boolean).join(', ')}</span>
            </p>
            <Link to="/compare" className="rounded-full bg-white px-4 py-1.5 text-[12px] font-semibold text-black transition hover:bg-white/90">
              Compare
            </Link>
            <button onClick={compare.clear} aria-label="Clear compare" className="text-white/50 hover:text-white">
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
