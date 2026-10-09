import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { IMG, BRAND, STAT_CARDS } from '../data/listings.js';
import AISearchBar from './AISearchBar.jsx';

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <section ref={ref} className="px-2 pt-2 sm:px-3 sm:pt-3">
      <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px]">
        <motion.div style={{ y, scale }} className="absolute inset-0 -top-10 h-[calc(100%+80px)]">
          <img
            src={IMG.hero}
            alt="Bright modern PG room with large windows at dusk"
            fetchpriority="high"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />

        <div className="relative flex min-h-[94vh] flex-col justify-between px-5 pb-6 pt-28 sm:px-8 sm:pt-32">
          {/* Wordmark */}
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="select-none font-serif font-medium leading-none tracking-[0.03em] text-white/85"
              style={{ fontSize: 'clamp(2.6rem, 10.5vw, 10.5rem)' }}
            >
              {BRAND.wordmark}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.35 }}
              className="mt-3 text-[10px] uppercase tracking-[0.5em] text-white/75 sm:text-[12px]"
            >
              Find your home away from home
            </motion.p>
          </div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="mb-8"
          >
            <AISearchBar />
          </motion.div>

          {/* Bottom row */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.65 }}
              className="max-w-md"
            >
              <h2 className="font-serif text-3xl leading-tight sm:text-4xl">Find a PG that feels like home.</h2>
              <p className="mt-2 text-[13px] text-white/65">Verified stays. Fair prices. Zero brokerage.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.8 }}
              className="flex w-full max-w-xs flex-col gap-2.5 lg:w-auto"
            >
              {STAT_CARDS.map((s) => (
                <div
                  key={s.small}
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-white/[0.08] px-4 py-3 backdrop-blur-md transition duration-300 hover:border-white/25 hover:bg-white/[0.12]"
                >
                  <p className="font-serif text-lg text-white sm:text-xl">{s.big}</p>
                  <p className="text-[11.5px] text-white/70">{s.small}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
