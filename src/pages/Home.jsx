import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Hero from '../components/Hero.jsx';
import Why from '../components/Why.jsx';
import Categories from '../components/Categories.jsx';
import TopPicks from '../components/TopPicks.jsx';
import Spotlight from '../components/Spotlight.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import Testimonials from '../components/Testimonials.jsx';
import CTA from '../components/CTA.jsx';
import BudgetPlanner from '../components/BudgetPlanner.jsx';
import { Section, SectionLabel, FadeUp, PillButton } from '../components/primitives.jsx';

function ExtraFeatures() {
  const items = [
    { icon: '🧭', title: 'Commute-first search', text: 'Real travel time to your college — walk, cycle, bus or metro — with rush-hour truth.', to: '/pgs' },
    { icon: '🤖', title: 'Ask in plain words', text: '"Girls PG under ₹9,000 with WiFi near LD College" — our AI parses it instantly.', to: '/pgs' },
    { icon: '🤝', title: 'Roommate matching', text: 'A 5-question quiz that pairs you with students who share your habits.', to: '/roommates' },
    { icon: '📊', title: 'Price Honesty', text: 'Rent + electricity + food + deposit. The number you\'ll actually pay, upfront.', to: '/pgs' },
    { icon: '⚖️', title: 'Compare up to 3', text: 'Shortlist stays and see hidden costs side by side.', to: '/compare' },
    { icon: '🛋️', title: 'Move-out market', text: 'Bikes, books and coolers from seniors who are moving out.', to: '/marketplace' },
  ];
  return (
    <Section id="features" className="mt-2 sm:mt-3">
      <div className="p-6 sm:p-10 lg:p-14">
        <FadeUp>
          <SectionLabel>Beyond listings</SectionLabel>
          <h2 className="mt-4 max-w-2xl font-serif text-3xl leading-[1.15] sm:text-[2.6rem]">
            Everything between "searching" and "moving in".
          </h2>
        </FadeUp>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.05}>
              <Link to={f.to} className="group flex h-full flex-col rounded-[20px] border border-white/[0.08] bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-cardhi">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-3 text-[15px] font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/55">{f.text}</p>
                <span className="mt-auto pt-4 text-[12px] font-medium text-bronze opacity-0 transition group-hover:opacity-100">Try it →</span>
              </Link>
            </FadeUp>
          ))}
        </div>
      </div>
    </Section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas text-white">
      <Navbar />
      <main className="mx-auto max-w-[1440px]">
        <Hero />
        <Why />
        <ExtraFeatures />
        <Categories />
        <TopPicks />
        <Spotlight />
        <HowItWorks />
        <Testimonials />
        {/* Budget planner strip */}
        <Section className="mt-2 sm:mt-3">
          <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:items-center lg:p-14">
            <FadeUp>
              <SectionLabel>Plan your money</SectionLabel>
              <h2 className="mt-4 font-serif text-3xl leading-[1.15] sm:text-[2.6rem]">Know your number before you move.</h2>
              <p className="mt-5 max-w-md text-[13.5px] leading-relaxed text-white/60">
                Drag the sliders — see how rent, food, travel and deposit fit your budget. Every listing shows its true
                monthly cost so there are no surprises on day one.
              </p>
              <div className="mt-8"><PillButton href="#/pgs" variant="outline">Find PGs in your budget</PillButton></div>
            </FadeUp>
            <FadeUp delay={0.15}><BudgetPlanner /></FadeUp>
          </div>
        </Section>
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
