import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, GitCompareArrows, BedDouble, Bike } from 'lucide-react';
import TrustBadges from './TrustBadges.jsx';
import TrueCost from './TrueCost.jsx';
import StudyScore from './StudyScore.jsx';
import { depositPolicy } from '../data/listings.js';
import { commuteCost } from '../utils/intelligence.js';

import { bestCommute } from '../utils/intelligence.js';

export default function ListingCard({ listing, saved, onToggleSave, compare, onToggleCompare, commuteNote, activeCollegeId, rush }) {
  const [popped, setPopped] = useState(false);
  const bestCommuteMemo = activeCollegeId ? bestCommute(listing, activeCollegeId, rush) : null;
  const navigate = useNavigate();

  function handleSave(e) {
    e.preventDefault();
    setPopped(true);
    setTimeout(() => setPopped(false), 320);
    onToggleSave(listing.id);
  }

  function handleCompare(e) {
    e.preventDefault();
    onToggleCompare(listing.id);
  }

  return (
    <div
      onClick={() => navigate(`/pgs/${listing.id}`)}
      className="group block w-full cursor-pointer overflow-hidden rounded-[20px] border border-white/[0.08] bg-card transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-cardhi"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={listing.images[0]}
          alt={`${listing.name} in ${listing.area}, ${listing.city}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {listing.bedsAvailable > 0 ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10.5px] font-semibold text-emerald-300 backdrop-blur">
            <BedDouble size={11} /> {listing.bedsAvailable} {listing.bedsAvailable === 1 ? 'bed' : 'beds'} left
          </span>
        ) : (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10.5px] font-semibold text-rose-300 backdrop-blur">Full</span>
        )}
        <div className="absolute right-3 top-3 flex gap-1.5">
          <button
            onClick={handleCompare}
            aria-label="Add to compare"
            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition ${
              compare ? 'bg-sky-400/90 text-black' : 'bg-black/50 text-white/80 hover:bg-black/70'
            }`}
          >
            <GitCompareArrows size={14} />
          </button>
          <button
            onClick={handleSave}
            aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition ${
              saved ? 'bg-bronze/90 text-black' : 'bg-black/50 text-white/80 hover:bg-black/70'
            }`}
          >
            <Heart size={14} className={popped ? 'pop' : ''} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold leading-snug">{listing.name}</h3>
          <span className="flex shrink-0 items-center gap-1 text-[12.5px] text-bronze">
            <Star size={12} fill="currentColor" strokeWidth={0} />
            {listing.rating}
          </span>
        </div>
        <p className="mt-0.5 text-[12px] text-white/50">
          {listing.area} · {listing.gender === 'any' ? 'Co-ed' : listing.gender === 'boys' ? 'Boys' : 'Girls'}
        </p>
        {commuteNote && <p className="mt-0.5 text-[11.5px] font-medium text-sky-300">{commuteNote}</p>}
        {commuteNote && (() => { const cc = commuteCost(bestCommuteMemo); return cc && cc.perDay > 0 ? (
          <p className="text-[10.5px] text-white/40"><Bike size={10} className="mr-1 inline" />~₹{cc.perDay}/day commute · ₹{cc.perMonth.toLocaleString('en-IN')}/month</p>
        ) : commuteNote ? <p className="text-[10.5px] text-white/40"><Bike size={10} className="mr-1 inline" />walkable — no commute cost</p> : null; })()}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <TrustBadges trust={listing.trust} compact />
          <StudyScore listing={listing} size="sm" />
        </div>
        {depositPolicy(listing) && (
          <p className="mt-1.5 text-[10.5px] text-white/45">Deposit: {depositPolicy(listing)}</p>
        )}

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {listing.amenities.slice(0, 3).map((a) => (
            <span key={a} className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10.5px] text-white/65">{a}</span>
          ))}
          {listing.amenities.length > 3 && (
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10.5px] text-white/65">+{listing.amenities.length - 3}</span>
          )}
        </div>

        <div className="mt-auto pt-3">
          <TrueCost listing={listing} size="sm" />
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-[17px] font-semibold text-bronze">
              ₹{listing.rent.toLocaleString('en-IN')}
              <span className="text-[11px] font-normal text-white/45">/month</span>
            </p>
            <span className="text-[11px] text-white/40">{listing.reviews} reviews</span>
          </div>
        </div>
      </div>
    </div>
  );
}
