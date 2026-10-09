import { LISTINGS, COLLEGES } from '../data/listings.js';

// ─── Commute helpers ────────────────────────────────────────────────
export const MODE_LABEL = { walk: 'Walk', cycle: 'Cycle', bus: 'Bus', metro: 'Metro' };

// Pick best mode + minutes for a listing → college, at normal or rush hour
export function bestCommute(listing, collegeId, rush = false) {
  const pair = listing.commute?.[collegeId];
  if (!pair) return null;
  const idx = rush ? 1 : 0;
  const minutes = pair[idx];
  const normal = pair[0];
  let mode = 'walk';
  if (normal <= 12) mode = 'walk';
  else if (normal <= 25) mode = 'cycle';
  else if (normal <= 45) mode = 'bus';
  else mode = 'metro';
  return { minutes, mode, rushDelta: rush ? minutes - normal : 0 };
}

export function commuteLabel(c) {
  if (!c) return '—';
  const m = c.minutes;
  const suffix = c.rushDelta > 0 ? ` (+${c.rushDelta} rush)` : '';
  return `${m} min ${MODE_LABEL[c.mode].toLowerCase()}${suffix}`;
}

// ─── Natural-language search ("Veg PG under ₹8,000 with AC near LD") ─
export function parseQuery(text) {
  const t = text.toLowerCase();
  const out = { raw: text, gender: '', max: null, min: null, amenities: [], veg: null, collegeId: '', roomType: '' };

  const budget = t.match(/(?:under|below|less than|upto|up to|max)\s*₹?\s*([\d,]+)(?:\s*k)?/) || t.match(/₹\s*([\d,]+)/);
  if (budget) {
    let n = Number(budget[1].replace(/,/g, ''));
    if (/\d\s*k/.test(budget[0]) || n < 100) n *= 1000;
    out.max = n;
  }

  if (/\b(boys?|male|gents?)\b/.test(t)) out.gender = 'boys';
  if (/\b(girls?|female|ladies?)\b/.test(t)) out.gender = 'girls';
  if (/\b(co-?ed|any)\b/.test(t)) out.gender = 'any';

  if (/\bveg(etarian)?\b/.test(t)) out.veg = true;
  if (/\bnon-?veg\b/.test(t)) out.veg = false;

  const amenityMap = [
    [/wifi|internet/, 'WiFi'],
    [/\bac\b|air ?cond/, 'AC'],
    [/meals?|food|mess/, 'Meals'],
    [/laundry|washing/, 'Laundry'],
    [/gym/, 'Gym'],
    [/parking/, 'Parking'],
    [/cctv|security/, 'CCTV'],
    [/housekeeping|cleaning/, 'Housekeeping'],
    [/hot water|geyser/, 'Hot Water'],
    [/power ?backup|inverter/, 'Power Backup'],
  ];
  amenityMap.forEach(([re, name]) => {
    if (re.test(t)) out.amenities.push(name);
  });

  if (/single/.test(t)) out.roomType = 'Single Room';
  if (/shar|twin|double/.test(t)) out.roomType = 'Sharing Room';
  if (/co-?living|premium/.test(t)) out.roomType = 'Co-living';

  const college = COLLEGES.find((c) => {
    const words = c.name.toLowerCase().replace(/college|university/g, '').trim().split(/\s+/);
    return words.some((w) => w.length >= 2 && t.includes(w));
  });
  if (college) out.collegeId = college.id;

  return out;
}

export function applyParsed(listings, q) {
  return listings.filter((l) => {
    if (q.max && l.rent + (l.trueCost?.electricity || 0) + (l.trueCost?.food || 0) > q.max && l.rent > q.max) return false;
    if (q.gender && l.gender !== 'any' && l.gender !== q.gender) return false;
    if (q.roomType && l.roomType !== q.roomType) return false;
    if (q.amenities.length && !q.amenities.every((a) => l.amenities.includes(a))) return false;
    if (q.veg && !(l.mess && l.rules.some((r) => /veg/i.test(r)))) return false;
    return true;
  });
}

// ─── Commute cost estimate (shown on cards) ──────────────────────────
export const COMMUTE_COST = { walk: 0, cycle: 5, bus: 10, metro: 25 }; // ₹ / day, round trip

export function commuteCost(c) {
  if (!c) return null;
  const perDay = COMMUTE_COST[c.mode] ?? 0;
  return { perDay, perMonth: perDay * 26 };
}

// ─── Study Score /10 — WiFi, quiet hours, study room, power backup, desk ─
export function studyScore(listing) {
  const s = listing.study;
  if (!s) return null;
  // Tiered WiFi: baseline for having usable internet, bonus for real speed
  const wifiTier = s.wifiSpeed >= 150 ? 3 : s.wifiSpeed >= 50 ? 2.5 : s.wifiSpeed >= 25 ? 2 : 1.5;
  const pts =
    wifiTier * 0.3 + // 30% — tested WiFi speed
    (s.quietHours ? 2 : 0) + // 20% — enforced quiet hours
    (s.studyRoom ? 2 : 0) + // 20% — dedicated study room
    (s.powerBackup ? 1.5 : 0) + // 15% — inverter/generator
    (s.desk ? 1.5 : 0) + // 15% — desk in room
    1; // baseline — it's still a liveable room
  return Math.min(10, Math.round(pts * 10) / 10);
}

// ─── Flexible stays: semester / exam-period pricing ───────────────
export function priceForStay(listing, duration) {
  if (!duration || !duration.months) return null;
  const monthly = Math.round((listing.rent * duration.mult) / 10) * 10;
  return { monthly, total: monthly * duration.months, note: duration.note };
}

// Sort by commute when a college is detected
export function sortByCommute(listings, collegeId, rush = false) {
  if (!collegeId) return listings;
  return [...listings].sort((a, b) => {
    const ca = a.commute?.[collegeId]?.[rush ? 1 : 0] ?? 999;
    const cb = b.commute?.[collegeId]?.[rush ? 1 : 0] ?? 999;
    return ca - cb;
  });
}
