import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Wallet, DoorOpen, Wifi, Utensils, Snowflake, ShieldCheck } from 'lucide-react';
import { Section, SectionLabel, FadeUp, PillButton } from './primitives.jsx';
import { SPOTLIGHT } from '../data/listings.js';

const AMENITY_ICONS = { WiFi: Wifi, Meals: Utensils, AC: Snowflake, 'Power Backup': ShieldCheck };

export default function Spotlight() {
  const l = SPOTLIGHT;
  const meta = [
    { icon: MapPin, label: 'Location', value: `${l.area}, ${l.city}` },
    { icon: DoorOpen, label: 'Room Type', value: l.roomType },
    { icon: Wallet, label: 'Price / month', value: `₹${l.rent.toLocaleString('en-IN')}` },
    { icon: BedDouble, label: 'Available beds', value: String(l.bedsAvailable) },
  ];

  return (
    <Section id="spotlight" className="mt-2 sm:mt-3">
      <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-14 lg:p-14">
        <FadeUp>
          <SectionLabel>Featured Stay</SectionLabel>
          <h2 className="mt-4 font-serif text-3xl leading-[1.15] sm:text-[2.6rem]">Comfort you can afford.</h2>
          <p className="mt-5 max-w-md text-[13.5px] leading-relaxed text-white/60">{l.description}</p>

          <ul className="mt-8 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {meta.map((m) => (
              <li key={m.label} className="flex items-center gap-4 py-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-bronze/30 bg-bronze/10">
                  <m.icon size={14} className="text-bronze" />
                </span>
                <span className="w-32 text-[11px] uppercase tracking-[0.18em] text-white/45">{m.label}</span>
                <span className="text-[13.5px] font-medium">{m.value}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-2">
            {l.amenities.slice(0, 4).map((a) => {
              const Icon = AMENITY_ICONS[a] || Wifi;
              return (
                <span key={a} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11.5px] text-white/70">
                  <Icon size={12} className="text-bronze" /> {a}
                </span>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <PillButton href={`#/pgs/${l.id}`}>View Details</PillButton>
            <PillButton variant="outline" href={`#/pgs/${l.id}#contact-owner`}>
              Contact Owner
            </PillButton>
          </div>
        </FadeUp>

        <FadeUp delay={0.15}>
          <div className="group overflow-hidden rounded-[20px]">
            <img
              src={l.images[0]}
              alt={`${l.name} — ${l.area}, ${l.city}`}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105 lg:aspect-[5/4]"
            />
          </div>
          <div className="mt-3 flex gap-3">
            {l.images.map((src, i) => (
              <div key={src} className="group/thumb h-16 w-24 overflow-hidden rounded-xl border border-white/10">
                <img
                  src={src}
                  alt={`${l.name} photo ${i + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-70 transition group-hover/thumb:opacity-100"
                />
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </Section>
  );
}
