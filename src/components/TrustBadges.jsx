import { BadgeCheck, Footprints, Camera, ShieldCheck } from 'lucide-react';

export default function TrustBadges({ trust, compact = false }) {
  if (!trust) return null;
  const badges = [
    { on: trust.physicallyVisited, icon: Footprints, label: 'Physically visited' },
    { on: trust.ownerKYC, icon: ShieldCheck, label: 'Owner KYC verified' },
    { on: trust.photosMatch, icon: Camera, label: 'Photos match reality' },
  ].filter((b) => b.on);

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-[10.5px] text-bronze">
        <BadgeCheck size={11} />
        {badges.length}/{3} verified
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <span key={b.label} className="inline-flex items-center gap-1.5 rounded-full border border-bronze/30 bg-bronze/10 px-2.5 py-1 text-[10.5px] font-medium text-bronze">
          <b.icon size={11} /> {b.label}
        </span>
      ))}
    </div>
  );
}
