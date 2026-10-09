import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react';
import { Section, FadeUp } from './primitives.jsx';
import { IMG, BRAND } from '../data/listings.js';

const CONTACTS = [
  { icon: Phone, label: 'Call us', value: BRAND.phone, href: BRAND.phoneHref },
  { icon: Mail, label: 'Email us', value: BRAND.email, href: `mailto:${BRAND.email}` },
  { icon: MessageCircle, label: 'WhatsApp', value: BRAND.phone, href: BRAND.whatsapp },
  { icon: MapPin, label: 'Office', value: BRAND.address, href: '#contact' },
];

export default function CTA() {
  return (
    <Section id="contact" className="mt-2 sm:mt-3">
      <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr_0.8fr] lg:items-center lg:gap-12 lg:p-14">
        <FadeUp>
          <h2 className="font-serif text-3xl leading-[1.15] sm:text-4xl">Own a PG? List it with us.</h2>
          <p className="mt-3 text-[13.5px] text-white/60">Reach thousands of verified tenants — students and professionals actively searching in your city.</p>
          <p className="mt-5 max-w-md text-[12.5px] leading-relaxed text-white/45">
            Free to list. You get a dedicated dashboard, direct enquiries, and we handle verification so your listing earns the trust badge.
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <ul className="space-y-4">
            {CONTACTS.map((c) => (
              <li key={c.label}>
                <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="group flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-bronze/30 bg-bronze/10 transition group-hover:border-bronze/60">
                    <c.icon size={15} className="text-bronze" />
                  </span>
                  <span>
                    <span className="block text-[11px] uppercase tracking-[0.18em] text-white/45">{c.label}</span>
                    <span className="mt-0.5 block max-w-xs text-[13.5px] font-medium text-white/85 transition group-hover:text-white">{c.value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="group relative overflow-hidden rounded-[20px]">
            <img src={IMG.cta} alt="Bright modern PG bedroom" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105 lg:aspect-square" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute inset-x-4 bottom-4 flex justify-center">
              <a href="#/list" className="inline-flex w-full items-center justify-center rounded-full bg-white py-2.5 text-[13px] font-semibold text-black transition hover:bg-white/90">
                List Your PG
              </a>
            </div>
          </div>
        </FadeUp>
      </div>
    </Section>
  );
}
