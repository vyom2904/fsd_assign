import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton({ listing, className = '' }) {
  const text = encodeURIComponent(`Hi! I'm interested in "${listing.name}" (${listing.area}) listed on PGFinder. Is a bed still available?`);
  return (
    <a
      href={`https://wa.me/919810012345?text=${text}`}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2.5 text-[13px] font-medium text-emerald-300 transition hover:bg-emerald-400/20 ${className}`}
    >
      <MessageCircle size={14} /> WhatsApp owner
    </a>
  );
}
