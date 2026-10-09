import { Tag, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { MARKET_ITEMS } from '../data/listings.js';

export default function Marketplace() {
  return (
    <div className="min-h-screen bg-canvas text-white">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-3 pb-16 pt-24 sm:pt-28">
        <div className="rounded-[24px] border border-white/[0.08] bg-surface p-5 sm:rounded-[28px] sm:p-8">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-bronze">
            <Tag size={12} /> Move-out marketplace
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Pre-loved by seniors, priced for students.</h1>
          <p className="mt-2 max-w-xl text-[13px] text-white/55">
            Students moving out sell their stuff here — mattresses, coolers, books, cycles. Meet at the PG, check it, pay cash or UPI. No shipping, no scams.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MARKET_ITEMS.map((item) => (
              <div key={item.id} className="group overflow-hidden rounded-[20px] border border-white/[0.08] bg-card transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
                <div className="aspect-square overflow-hidden">
                  <img src={item.img} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <p className="text-[13.5px] font-semibold leading-snug">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-white/40">{item.cond} · sold by {item.seller}</p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <p className="font-serif text-xl text-bronze">₹{item.price.toLocaleString('en-IN')}</p>
                    <a href="https://wa.me/919810012345" target="_blank" rel="noreferrer" aria-label="WhatsApp seller" className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/40 text-emerald-300 transition hover:bg-emerald-400/10">
                      <MessageCircle size={13} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-bronze/25 bg-bronze/[0.07] p-4 text-[12.5px] text-white/70">
            🎓 <span className="font-medium text-white">Campus ambassador programme:</span> are you a student rep? Earn ₹200 per verified listing you bring in and ₹100 per successful referral.
            <button className="ml-2 rounded-full border border-bronze/50 px-3 py-1 text-[11.5px] font-medium text-bronze hover:bg-bronze/10">Apply as ambassador</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
