import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function SectionLabel({ children, className = '' }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.28em] text-bronze ${className}`}>{children}</p>
  );
}

export function PillButton({ children, href = '#', variant = 'white', className = '', onClick }) {
  const styles =
    variant === 'white'
      ? 'bg-white text-black hover:bg-white/90'
      : 'border border-white/25 text-white hover:border-white/60 hover:bg-white/5';
  return (
    <a
      href={href}
      onClick={onClick}
      className={`group inline-flex items-center gap-2.5 rounded-full py-2 pl-5 pr-2 text-[13px] font-medium transition-all duration-300 ${styles} ${className}`}
    >
      {children}
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5 ${
          variant === 'white' ? 'bg-black text-white' : 'bg-white/10 text-white'
        }`}
      >
        <ArrowRight size={13} strokeWidth={2.2} />
      </span>
    </a>
  );
}

export function FadeUp({ children, delay = 0, className = '', y = 28 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Section({ id, children, className = '' }) {
  return (
    <section id={id} className="px-2 sm:px-3">
      <div className={`rounded-[24px] border border-white/[0.08] bg-surface sm:rounded-[28px] ${className}`}>
        {children}
      </div>
    </section>
  );
}
