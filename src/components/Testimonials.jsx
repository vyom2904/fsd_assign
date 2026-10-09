import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Quote, Star } from 'lucide-react';
import { Section, SectionLabel, FadeUp } from './primitives.jsx';
import { TESTIMONIALS } from '../data/listings.js';

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const t = TESTIMONIALS[index];
  const prev = () => setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setIndex((i) => (i + 1) % TESTIMONIALS.length);

  return (
    <Section id="reviews" className="mt-2 sm:mt-3">
      <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.4fr_1fr] lg:gap-6 lg:p-12">
        <FadeUp>
          <SectionLabel>Residents Love Us</SectionLabel>
          <h2 className="mt-4 font-serif text-2xl leading-snug sm:text-3xl">Trusted by students and professionals.</h2>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="rounded-[20px] border border-white/[0.1] bg-card p-6 sm:p-7">
            <Quote size={28} className="text-bronze" fill="currentColor" strokeWidth={0} />
            <div className="mt-3 min-h-[96px]">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="text-[13.5px] leading-relaxed text-white/75"
                >
                  {t.quote}
                </motion.blockquote>
              </AnimatePresence>
            </div>
            <div className="mt-4 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="text-bronze" fill="currentColor" strokeWidth={0} />
              ))}
              <span className="ml-2 text-[11px] text-white/50">4.7 Rating</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === index ? 'w-6 bg-bronze' : 'w-1.5 bg-white/25 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={prev} aria-label="Previous" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:bg-white/5">
                  <ArrowLeft size={14} />
                </button>
                <button onClick={next} aria-label="Next" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:bg-white/5">
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.2} className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <img src={t.avatar} alt={`Photo of ${t.name}`} loading="lazy" className="h-16 w-16 rounded-full border border-white/15 object-cover" />
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <p className="mt-3 text-[14px] font-semibold">{t.name}</p>
              <p className="text-[12px] text-white/50">{t.place}</p>
            </motion.div>
          </AnimatePresence>
        </FadeUp>
      </div>
    </Section>
  );
}
