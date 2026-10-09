import { useNavigate } from 'react-router-dom';
import { User, Users, Home, BedDouble, DoorOpen, Sparkles } from 'lucide-react';
import { Section, SectionLabel, FadeUp } from './primitives.jsx';

const CATS = [
  { icon: User, title: 'Boys PG', text: 'Safe, social and built for student life.', q: '?gender=boys' },
  { icon: Users, title: 'Girls PG', text: 'Verified stays with safety as standard.', q: '?gender=girls' },
  { icon: Home, title: 'Co-living', text: 'Community living with hotel-grade comfort.', q: '?type=Co-living' },
  { icon: BedDouble, title: 'Single Room', text: 'Your own space, fully furnished.', q: '?type=Single%20Room' },
  { icon: DoorOpen, title: 'Sharing Room', text: 'Split the rent, keep the comfort.', q: '?type=Sharing%20Room' },
  { icon: Sparkles, title: 'Premium / AC', text: 'AC rooms and premium amenities.', q: '?type=Premium%20AC' },
];

export default function Categories() {
  const navigate = useNavigate();
  return (
    <Section id="categories" className="mt-2 sm:mt-3">
      <div className="p-6 sm:p-10 lg:p-14">
        <FadeUp>
          <SectionLabel>Browse by Type</SectionLabel>
          <h2 className="mt-4 max-w-lg font-serif text-3xl leading-[1.15] sm:text-[2.6rem]">A PG for every lifestyle.</h2>
        </FadeUp>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-2.5">
          {CATS.map((c, i) => (
            <FadeUp key={c.title} delay={i * 0.06}>
              <button
                onClick={() => navigate(`/pgs${c.q}`)}
                className="group flex h-full w-full flex-col rounded-[20px] border border-white/[0.08] bg-card p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-cardhi"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-bronze/30 bg-bronze/10">
                  <c.icon size={17} className="text-bronze" />
                </span>
                <h3 className="mt-4 text-[14.5px] font-semibold leading-snug">{c.title}</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/55">{c.text}</p>
                <span className="mt-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 pt-4 text-white/80 transition-all duration-300 group-hover:translate-x-1 group-hover:border-bronze/50 group-hover:text-bronze"
                  style={{ marginTop: 'auto' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </button>
            </FadeUp>
          ))}
        </div>
      </div>
    </Section>
  );
}
