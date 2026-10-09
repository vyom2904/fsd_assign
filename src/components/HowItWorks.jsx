import { Search, GitCompareArrows, CalendarCheck, KeyRound } from 'lucide-react';
import { Section, SectionLabel, FadeUp } from './primitives.jsx';

const STEPS = [
  { icon: Search, title: 'Search your city', text: 'Filter by area, gender, budget and amenities.' },
  { icon: GitCompareArrows, title: 'Compare & shortlist', text: 'Save favourites and weigh them side by side.' },
  { icon: CalendarCheck, title: 'Visit or take a tour', text: 'Book a visit or a virtual tour with the owner.' },
  { icon: KeyRound, title: 'Book & move in', text: 'Zero brokerage. Transparent paperwork. Move in.' },
];

export default function HowItWorks() {
  return (
    <Section id="how" className="mt-2 sm:mt-3">
      <div className="p-6 sm:p-10 lg:p-14">
        <FadeUp>
          <SectionLabel>How It Works</SectionLabel>
          <h2 className="mt-4 max-w-lg font-serif text-3xl leading-[1.15] sm:text-[2.6rem]">
            From search to keys in four steps.
          </h2>
        </FadeUp>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <FadeUp key={s.title} delay={i * 0.08}>
              <div className="group relative h-full rounded-[20px] border border-white/[0.08] bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-cardhi">
                <span className="absolute right-5 top-4 font-serif text-4xl text-white/10">0{i + 1}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-bronze/30 bg-bronze/10">
                  <s.icon size={17} className="text-bronze" />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/55">{s.text}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </Section>
  );
}
