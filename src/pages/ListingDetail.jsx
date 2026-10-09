import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, Star, MapPin, BedDouble, Wallet, DoorOpen, Heart, CheckCircle2,
  ClipboardList, GraduationCap, Clock, UtensilsCrossed, Store, ShieldCheck, Bell, FileSignature, KeyRound,
  HandCoins, Landmark, TrendingUp,
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import TrustBadges from '../components/TrustBadges.jsx';
import TrueCost from '../components/TrueCost.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';
import BudgetPlanner from '../components/BudgetPlanner.jsx';
import PriceHistory from '../components/PriceHistory.jsx';
import MoveInAvailability from '../components/MoveInAvailability.jsx';
import ComplaintForm from '../components/ComplaintForm.jsx';
import SwitchingAssistant from '../components/SwitchingAssistant.jsx';
import StudyScore from '../components/StudyScore.jsx';
import DurationPicker from '../components/DurationPicker.jsx';
import Reviews from '../components/Reviews.jsx';
import VisitSlotPicker from '../components/VisitSlotPicker.jsx';
import AfterBooking from '../components/AfterBooking.jsx';
import ReportButton from '../components/ReportButton.jsx';
import { api } from '../api.js';
import useWishlist from '../hooks/useWishlist.js';
import useCompare from '../hooks/useShortlist.js';
import { LISTINGS, COLLEGES, mapLink } from '../data/listings.js';
import { bestCommute, commuteLabel } from '../utils/intelligence.js';

const inputCls = 'w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-[13px] text-white placeholder:text-white/35 outline-none focus:border-bronze/50';

export default function ListingDetail({ initialTab = '' }) {
  const { id } = useParams();
  const base = LISTINGS.find((l) => l.id === id);

  // Keep current rent synchronized with the DB (latest price-history rule)
  const [dbPatch, setDbPatch] = useState(null);
  useEffect(() => {
    let live = true;
    api.listings.get(id).then((l) => { if (live && l && l.rent !== base?.rent) setDbPatch({ rent: l.rent }); }).catch(() => {});
    return () => { live = false; };
  }, [id]);

  const listing = dbPatch && base ? { ...base, ...dbPatch } : base;
  const wishlist = useWishlist();
  const compare = useCompare();
  const [active, setActive] = useState(0);
  const [rush, setRush] = useState(false);
  const [parentMode, setParentMode] = useState(false);
  const [tab, setTab] = useState(
    ['price', 'maintenance'].includes(initialTab) ? initialTab : 'overview'
  );
  const [booked, setBooked] = useState(false);
  const [signed, setSigned] = useState(false);
  const [alertSet, setAlertSet] = useState(false);

  if (!listing) {
    return (
      <div className="min-h-screen bg-canvas text-white">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-40 text-center">
          <p className="font-serif text-3xl">Stay not found</p>
          <Link to="/pgs" className="mt-4 inline-block text-[13px] text-bronze hover:underline">← Back to all PGs</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const saved = wishlist.has(listing.id);
  const total = listing.rent + listing.trueCost.electricity + listing.trueCost.food + listing.trueCost.maintenance;
  const t = listing.trueCost;

  return (
    <div className="min-h-screen bg-canvas text-white">
      <Navbar />
      <main className="mx-auto max-w-[1440px] px-2 pb-4 pt-24 sm:px-3 sm:pt-28">
        <div className="rounded-[24px] border border-white/[0.08] bg-surface p-5 sm:rounded-[28px] sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/pgs" className="text-[12.5px] text-white/55 hover:text-white"><ArrowLeft size={13} className="mr-1 inline" />All PGs</Link>
            <div className="flex gap-2">
              <button onClick={() => compare.toggle(listing.id)} className={`rounded-full border px-4 py-2 text-[12.5px] font-medium transition ${compare.has(listing.id) ? 'border-sky-400/60 bg-sky-400/15 text-sky-300' : 'border-white/15 text-white/70 hover:border-white/40'}`}>
                ⚖ {compare.has(listing.id) ? 'Comparing' : 'Compare'}
              </button>
              <button onClick={() => wishlist.toggle(listing.id)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12.5px] font-medium transition ${saved ? 'border-bronze/60 bg-bronze/15 text-bronze' : 'border-white/15 text-white/70 hover:border-white/40'}`}>
                <Heart size={13} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 font-serif text-3xl sm:text-4xl">
                {listing.name}
                {listing.verified && <BadgeCheck size={20} className="text-bronze" />}
              </h1>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-white/55">
                <span className="flex items-center gap-1.5"><MapPin size={13} className="text-bronze" />{listing.area}, {listing.city}</span>
                <span className="flex items-center gap-1 text-bronze"><Star size={12} fill="currentColor" strokeWidth={0} />{listing.rating} ({listing.reviews})</span>
              </p>
              <div className="mt-3"><TrustBadges trust={listing.trust} /></div>
            </div>
            <div className="text-right">
              <p className="font-serif text-3xl text-bronze">₹{listing.rent.toLocaleString('en-IN')}<span className="ml-1 font-sans text-[12px] font-normal text-white/45">/month</span></p>
              <p className="text-[11.5px] text-white/45">true cost ₹{total.toLocaleString('en-IN')} with bills & food</p>
            </div>
          </div>

          {/* Gallery */}
          <div className="mt-6 overflow-hidden rounded-[20px]">
            <img src={listing.images[active]} alt={`${listing.name} photo ${active + 1}`} className="aspect-[16/8] w-full object-cover" />
          </div>
          <div className="mt-3 flex gap-3">
            {listing.images.map((src, i) => (
              <button key={src} onClick={() => setActive(i)} className={`h-16 w-24 overflow-hidden rounded-xl border-2 transition ${i === active ? 'border-bronze' : 'border-white/10 opacity-60 hover:opacity-100'}`}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              ['overview', 'Overview'],
              ['reality', 'Room reality check'],
              ['mess', listing.mess ? 'Mess menu' : 'Food'],
              ['reviews', 'Reviews'],
              ['nearby', 'Neighbourhood'],
              ['safety', 'Safety'],
              ['price', '📈 Price & planning'],
              ['maintenance', '🔧 Maintenance'],
            ].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} className={`rounded-full px-4 py-2 text-[12.5px] transition ${tab === key ? 'bg-white font-medium text-black' : 'border border-white/15 text-white/65 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
            {/* Tab content */}
            <div>
              {tab === 'overview' && (
                <>
                  <h2 className="font-serif text-xl">About this stay</h2>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-white/60">{listing.description}</p>

                  <h2 className="mt-8 flex items-center gap-2 font-serif text-xl"><GraduationCap size={17} className="text-bronze" /> Commute to your college</h2>
                  <div className="mt-3 space-y-2">
                    {COLLEGES.slice(0, 4).map((c) => {
                      const cm = bestCommute(listing, c.id, rush);
                      if (!cm) return null;
                      return (
                        <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                          <Clock size={13} className="text-bronze" />
                          <span className="flex-1 text-[13px] text-white/75">{c.name}</span>
                          <span className={`text-[13px] font-medium ${rush && cm.rushDelta > 15 ? 'text-rose-300' : 'text-white'}`}>{commuteLabel(cm)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => setRush((r) => !r)} className={`mt-3 rounded-full px-4 py-1.5 text-[11.5px] font-medium transition ${rush ? 'bg-rose-400/20 text-rose-300 border border-rose-400/40' : 'border border-white/15 text-white/60'}`}>
                    🕗 Rush-hour times {rush ? 'ON' : 'OFF'}
                  </button>

                  <h2 className="mt-8 font-serif text-xl">Amenities</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {listing.amenities.map((a) => (
                      <span key={a} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[12px] text-white/70">
                        <CheckCircle2 size={12} className="text-bronze" /> {a}
                      </span>
                    ))}
                  </div>

                  <h2 className="mt-8 font-serif text-xl">House rules</h2>
                  <ul className="mt-3 space-y-2">
                    {listing.rules.map((r) => (
                      <li key={r} className="flex items-center gap-2 text-[13px] text-white/60"><ClipboardList size={13} className="text-bronze" /> {r}</li>
                    ))}
                  </ul>
                </>
              )}

              {tab === 'reality' && (
                <>
                  <h2 className="font-serif text-xl">Room reality check</h2>
                  <p className="mt-1 text-[12px] text-white/45">Unedited photos and tested numbers — what brochures skip.</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <img src={listing.realityCheck.bathroom} alt="Actual bathroom" className="aspect-[4/3] w-full rounded-2xl object-cover" />
                      <p className="mt-1.5 text-[11.5px] text-white/50">Bathroom — as-is, no filters</p>
                    </div>
                    <div>
                      <img src={listing.realityCheck.kitchen} alt="Actual kitchen / mess area" className="aspect-[4/3] w-full rounded-2xl object-cover" />
                      <p className="mt-1.5 text-[11.5px] text-white/50">Kitchen / mess area</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Water pressure</p>
                      <p className="mt-1 text-[13px] text-white/80">{listing.realityCheck.waterPressure}</p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">WiFi speed test</p>
                      <p className="mt-1 text-[13px] text-white/80">{listing.realityCheck.wifiTested}</p>
                    </div>
                  </div>
                </>
              )}

              {tab === 'mess' && (
                <>
                  <h2 className="flex items-center gap-2 font-serif text-xl"><UtensilsCrossed size={17} className="text-bronze" /> Mess menu {listing.mess && <span className="ml-2 flex items-center gap-1 text-[13px] text-bronze"><Star size={12} fill="currentColor" strokeWidth={0} />{listing.mess.rating}/5 resident rating</span>}</h2>
                  {listing.mess ? (
                    <div className="mt-4 space-y-2">
                      {Object.entries(listing.mess.menu).map(([day, food]) => (
                        <div key={day} className="flex gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                          <span className="w-10 shrink-0 text-[12px] font-semibold text-bronze">{day}</span>
                          <span className="text-[12.5px] text-white/70">{food}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-[13px] text-white/55">No in-house mess. Tiffin services deliver here — see below.</p>
                  )}

                  {/* Tiffin services nearby (for PGs without meals) */}
                  <h2 className="mt-8 font-serif text-xl">Tiffin services nearby</h2>
                  <p className="mt-1 text-[12px] text-white/45">Home-style dabba plans, delivered to the PG gate.</p>
                  <div className="mt-3 space-y-2">
                    {(listing.tiffins || [
                      { name: 'Maa Tiffin Service', price: 2200, opts: 'Veg · Jain on request', dist: 'delivers to this area' },
                      { name: 'Annapurna Tiffin Point', price: 1900, opts: 'Veg & non-veg', dist: '1.0 km' },
                    ]).map((tf) => (
                      <div key={tf.name} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                        <span className="rounded-full bg-bronze/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-bronze">Tiffin</span>
                        <span className="flex-1 text-[12.5px] text-white/75">{tf.name} <span className="text-white/40">· {tf.opts}</span></span>
                        <span className="text-[11.5px] text-white/40">{tf.dist}</span>
                        <span className="text-[13px] font-medium text-bronze">₹{tf.price.toLocaleString('en-IN')}<span className="text-[10.5px] font-normal text-white/40">/mo</span></span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tab === 'reviews' && <Reviews listing={listing} />}

              {tab === 'price' && (
                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="rounded-[20px] border border-white/10 bg-card p-5">
                    <h2 className="flex items-center gap-2 font-serif text-xl"><TrendingUp size={16} className="text-bronze" /> Price history</h2>
                    <p className="mt-1 text-[12px] font-serif text-2xl text-bronze">₹{listing.rent.toLocaleString('en-IN')}<span className="ml-1 font-sans text-[11px] font-normal text-white/40">/month current</span></p>
                    <div className="mt-3"><PriceHistory listingId={listing.id} currentRent={listing.rent} /></div>
                  </div>
                  <BudgetPlanner prefillPG={listing} />
                </div>
              )}

              {tab === 'maintenance' && <ComplaintForm listing={listing} />}

              {tab === 'nearby' && (
                <>
                  <h2 className="flex items-center gap-2 font-serif text-xl"><Store size={17} className="text-bronze" /> Neighbourhood guide</h2>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {listing.nearby.map((n) => (
                      <div key={n.name} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                        <span className="rounded-full bg-bronze/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-bronze">{n.type}</span>
                        <span className="flex-1 text-[12.5px] text-white/75">{n.name}</span>
                        <span className="text-[11.5px] text-white/40">{n.dist}</span>
                      </div>
                    ))}
                  </div>
                  <a href={mapLink(`${listing.area} ${listing.city}`)} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-full border border-white/15 px-4 py-2 text-[12px] text-white/70 hover:border-bronze/50 hover:text-bronze">
                    Open in Google Maps ↗
                  </a>
                </>
              )}

              {tab === 'safety' && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-serif text-xl"><ShieldCheck size={17} className="text-bronze" /> Safety</h2>
                    <button onClick={() => setParentMode((p) => !p)} className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-medium transition ${parentMode ? 'bg-sky-400/20 text-sky-300 border border-sky-400/40' : 'border border-white/15 text-white/60'}`}>
                      👨‍👩‍👧 Parent mode {parentMode ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      ['CCTV cameras', listing.safety.cctv ? 'Yes — common areas covered' : 'Not installed'],
                      ['Security guard', listing.safety.guard ? 'Yes — night guard' : 'None'],
                      ['Entry curfew', listing.safety.curfew],
                      ['Women-only floor', listing.safety.womenOnlyFloor ? 'Yes' : 'No'],
                      ['Nearest hospital', listing.safety.hospital],
                      ['Nearest police station', listing.safety.police],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{k}</p>
                        <p className="mt-1 text-[13px] text-white/80">{v}</p>
                      </div>
                    ))}
                  </div>
                  {parentMode && (
                    <div className="mt-4 rounded-2xl border border-sky-400/25 bg-sky-400/[0.07] p-4">
                      <p className="text-[13px] font-medium text-sky-200">👨‍👩‍👧 Parent view</p>
                      <p className="mt-1 text-[12px] text-white/60">
                        Share this shortlist with your family — they see safety details, verified badges and the true monthly
                        cost, but never your chat history.
                      </p>
                      <button
                        onClick={() => navigator.clipboard?.writeText(window.location.href)}
                        className="mt-3 rounded-full bg-white px-4 py-1.5 text-[11.5px] font-semibold text-black"
                      >
                        Copy shareable link
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <TrueCost listing={listing} size="lg" />

              {/* Deposit & policies in plain language */}
              {listing.policy && (
                <div className="rounded-[20px] border border-white/10 bg-card p-5">
                  <p className="flex items-center gap-2 text-[13px] font-semibold"><HandCoins size={14} className="text-bronze" /> The rules, plainly</p>
                  <div className="mt-3 space-y-2.5">
                    {[
                      [HandCoins, `Deposit: ${listing.policy.depositMonths} month${listing.policy.depositMonths > 1 ? 's' : ''} rent, refundable within ${listing.policy.refundDays} days of moving out`],
                      [Clock, `Curfew: ${listing.safety.curfew}`],
                      [DoorOpen, `Visitors: ${listing.policy.visitors}`],
                      [BedDouble, `Guest nights: ${listing.policy.guestNights}`],
                      [FileSignature, `Notice period: ${listing.policy.noticePeriod}`],
                    ].map(([Icon, text], i) => (
                      <p key={i} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-white/65">
                        <Icon size={13} className="mt-0.5 shrink-0 text-bronze" /> {text}
                      </p>
                    ))}
                  </div>
                  <p className="mt-3 border-t border-white/[0.08] pt-2 text-[11px] text-white/40">No clause here is hidden in fine print — what you read is what the agreement says.</p>
                </div>
              )}

              <StudyScore listing={listing} size="lg" />

              <DurationPicker listing={listing} />

              <div className="rounded-[20px] border border-white/10 bg-card p-5">
                <ul className="divide-y divide-white/[0.08]">
                  {[
                    { icon: DoorOpen, label: 'Room type', value: listing.roomType },
                    { icon: BedDouble, label: 'Available beds', value: `${listing.bedsAvailable} left` },
                    { icon: Wallet, label: 'Rent / month', value: `₹${listing.rent.toLocaleString('en-IN')}` },
                  ].map((m) => (
                    <li key={m.label} className="flex items-center gap-3 py-3">
                      <m.icon size={14} className="text-bronze" />
                      <span className="flex-1 text-[12px] text-white/50">{m.label}</span>
                      <span className="text-[13px] font-medium">{m.value}</span>
                    </li>
                  ))}
                </ul>
                <WhatsAppButton listing={listing} className="mt-3 w-full" />
              </div>

              {/* Price alert */}
              <div className="rounded-[20px] border border-white/10 bg-card p-5">
                <p className="flex items-center gap-2 text-[13px] font-semibold"><Bell size={13} className="text-bronze" /> Price & vacancy alert</p>
                {alertSet ? (
                  <p className="mt-2 text-[12px] text-emerald-300">✓ We'll WhatsApp you if the price drops or a bed opens up.</p>
                ) : (
                  <button onClick={() => setAlertSet(true)} className="mt-2 w-full rounded-full border border-bronze/50 py-2 text-[12.5px] font-medium text-bronze transition hover:bg-bronze/10">
                    Alert me below ₹{(listing.rent - 500).toLocaleString('en-IN')}
                  </button>
                )}
              </div>

              <MoveInAvailability listingId={listing.id} listingName={listing.name} />

              {/* Visit slot picker */}
              <VisitSlotPicker listing={listing} />

              {/* Booking token + agreement + move-in kit */}
              <div className="rounded-[20px] border border-white/10 bg-card p-5">
                <h3 className="flex items-center gap-2 font-serif text-lg"><KeyRound size={15} className="text-bronze" /> Hold this bed</h3>
                {booked ? (
                  <div className="mt-3 space-y-3">
                    <p className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-3 text-[12.5px] text-emerald-300">
                      ✓ Bed held for 72 hours. Token ₹999 (adjusted in first rent, refundable).
                    </p>
                    {signed ? (
                      <>
                        <p className="flex items-center gap-2 text-[12.5px] text-emerald-300"><FileSignature size={13} /> Digital agreement e-signed ✓</p>
                        <AfterBooking listing={listing} />
                      </>
                    ) : (
                      <div className="rounded-2xl border border-white/10 p-3">
                        <p className="text-[12px] text-white/60">Step 2 — e-sign the standard rental agreement:</p>
                        <canvas id="sig-canvas" width="260" height="80" className="mt-2 w-full cursor-crosshair rounded-xl border border-dashed border-white/20 bg-white/[0.03]" />
                        <button onClick={() => setSigned(true)} className="mt-2 w-full rounded-full border border-bronze/50 py-2 text-[12px] font-medium text-bronze hover:bg-bronze/10">
                          Sign & accept agreement
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="mt-2 text-[12px] text-white/55">Pay a small refundable token to hold a bed while you visit. No brokerage, ever.</p>
                    <button onClick={() => { setBooked(true); setTimeout(() => {
                      const canvas = document.getElementById('sig-canvas');
                      if (!canvas) return;
                      const ctx = canvas.getContext('2d');
                      ctx.strokeStyle = '#c9a27a';
                      ctx.lineWidth = 2;
                      ctx.lineCap = 'round';
                      let drawing = false;
                      const pos = (e) => {
                        const r = canvas.getBoundingClientRect();
                        return [(e.clientX - r.left) * (canvas.width / r.width), (e.clientY - r.top) * (canvas.height / r.height)];
                      };
                      canvas.onpointerdown = (e) => { drawing = true; ctx.beginPath(); ctx.moveTo(...pos(e)); };
                      canvas.onpointermove = (e) => { if (drawing) ctx.lineTo(...pos(e)), ctx.stroke(); };
                      window.onpointerup = () => { drawing = false; };
                    }, 50); }} className="mt-3 w-full rounded-full bg-white py-2.5 text-[13px] font-semibold text-black transition hover:bg-white/90">
                      Pay ₹999 token (refundable)
                    </button>
                  </>
                )}
              </div>

              {/* Report listing — scam protection */}
              <div className="flex items-center justify-between rounded-[20px] border border-white/10 bg-card px-5 py-3.5">
                <p className="flex items-center gap-2 text-[11.5px] text-white/45"><Landmark size={12} className="text-white/40" /> {listing.verified ? 'Owner KYC verified by PGFinder' : 'Not yet verified by PGFinder'}</p>
                <ReportButton listing={listing} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
