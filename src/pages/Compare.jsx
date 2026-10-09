import { Link } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import TrustBadges from '../components/TrustBadges.jsx';
import useCompare from '../hooks/useShortlist.js';
import useWishlist from '../hooks/useWishlist.js';
import { LISTINGS, depositPolicy } from '../data/listings.js';
import { studyScore } from '../utils/intelligence.js';

export default function Compare() {
  const compare = useCompare();
  const wishlist = useWishlist();
  const items = compare.ids.map((id) => LISTINGS.find((l) => l.id === id)).filter(Boolean);

  const rows = [
    ['Rent / month', (l) => `₹${l.rent.toLocaleString('en-IN')}`],
    ['True monthly cost', (l) => `₹${(l.rent + l.trueCost.electricity + l.trueCost.food + l.trueCost.maintenance).toLocaleString('en-IN')}`],
    ['Deposit (one-time)', (l) => `₹${l.trueCost.deposit.toLocaleString('en-IN')}`],
    ['Gender', (l) => (l.gender === 'any' ? 'Co-ed' : l.gender === 'boys' ? 'Boys' : 'Girls')],
    ['Room type', (l) => l.roomType],
    ['Beds available', (l) => String(l.bedsAvailable)],
    ['Rating', (l) => `${l.rating} (${l.reviews})`],
    ['Study Score', (l) => { const s = studyScore(l); return s == null ? '—' : `${s.toFixed(1)} / 10`; }],
    ['Deposit & refund', (l) => depositPolicy(l) || '—'],
    ['Guest nights', (l) => l.policy?.guestNights || '—'],
    ['Notice period', (l) => l.policy?.noticePeriod || '—'],
    ['Mess rating', (l) => (l.mess ? `${l.mess.rating} / 5` : 'No mess')],
    ['WiFi tested', (l) => l.realityCheck.wifiTested],
    ['Water pressure', (l) => l.realityCheck.waterPressure],
    ['Safety', (l) => `${l.safety.cctv ? 'CCTV' : 'No CCTV'} · curfew ${l.safety.curfew}`],
  ];

  return (
    <div className="min-h-screen bg-canvas text-white">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-3 pb-16 pt-24 sm:pt-28">
        <div className="rounded-[24px] border border-white/[0.08] bg-surface p-5 sm:rounded-[28px] sm:p-8">
          <Link to="/pgs" className="text-[12.5px] text-white/55 hover:text-white"><ArrowLeft size={13} className="mr-1 inline" />Back to results</Link>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Compare stays</h1>
          <p className="mt-2 text-[13px] text-white/55">Up to 3 stays, every hidden number side by side.</p>

          {items.length === 0 ? (
            <div className="mt-10 rounded-[20px] border border-dashed border-white/15 p-14 text-center">
              <p className="text-3xl">⚖️</p>
              <p className="mt-3 font-serif text-xl">Nothing to compare yet</p>
              <p className="mt-1 text-[12.5px] text-white/50">Tap the ⚖ icon on any listing card to add it here.</p>
              <Link to="/pgs" className="mt-5 inline-block rounded-full bg-white px-5 py-2 text-[12.5px] font-medium text-black">Browse PGs</Link>
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr>
                    <th className="w-40" />
                    {items.map((l) => (
                      <th key={l.id} className="p-3 align-top">
                        <div className="relative rounded-[16px] border border-white/10 bg-card p-3">
                          <button onClick={() => compare.toggle(l.id)} className="absolute right-2 top-2 text-white/40 hover:text-white" aria-label="Remove">
                            <X size={13} />
                          </button>
                          <img src={l.images[0]} alt={l.name} className="h-20 w-full rounded-xl object-cover" />
                          <p className="mt-2 text-[13px] font-semibold leading-tight">{l.name}</p>
                          <p className="text-[11px] text-white/45">{l.area}</p>
                          <div className="mt-2"><TrustBadges trust={l.trust} compact /></div>
                          <Link to={`/pgs/${l.id}`} className="mt-2 block rounded-full border border-white/15 py-1.5 text-center text-[11px] hover:border-bronze/50 hover:text-bronze">View</Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([label, fn], ri) => (
                    <tr key={label} className={ri % 2 ? 'bg-white/[0.02]' : ''}>
                      <td className="p-3 text-[11.5px] uppercase tracking-[0.12em] text-white/45">{label}</td>
                      {items.map((l) => (
                        <td key={l.id} className="p-3 text-[13px] text-white/85">{fn(l)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="p-3 text-[11.5px] uppercase tracking-[0.12em] text-white/45">Save</td>
                    {items.map((l) => (
                      <td key={l.id} className="p-3">
                        <button
                          onClick={() => wishlist.toggle(l.id)}
                          className={`rounded-full border px-4 py-1.5 text-[11.5px] transition ${wishlist.has(l.id) ? 'border-bronze/60 bg-bronze/15 text-bronze' : 'border-white/15 text-white/65 hover:border-white/40'}`}
                        >
                          {wishlist.has(l.id) ? '♥ Saved' : '♡ Save'}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
