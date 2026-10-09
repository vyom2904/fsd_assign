import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="px-2 pb-2 pt-2 sm:px-3 sm:pb-3 sm:pt-3">
      <div className="mx-auto flex max-w-full flex-col items-center justify-between gap-4 rounded-[24px] border border-white/[0.08] bg-surface px-5 py-5 sm:flex-row sm:rounded-[28px] sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-bronze/40 bg-black/40 font-serif text-sm text-bronze">P</span>
          <span className="text-[11px] font-semibold tracking-[0.22em]">PGFINDER</span>
        </Link>

        <p className="order-3 text-center text-[11.5px] text-white/45 sm:order-none">© 2024 PGFinder. All Rights Reserved.</p>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4 text-[11.5px] text-white/55">
            <a href="#/" className="transition hover:text-white">Privacy Policy</a>
            <a href="#/" className="transition hover:text-white">Terms &amp; Conditions</a>
          </div>
          <div className="flex items-center gap-1.5">
            {[Instagram, Facebook, Youtube].map((Icon, i) => (
              <a key={i} href="#/" aria-label="Social link" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/65 transition hover:border-white/40 hover:text-white">
                <Icon size={13} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
