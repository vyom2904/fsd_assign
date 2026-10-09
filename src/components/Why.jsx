import { ShieldCheck, HandCoins, ReceiptText } from 'lucide-react';
import { Section, SectionLabel, FadeUp, PillButton } from './primitives.jsx';
import { IMG, BRAND } from '../data/listings.js';

const FEATURES = [
  { icon: ShieldCheck, title: 'Verified Listings', text: 'Every PG is checked in person before it goes live.' },
  { icon: HandCoins, title: 'No Brokerage', text: 'Talk directly to owners — nobody takes a cut.' },
  { icon: ReceiptText, title: 'Transparent Pricing', text: 'Rent, deposit and charges listed upfront. No surprises.' },
];

export default function Why() {
  return (
    <Section id="why" className="mt-2 sm:mt-3">
      <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-14">
        <FadeUp>
          <SectionLabel>Why {BRAND.name}</SectionLabel>
          <h2 className="mt-4 font-serif text-3xl leading-[1.15] sm:text-[2.6rem]">
            Stay smart.
            <br />
            Live better.
          </h2>
          <p className="mt-5 max-w-md text-[13.5px] leading-relaxed text-white/60">
            Hunting for a PG is chaotic — fake listings, hidden charges, agents at every turn. We fix that with verified
            homes, direct owner contact and prices you can trust, in every city we serve.
          </p>

          <ul className="mt-8 space-y-5">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-bronze/30 bg-bronze/10">
                  <f.icon size={16} className="text-bronze" />
                </span>
                <div>
                  <p className="text-[14px] font-semibold">{f.title}</p>
                  <p className="mt-0.5 text-[12.5px] text-white/55">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <PillButton variant="outline" href="#how" className="mt-9">
            Learn More
          </PillButton>
        </FadeUp>

        <FadeUp delay={0.15}>
          <div className="group relative h-full min-h-[380px] overflow-hidden rounded-[20px] lg:min-h-[520px]">
            <img
              src={IMG.why}
              alt="Cozy furnished PG bedroom with warm lighting"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-auto">
              <div className="rounded-2xl border border-white/[0.12] bg-white/[0.08] px-5 py-4 backdrop-blur-md">
                <p className="font-serif text-xl">Since {BRAND.since}</p>
                <p className="mt-0.5 text-[11.5px] text-white/65">Making city living simple.</p>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </Section>
  );
}
