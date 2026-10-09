import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, MessageCircle, UserCircle2, LogOut } from 'lucide-react';
import { BRAND } from '../data/listings.js';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Find PG', to: '/pgs' },
  { label: 'Roommates', to: '/roommates' },
  { label: 'Compare', to: '/compare' },
  { label: 'Market', to: '/marketplace' },
  { label: 'Owner Dashboard', to: '/owner' },
];
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isHash = (l) => l.to.startsWith('/#');

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={`pointer-events-auto flex w-full max-w-6xl items-center justify-between gap-2 rounded-full border py-2 pl-3 pr-2 transition-all duration-500 ${
          scrolled || open
            ? 'border-white/10 bg-[#121212]/85 shadow-2xl shadow-black/40 backdrop-blur-xl'
            : 'border-white/[0.08] bg-white/[0.06] backdrop-blur-md'
        }`}
      >
        <Link to="/" className="flex shrink-0 items-center gap-2.5 pl-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-bronze/40 bg-black/40 font-serif text-lg text-bronze">
            P
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-[12px] font-semibold tracking-[0.22em]">PGFINDER</span>
            <span className="block text-[9px] uppercase tracking-[0.3em] text-white/50">Verified stays</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {LINKS.map((l, i) => {
            const active = i <= 1 ? pathname === l.to : false;
            return isHash(l) ? (
              <a
                key={l.label}
                href={l.to}
                className="rounded-full px-3.5 py-2 text-[12.5px] text-white/65 transition-all duration-300 hover:bg-white/10 hover:text-white"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.label}
                to={l.to}
                className={`rounded-full px-3.5 py-2 text-[12.5px] transition-all duration-300 ${
                  active ? 'bg-white font-medium text-black' : 'text-white/65 hover:bg-white/10 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            to="/list"
            className="hidden items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-[12.5px] font-medium text-black transition hover:bg-white/90 md:inline-flex"
          >
            List Your PG
          </Link>
          <a href={BRAND.phoneHref} aria-label="Call us" className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white sm:flex">
            <Phone size={14} />
          </a>
          <a href={BRAND.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white sm:flex">
            <MessageCircle size={14} />
          </a>
          <button
            onClick={() => nav(user ? (user.role === 'owner' ? '/owner' : user.role === 'admin' ? '/admin' : '/dashboard') : '/auth')}
            aria-label="Account"
            title={user ? `${user.name} (${user.role})` : 'Sign in'}
            className="hidden h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition sm:flex border-bronze/50 bg-bronze/10 text-bronze hover:border-bronze"
          >
            <UserCircle2 size={15} />
          </button>
          {user && (
            <button onClick={() => { logout(); nav('/'); }} aria-label="Sign out"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-rose-400/50 hover:text-rose-300 sm:flex">
              <LogOut size={14} />
            </button>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white lg:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="pointer-events-auto mx-auto mt-2 w-[calc(100%-1.5rem)] max-w-6xl rounded-3xl border border-white/10 bg-[#121212]/95 p-3 backdrop-blur-xl lg:hidden">
          {LINKS.map((l) =>
            isHash(l) ? (
              <a key={l.label} href={l.to} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-sm text-white/70 hover:bg-white/5">
                {l.label}
              </a>
            ) : (
              <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-sm text-white/70 hover:bg-white/5">
                {l.label}
              </Link>
            )
          )}
          <Link to="/list" onClick={() => setOpen(false)} className="mt-2 block rounded-2xl bg-white px-4 py-3 text-center text-sm font-medium text-black">
            List Your PG
          </Link>
        </div>
      )}
    </header>
  );
}
