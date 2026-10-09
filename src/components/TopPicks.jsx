import { Link } from 'react-router-dom';
import { Section, SectionLabel, FadeUp, PillButton } from './primitives.jsx';
import ListingCard from './ListingCard.jsx';
import useWishlist from '../hooks/useWishlist.js';
import { LISTINGS } from '../data/listings.js';

export default function TopPicks() {
  const wishlist = useWishlist();
  const picks = LISTINGS.slice(0, 4);

  return (
    <Section id="top-picks" className="mt-2 sm:mt-3">
      <div className="p-6 sm:p-10 lg:p-14">
        <FadeUp>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel>Top Picks</SectionLabel>
              <h2 className="mt-4 max-w-lg font-serif text-3xl leading-[1.15] sm:text-[2.6rem]">
                Places people love to stay.
              </h2>
            </div>
            <PillButton variant="outline" href="#/pgs" className="shrink-0">
              Explore All PGs
            </PillButton>
          </div>
        </FadeUp>

        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {picks.map((l, i) => (
            <FadeUp key={l.id} delay={i * 0.08}>
              <ListingCard listing={l} saved={wishlist.has(l.id)} onToggleSave={wishlist.toggle} />
            </FadeUp>
          ))}
        </div>

        <p className="mt-4 text-center text-[12px] text-white/40 lg:hidden">← Swipe to see more →</p>
        <div className="mt-6 hidden justify-center lg:flex">
          <Link to="/pgs" className="text-[13px] text-white/55 underline-offset-4 transition hover:text-bronze hover:underline">
            View all 5,000+ verified PGs →
          </Link>
        </div>
      </div>
    </Section>
  );
}
