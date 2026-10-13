// ─── StayScout · Assistant engine ───────────────────────────────────
// A rule-based, DATA-GROUNDED question-answering engine behind the chat
// widget. Every answer is composed from StayScout's own records — the
// listing dataset (rent, true cost, amenities, policies, safety, study
// inputs), colleges, reviews, roommates, marketplace items — or from the
// live Express+MongoDB API when a signed-in user asks about their own
// tickets / rent history / switching plan.
//
// It is deliberately NOT a generative model: it has no fabricated facts
// and openly says "I don't have that" plus a human contact when a
// question maps to nothing. Ask "are you an AI?" and it will tell you.

import {
  LISTINGS,
  COLLEGES,
  DURATIONS,
  REVIEWS,
  ROOMMATES,
  MARKET_ITEMS,
  BRAND,
  depositPolicy,
} from '../data/listings.js';
import {
  parseQuery,
  applyParsed,
  sortByCommute,
  bestCommute,
  commuteLabel,
  studyScore,
  priceForStay,
  commuteCost,
} from './intelligence.js';
import { api } from '../api.js';

// ─── tiny helpers ───────────────────────────────────────────────────
const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const genderText = (g) => (g === 'any' ? 'co-ed' : g === 'boys' ? 'boys' : 'girls');
const totalMonthly = (l) =>
  l.rent + (l.trueCost?.electricity || 0) + (l.trueCost?.food || 0) + (l.trueCost?.maintenance || 0);
const listingById = (id) => LISTINGS.find((l) => l.id === id) || null;
const collegeById = (id) => COLLEGES.find((c) => c.id === id) || null;
const nameOfListing = (id) => listingById(id)?.name || id;

const DEFAULT_CHIPS = [
  'Girls PG under ₹9,000 near LD College',
  'Cheapest PG in Ahmedabad',
  'How much deposit will I pay?',
  'Which PG is best for studying?',
];

const SEARCH_WORDS = /find|show|looking for|need a|want a|suggest|recommend|options|pg|hostel|accommodation|room/;

// Words that appear in listing names but carry no identity ("the Den" ⇒ "den")
const STOP = new Set(['the', 'and', 'for', 'with', 'near', 'from', 'that', 'this', 'you', 'are', 'old', 'new', 'any', 'all', 'living', 'rooms', 'room', 'pg']);

function nameTokens(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

// Score listings mentioned by name / area in the question
function matchListings(t) {
  return LISTINGS.map((l) => {
    const name = l.name.toLowerCase();
    let score = 0;
    if (t.includes(name)) score += 12;
    nameTokens(l.name).forEach((w) => {
      if (t.includes(w)) score += 3;
    });
    if (t.includes(l.area.toLowerCase())) score += 4;
    if (t.includes(l.id.replace(/-/g, ' '))) score += 6;
    return { l, score };
  })
    .filter((s) => s.score >= 3)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.l);
}

const bounded = (w, t) => new RegExp(`\\b${w}\\b`).test(t);

function matchColleges(t) {
  return COLLEGES.map((c) => {
    const name = c.name.toLowerCase();
    let score = 0;
    if (t.includes(name)) score += 12;
    name.replace(/college|university|icccr|\/|manipal/g, ' ').split(/\s+/).forEach((w) => {
      if (w.length > 2 && bounded(w, t)) score += 3;
    });
    if (w_len_safe(t, c.area)) score += 2;
    return { c, score };
  })
    .filter((s) => s.score >= 3)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.c);
}

// area strings are phrases ("Chharodi, SG Highway") — only match the first word
function w_len_safe(t, area) {
  const first = (area || '').split(/[,\s]+/)[0].toLowerCase();
  return first.length > 3 && t.includes(first);
}

function listingFromPath(pathname = '') {
  const m = pathname.match(/\/pgs\/([^/?#]+)/);
  return m ? listingById(decodeURIComponent(m[1])) : null;
}

// "this PG" / "here" on a listing page → that listing
function listingFromContext(t, ctx) {
  const explicit = matchListings(t);
  if (explicit.length) return explicit[0];
  if (/\b(this|here|current|the same)\b/.test(t)) return listingFromPath(ctx.pathname);
  return null;
}

function commuteBullets(listing, collegeIds, rush = false) {
  return collegeIds
    .map((id) => {
      const c = collegeById(id);
      const b = bestCommute(listing, id, rush);
      if (!c || !b) return null;
      const cc = commuteCost(b);
      return `${c.name} — ${commuteLabel(b)}${cc?.perMonth ? ` · ~${money(cc.perMonth)}/month commute cost` : ''}`;
    })
    .filter(Boolean);
}

function nearestColleges(listing, limit = 3) {
  return COLLEGES.map((c) => ({ c, m: listing.commute?.[c.id]?.[0] ?? 999 }))
    .sort((a, b) => a.m - b.m)
    .slice(0, limit);
}

function listingSummary(l) {
  const near = nearestColleges(l, 3);
  const price = totalMonthly(l);
  const study = studyScore(l);
  const bullets = [
    `Rent ${money(l.rent)}/month · **true monthly cost ≈ ${money(price)}** (rent${l.trueCost?.electricity ? ` + ${money(l.trueCost.electricity)} electricity` : ''}${l.trueCost?.food ? ` + ${money(l.trueCost.food)} food` : ''}${l.trueCost?.maintenance ? ` + ${money(l.trueCost.maintenance)} maintenance` : ''})`,
    `${l.area} · ${genderText(l.gender)} · ${l.roomType} · ${l.bedsAvailable} bed${l.bedsAvailable === 1 ? '' : 's'} left`,
    `Deposit: ${depositPolicy(l) || '—'} · notice period ${l.policy?.noticePeriod || '—'}`,
    study ? `Study Score ${study}/10 · WiFi tested at ${l.study.wifiSpeed} Mbps` : null,
    l.safety ? `Safety: curfew ${l.safety.curfew}, ${l.safety.cctv ? 'CCTV' : 'no CCTV'}${l.safety.womenOnlyFloor ? ', women-only floor' : ''}${l.safety.guard ? ', guard on duty' : ''}` : null,
    `Nearest colleges: ${near.map((n) => `${n.c.name} ${n.m} min`).join(' · ')}`,
    `Amenities: ${l.amenities.join(', ')}`,
    l.rules?.length ? `House rules: ${l.rules.join(' · ')}` : null,
  ].filter(Boolean);
  return {
    text: `**${l.name}** — ${l.description}`,
    bullets,
    listings: [l.id],
    chips: ['Tell me the total cost', 'Is it safe for girls?', 'What is the deposit?', `How far is it from ${near[0].c.name}?`],
    source: 'Verified listing record',
  };
}

// ─── individual answers ─────────────────────────────────────────────
function welcome(ctx) {
  const role = ctx.user?.role;
  return {
    text:
      role === 'owner'
        ? `Hi ${ctx.user.name.split(' ')[0]} 👋 I'm the StayScout Assistant. I can explain your rent/availability updates, maintenance queue and what students see on their side — grounded in your live records, no guessing.`
        : `Hi${ctx.user ? ` ${ctx.user.name.split(' ')[0]}` : ''} 👋 I'm the StayScout Assistant. Ask me about PGs, rent, deposits, travel time to your college, safety, complaints — I answer only from StayScout's verified listing data.`,
    bullets: [
      'Find a PG — “girls PG under ₹9,000 with WiFi near LD College”',
      'Compare — “compare Sunrise House and The Den”',
      'Understand — deposits, curfew, true cost, notice period',
      'Your account — complaints, rent history, switching plan',
    ],
    chips: role === 'student' && ctx.user ? ['Track my complaint', 'What is my rent history?', ...DEFAULT_CHIPS.slice(0, 2)] : DEFAULT_CHIPS,
    source: 'Things I can answer',
  };
}

function helpAnswer() {
  return {
    text: 'I map your question onto real StayScout records — listings, colleges, policies, reviews, roommates and the marketplace. I never invent a PG, a price or a policy.',
    bullets: [
      '**Search** — budget, gender, room type, amenities, veg mess, college proximity',
      '**Facts** — rent vs true monthly cost, deposit & refund, notice period, curfew, house rules',
      '**Commute** — travel time & cost from any PG to any of the 6 partner colleges',
      '**Compare / rank** — cheapest, best rated, best for studying',
      '**Guides** — how to visit, book, file a complaint, switch PGs, list your PG',
      '**Your account** — tickets and rent history when you are signed in',
    ],
    chips: ['Are you a real AI?', 'Which PG is best for studying?', 'Contact a human'],
    source: 'How this assistant works',
  };
}

function aiDisclosure() {
  return {
    text: 'No — I am a **rule-based assistant**, not a generative AI. I run on preset intents over StayScout\'s own data: listings, commute records, policies and the live API for your tickets. If I answered everything with a language model, I could hallucinate a rent or a deposit policy — that would break the honest-data rule this project is built on.',
    bullets: [
      'Matching uses the same parser as the site search (budget, gender, amenities, college)',
      'Numbers come from the listing record or the MongoDB API — never estimated silently',
      'When something is unknown I say so and hand you the WhatsApp/call line',
    ],
    chips: DEFAULT_CHIPS,
    source: 'Honest answer',
  };
}

function searchAnswer(t, ctx) {
  // A specific PG named in the question gets its own record answer, not a list
  const named = matchListings(t);
  if (named.some((l) => nameTokens(l.name).some((w) => t.includes(w)) || t.includes(l.name.toLowerCase()))) {
    return null;
  }
  const q = parseQuery(t);
  const constrained = q.max || q.gender || q.roomType || q.veg !== null || q.collegeId || q.amenities.length;
  if (!constrained) return null;

  let list = applyParsed(LISTINGS, q);
  const dropped = [];
  if (!list.length && q.amenities.length) {
    q.amenities = [];
    list = applyParsed(LISTINGS, q);
    dropped.push('amenities');
  }
  if (!list.length && q.roomType) {
    q.roomType = '';
    list = applyParsed(LISTINGS, q);
    dropped.push('room type');
  }
  if (!list.length && q.veg !== null) {
    q.veg = null;
    list = applyParsed(LISTINGS, q);
    dropped.push('veg-only mess');
  }
  if (q.collegeId) list = sortByCommute(list, q.collegeId, ctx.rush);
  else list = [...list].sort((a, b) => totalMonthly(a) - totalMonthly(b));

  const college = collegeById(q.collegeId);
  const shown = list.slice(0, 4);

  if (!shown.length) {
    const cheapest = [...LISTINGS].sort((a, b) => totalMonthly(a) - totalMonthly(b))[0];
    return {
      text: `I have **no verified PG** matching that combination${q.max ? ` within ${money(q.max)}` : ''}${q.gender ? ` for ${genderText(q.gender)}` : ''}. I won't invent one — here is the closest real option instead.`,
      bullets: [
        `Real floor in our data: **${cheapest.name}** at ${money(cheapest.rent)}/month (${money(totalMonthly(cheapest))} true cost), ${cheapest.area}`,
        'Widen the budget or drop one amenity and I can search again.',
      ],
      listings: [cheapest.id],
      chips: ['Raise budget to ₹15,000', 'Show all PGs', 'Cheapest PG in Ahmedabad'],
      source: 'No match in current dataset',
    };
  }

  const facts = [
    q.max ? `budget ≤ ${money(q.max)}` : null,
    q.gender ? `${genderText(q.gender)} PG` : null,
    q.roomType ? q.roomType : null,
    q.veg !== null ? (q.veg ? 'veg mess' : 'non-veg allowed') : null,
    q.amenities.length ? q.amenities.join(' + ') : null,
    college ? `near ${college.name}` : null,
  ].filter(Boolean);

  const top = shown[0];
  const bullets = [];
  if (college) {
    const b = bestCommute(top, college.id, ctx.rush);
    if (b) bullets.push(`Closest match: **${top.name}** — ${commuteLabel(b)} to ${college.name}`);
  }
  bullets.push(
    `Cheapest of the matches: **${[...shown].sort((a, b) => totalMonthly(a) - totalMonthly(b))[0].name}** at ${money(totalMonthly([...shown].sort((a, b) => totalMonthly(a) - totalMonthly(b))[0]))} true monthly cost`
  );
  if (ctx.rush) bullets.push('Rush-hour travel time is switched on.');
  if (dropped.length) bullets.push(`⚠ No PG met **${dropped.join(' + ')}** too, so I relaxed that. The list is honest about it — nothing was hidden.`);

  return {
    text: `I found **${list.length} verified PG${list.length === 1 ? '' : 's'}** matching ${facts.join(' · ')}. Tap a card for the full record.`,
    bullets,
    listings: shown.map((l) => l.id),
    actions: [{ label: 'Open full results', to: '/pgs' }],
    chips: ['Sort by cheapest', 'Which is best for studying?', 'Compare the top two', 'Show only verified stays'],
    source: 'Listing dataset search',
  };
}

function cheapestAnswer(t) {
  const q = parseQuery(t);
  const sorted = [...LISTINGS].sort((a, b) => totalMonthly(a) - totalMonthly(b));
  const top = sorted[0];
  const bullets = sorted.slice(0, 4).map((l) => {
    const extra = l.trueCost?.note ? ` — ${l.trueCost.note}` : '';
    return `**${l.name}** · rent ${money(l.rent)} → true cost ${money(totalMonthly(l))} · ${l.area} · study ${studyScore(l) ?? '—'}/10${extra}`;
  });
  return {
    text: `Cheapest verified stays in Ahmedabad${q.max ? ` within ${money(q.max)}` : ''} — ranked by **true monthly cost**, not the headline rent (that's the number that actually leaves your account).`,
    bullets,
    listings: sorted.slice(0, 3).map((l) => l.id),
    actions: [{ label: 'Compare side by side', to: '/compare' }],
    chips: ['Show the most expensive ones', 'Cheapest with meals included', 'Which is closest to LD College?'],
    source: 'True-cost ranking',
  };
}

function studyingAnswer(t = '', ctx = {}) {
  // "what is the WiFi speed at Sunrise House" → answer for that record, not a ranking
  const target = matchListings(t)[0] || (/\b(this|here|it)\b/.test(t) ? listingFromPath(ctx.pathname) : null);
  if (target && target.study) {
    const s = target.study;
    const speedNote = s.wifiSpeed >= 100 ? 'enough for HD lectures and calls' : s.wifiSpeed >= 40 ? 'fine for lectures and calls' : 'light browsing — heavy uploads may struggle';
    return {
      text: `Study setup at **${target.name}** — Study Score **${studyScore(target)}/10**.`,
      bullets: [
        `WiFi tested at **${s.wifiSpeed} Mbps** (${speedNote})`,
        s.quietHours ? 'Quiet hours are actually enforced' : 'No enforced quiet hours',
        s.studyRoom ? 'Dedicated study room for residents' : 'No dedicated study room',
        s.powerBackup ? 'Power backup — no blackout during submission week' : 'No power backup',
        s.desk ? 'Desk provided in the room' : 'No desk provided',
      ],
      listings: [target.id],
      chips: [`Is ${target.name} safe?`, 'Total monthly cost', 'Which PG has the fastest WiFi?'],
      source: 'Listing study record',
    };
  }
  const sorted = [...LISTINGS]
    .map((l) => ({ l, s: studyScore(l) }))
    .filter((x) => x.s !== null)
    .sort((a, b) => b.s - a.s);
  return {
    text: 'Ranked by **Study Score** — a weighted mix of tested WiFi speed (30%), enforced quiet hours (20%), a dedicated study room (20%), power backup (15%) and an in-room desk (15%).',
    bullets: sorted.slice(0, 4).map(({ l, s }) => {
      const notes = [
        `${l.study.wifiSpeed} Mbps tested WiFi`,
        l.study.quietHours ? 'quiet hours enforced' : 'no quiet-hour rule',
        l.study.studyRoom ? 'study room' : 'no study room',
        l.study.powerBackup ? 'power backup' : 'no power backup',
        l.study.desk ? 'desk in room' : 'no desk',
      ];
      return `**${l.name}** — ${s}/10 · ${notes.join(' · ')}`;
    }),
    listings: sorted.slice(0, 3).map((x) => x.l.id),
    chips: ['Which has the fastest WiFi?', 'Cheapest with a study room', 'Show quiet PGs'],
    source: 'Study Score inputs',
  };
}

function safetyAnswer(t) {
  const girls = /girl|women|female|parent|dad|mom|mother|father/.test(t);
  const safe = LISTINGS.filter((l) => l.safety?.cctv && l.safety?.guard);
  const list = girls ? safe.filter((l) => l.gender === 'girls' || l.safety?.womenOnlyFloor) : safe;
  const pool = list.length ? list : safe;
  return {
    text: girls
      ? 'Safety facts for students (and parents) — these come from the listing record, not from marketing copy:'
      : 'Safety data we hold on file for each stay:',
    bullets: pool.slice(0, 4).map((l) =>
      `**${l.name}** — curfew ${l.safety.curfew} · ${l.safety.cctv ? 'CCTV' : 'no CCTV'} · ${l.safety.guard ? 'guard' : 'no guard'}${l.safety.womenOnlyFloor ? ' · women-only floor' : ''} · hospital ${l.safety.hospital}`
    ),
    listings: pool.slice(0, 3).map((l) => l.id),
    chips: ['Girls PG under ₹9,000', 'Show PGs with no curfew', 'Which is closest to the hospital?'],
    source: 'Listing safety records',
    extra: 'Every listing is physically visited, owner-KYC checked and photo-matched before it goes live — look for the three trust badges on a card.',
  };
}

function policyAnswer(t, ctx) {
  const target = listingFromContext(t, ctx);
  const dep = target?.policy;

  // "PGs with no curfew" → filter the real records instead of listing every policy
  if (/curfew/.test(t)) {
    const free = LISTINGS.filter((l) => /^none/i.test(l.safety?.curfew || ''));
    const wantsFree = /no curfew|without curfew|curfew ?free|no lock|late night|come back late|no timings/.test(t);
    if (wantsFree) {
      return {
        text: free.length
          ? `${free.length} ${free.length === 1 ? 'PG in our records has' : 'PGs in our records have'} **no fixed curfew** — entry is on keycard/CCTV instead of a 10–11 PM lock-in:`
          : 'No PG in the current dataset advertises a curfew-free entry — I would rather say that than suggest one exists.',
        bullets: free.map((l) => `**${l.name}** — curfew: ${l.safety.curfew} · ${l.safety.cctv ? 'CCTV' : 'no CCTV'} · ${l.safety.guard ? 'guard' : 'no guard'} · ${money(l.rent)}/month`),
        listings: free.slice(0, 3).map((l) => l.id),
        actions: [{ label: 'Filter PGs with no curfew', to: '/pgs?curfew=none' }],
        chips: ['Show PGs with a curfew', 'Which is safest for girls?', 'Total cost of the cheapest one'],
        source: 'Listing safety records',
        extra: 'Parents usually want the opposite filter — every listing also shows its curfew, guard and CCTV so the trade-off is visible.',
      };
    }
    const timed = LISTINGS.filter((l) => !/^none/i.test(l.safety?.curfew || ''));
    return {
      text: 'Curfew timings in our records — this is the field parents check first, so it is never hidden:',
      bullets: [
        ...timed.map((l) => `**${l.name}** — ${l.safety.curfew}${l.safety.womenOnlyFloor ? ' · women-only floor' : ''}`),
        ...free.map((l) => `**${l.name}** — no fixed curfew`),
      ],
      listings: timed.slice(0, 3).map((l) => l.id),
      actions: [{ label: 'Filter PGs with no curfew', to: '/pgs?curfew=none' }],
      chips: ['PGs with no curfew', 'Which is safest for girls?', 'What are the house rules?'],
      source: 'Listing safety records',
    };
  }
  if (target && dep) {
    return {
      text: `Money and rules for **${target.name}** (from the owner's own listing):`,
      bullets: [
        `Deposit: ${dep.depositMonths} month${dep.depositMonths > 1 ? 's' : ''} = ${money(target.rent * dep.depositMonths)} — refundable in ${dep.refundDays} days`,
        `Notice period to leave: ${dep.noticePeriod}`,
        `Visitors: ${dep.visitors} · overnight guests: ${dep.guestNights}`,
        `Curfew: ${target.safety?.curfew || '—'} · house rules: ${(target.rules || []).join(' · ')}`,
      ],
      listings: [target.id],
      chips: ['Compare deposit with other PGs', 'Total cost per month', 'How do I get my deposit back?'],
      source: 'Listing policy record',
    };
  }
  return {
    text: 'Deposit and exit rules differ per PG, so here is the range across our verified stays — open a listing for its exact terms:',
    bullets: LISTINGS.map((l) => `**${l.name}** — ${depositPolicy(l)}, notice ${l.policy.noticePeriod}, guests: ${l.policy.guestNights}`),
    chips: ['What is the deposit at Sunrise House?', 'How do I get my deposit back?', 'Cheapest deposit'],
    source: 'All policy records',
    extra: 'Refund tip: photograph the room on move-in day and follow the notice period exactly — that is what owners cite when deducting.',
  };
}

function trueCostAnswer(t, ctx) {
  const target = listingFromContext(t, ctx);
  if (target) {
    const tc = target.trueCost || {};
    return {
      text: `**${target.name}** — rent ${money(target.rent)}/month, but the honest number is **${money(totalMonthly(target))}/month**.`,
      bullets: [
        `Electricity ${money(tc.electricity || 0)} · food ${money(tc.food || 0)} · maintenance ${money(tc.maintenance || 0)}`,
        tc.note ? `Owner's note: ${tc.note}` : 'No owner note on this listing.',
        `One-time deposit ${money(target.rent * (target.policy?.depositMonths || 0))}`,
        'Budget Planner on the listing page plots this against your monthly income.',
      ],
      listings: [target.id],
      actions: [{ label: 'Open Budget Planner', to: `/pgs/${target.id}?tab=price` }],
      chips: ['Which PG has the lowest true cost?', 'What is the deposit?', 'Compare two PGs'],
      source: 'True-cost breakdown',
    };
  }
  return cheapestAnswer('cheapest');
}

function priciestAnswer() {
  const sorted = [...LISTINGS].sort((a, b) => totalMonthly(b) - totalMonthly(a));
  return {
    text: 'The other end of the market — most expensive verified stays by **true monthly cost**, and what the money actually buys:',
    bullets: sorted.slice(0, 4).map((l) => {
      const perks = [l.amenities.includes('Gym') ? 'gym' : null, l.amenities.includes('Housekeeping') ? 'housekeeping' : null, l.study?.studyRoom ? 'study lounge' : null].filter(Boolean);
      return `**${l.name}** — true cost ${money(totalMonthly(l))} (rent ${money(l.rent)}) · ${l.area} · Study Score ${studyScore(l) ?? '—'}/10${perks.length ? ` · ${perks.join(' · ')}` : ''}`;
    }),
    listings: sorted.slice(0, 3).map((l) => l.id),
    chips: ['Cheapest PG in Ahmedabad', 'Compare the cheapest and the costliest', 'Which is best for studying?'],
    source: 'True-cost ranking',
  };
}

function deductionsAnswer() {
  return {
    text: 'Careful here — StayScout does **not** keep a “standard deductions” table, because owners do not publish one and inventing a number would be dishonest. What the records actually say:',
    bullets: [
      'Your own switching plan stores deductions in rupees, so the estimated refund is always `deposit − deductions` (visible on your dashboard).',
      'The usual trigger is the notice period: 1 month at Sunrise House, Metro Nest and Green Nest; 15 days at The Den. Leaving early is what costs money.',
      'Refund windows on file: 7 days (The Den), 15 days (Sunrise House, Green Nest), 30 days (Metro Nest).',
      'Protection: photograph the room and note the electricity meter reading on move-in day, and keep the deposit receipt. That is what settles disputes.',
    ],
    actions: [{ label: 'Open Switching Assistant', to: '/dashboard' }],
    chips: ['How do I get my deposit back?', 'Compare deposits', 'Talk to a human'],
    source: 'Policy records + switching flow',
  };
}

function setupAnswer() {
  return {
    text: 'Running it locally takes two terminals — and the frontend still works with neither, in localStorage mode.',
    bullets: [
      'Database: `mongod --dbpath ~/mongodb/data --port 27017` (MongoDB 9.1 lives in `~/mongodb`, no sudo needed).',
      'API: `cd server && npm start` → Express on **port 5001** (5000 is taken by macOS AirPlay).',
      'Frontend: `npm run dev` → Vite on 5173. Production build: `npm run build` → single-file `dist/index.html`.',
      'With the server up, rent history, complaints, availability and switching plans read real MongoDB records; without it they fall back to local mode. The full guide is in README-stayscout.md.',
    ],
    chips: ['How do I log in as admin?', 'What is the availability predictor?', 'What is the price tracker?'],
    source: 'Run guide',
  };
}

function compareAnswer(t, ctx) {
  const found = matchListings(t);
  let pair = found.slice(0, 2);
  if (pair.length < 2) {
    const college = matchColleges(t)[0];
    const sorted = college ? sortByCommute(LISTINGS, college.id, ctx.rush) : LISTINGS;
    pair = [found[0] || sorted[0], sorted.find((l) => l.id !== (found[0] || sorted[0]).id)];
  }
  const [a, b] = pair;
  const college = matchColleges(t)[0] || nearestColleges(a, 1)[0].c;
  const ba = bestCommute(a, college.id);
  const bb = bestCommute(b, college.id);
  const sa = studyScore(a);
  const sb = studyScore(b);
  const ca = totalMonthly(a);
  const cb = totalMonthly(b);
  const cheaper = ca <= cb ? a : b;
  const gap = Math.abs(ca - cb);

  return {
    text: `**${a.name}** vs **${b.name}** — both are real records; here is the side-by-side.`,
    bullets: [
      `Rent: ${money(a.rent)} vs ${money(b.rent)} · true monthly cost ${money(ca)} vs ${money(cb)}`,
      `**${cheaper.name} is cheaper by ${money(gap)}/month.**`,
      `Distance to ${college.name}: ${commuteLabel(ba) || '—'} vs ${commuteLabel(bb) || '—'}`,
      `Rating ${a.rating} (${a.reviews} reviews) vs ${b.rating} (${b.reviews} reviews) · Study Score ${sa ?? '—'} vs ${sb ?? '—'}`,
      `Beds free now: ${a.bedsAvailable} vs ${b.bedsAvailable}`,
      `Room type: ${a.roomType} (${genderText(a.gender)}) vs ${b.roomType} (${genderText(b.gender)})`,
      `Deposit: ${depositPolicy(a)} vs ${depositPolicy(b)}`,
    ],
    listings: [a.id, b.id],
    actions: [{ label: 'Open the comparison tool', to: '/compare' }],
    chips: [`Tell me more about ${a.name}`, 'Which is safer?', 'Which is better for studying?'],
    source: 'Two listing records compared',
  };
}

function commuteAnswer(t, ctx) {
  const target = listingFromContext(t, ctx) || LISTINGS[0];
  const colleges = matchColleges(t);
  if (colleges.length) {
    const c = colleges[0];
    const ranked = sortByCommute(LISTINGS, c.id, ctx.rush).filter((l) => l.id !== target.id).slice(0, 4);
    const b = bestCommute(target, c.id, ctx.rush);
    return {
      text: `**${c.name}** sits in ${c.area}. Travel times here for **${target.name}** and the closest stays:`,
      bullets: [
        b ? `**${target.name} → ${c.name}: ${commuteLabel(b)}**` : `${target.name} has no commute record to ${c.name}.`,
        ...ranked.map((l) => `${l.name} — ${commuteLabel(bestCommute(l, c.id, ctx.rush))} · ${money(l.rent)}/month`),
      ],
      listings: ranked.map((l) => l.id),
      actions: [{ label: `Search near ${c.name}`, to: `/pgs?college=${c.id}` }],
      chips: ['Show rush-hour times', 'Cheapest PG near this college', 'Which college is closest to The Den?'],
      source: 'Commute matrix',
    };
  }
  const near = nearestColleges(target, 3);
  return {
    text: `Travel times for **${target.name}** in ${target.area}:`,
    bullets: near.map((n) => `${n.c.name} (${n.c.area}) — ${commuteLabel(bestCommute(target, n.c.id, ctx.rush))}`),
    listings: [target.id],
    chips: ['Switch to rush hour', 'Which PG is closest to LD College?', 'Show me commute costs'],
    source: 'Commute matrix',
  };
}

function collegesAnswer(t) {
  const withCommute = COLLEGES.map((c) => ({
    c,
    best: [...LISTINGS].sort((a, b) => (a.commute?.[c.id]?.[0] ?? 999) - (b.commute?.[c.id]?.[0] ?? 999))[0],
  }));
  const rush = /\brush|peak|traffic/.test(t);
  return {
    text: `We map every listing to **${COLLEGES.length} partner colleges**${rush ? ' — showing rush-hour (9–11 AM) times' : ''}:`,
    bullets: withCommute.map(({ c, best }) => `**${c.name}** (${c.area}) — nearest PG **${best.name}**, ${commuteLabel(bestCommute(best, c.id, rush))}`),
    actions: COLLEGES.slice(0, 3).map((c) => ({ label: `PGs near ${c.name}`, to: `/pgs?college=${c.id}` })),
    chips: ['Show rush-hour times', 'Find a PG near Nirma University', 'Which college is best connected?'],
    source: 'College + commute records',
  };
}

function durationAnswer(t, ctx) {
  const target = listingFromContext(t, ctx) || LISTINGS[0];
  const bullets = DURATIONS.map((d) => {
    const p = priceForStay(target, d);
    return `**${d.label}** — ${money(p.monthly)}/month, total ${money(p.total)} (${d.note})`;
  });
  return {
    text: `Short and long stays at **${target.name}** — longer commitments are cheaper per month, short stays carry an exam-period premium:`,
    bullets: [
      ...bullets,
      `Deposit stays the same: ${depositPolicy(target)}`,
      'Exam-period 1-month stays usually need the owner to confirm in writing — ask on WhatsApp before paying.',
    ],
    listings: [target.id],
    chips: ['Which PG is cheapest for one semester?', 'Is the deposit refundable?'],
    source: 'Duration pricing model',
  };
}

async function complaintAnswer(t, ctx) {
  const target = listingFromContext(t, ctx);
  if (ctx.token) {
    try {
      const rows = await api.complaints.mine(ctx.token);
      if (Array.isArray(rows) && rows.length) {
        return {
          text: `Tickets on your account — pulled live from the database, ${rows.length} total:`,
          bullets: rows.slice(0, 6).map((r) => {
            const ribbon = r.status === 'Resolved' ? '🟢' : r.status === 'In Progress' ? '🟡' : '🔵';
            const last = r.timeline?.[r.timeline.length - 1];
            return `${ribbon} **${r.title}** — ${r.status}${last?.at ? ` (last update ${new Date(last.at).toLocaleDateString('en-IN')})` : ''} · ${nameOfListing(r.propertyId)}`;
          }),
          actions: [{ label: 'Open my dashboard', to: '/dashboard' }],
          chips: ['File a new complaint', 'How long does a fix take?', 'What if the owner ignores it?'],
          source: 'Live complaints API',
        };
      }
      if (Array.isArray(rows)) {
        return {
          text: 'You have **no complaint tickets on record** — nothing is fabricated, so an empty list means none was filed under your account.',
          bullets: ['Tickets are private: queries are scoped to your JWT user id, never to a client-supplied id.'],
          actions: [
            target ? { label: `File one for ${target.name}`, to: `/pgs/${target.id}?tab=maintenance` } : { label: 'Open my dashboard', to: '/dashboard' },
          ],
          chips: ['How do I file a complaint?', 'Who sees my complaint?'],
          source: 'Live complaints API',
        };
      }
    } catch {
      // server offline → fall through to the guided explanation
    }
  }
  return {
    text: 'Complaints run through the Maintenance Tracker: **Reported → In Progress → Resolved**, with every step timestamped and the student notified on each change.',
    bullets: [
      'Open any PG → **Maintenance** tab (signed-in residents only) → pick from 8 categories (WiFi, water, electrical, cleaning, food, security, furniture, other), set priority and room number.',
      'Attach a photo so the owner cannot dispute the issue.',
      target ? `Your current page: ${target.name} → open the Maintenance tab to file directly.` : 'Sign in as a student to file and track tickets.',
      'Owner sees it in the Maintenance queue and moves it forward; you get a bell notification each time.',
      ctx.token ? '' : 'Demo student login: stu@t.com / test123',
    ].filter(Boolean),
    actions: [
      ...(target ? [{ label: `File for ${target.name}`, to: `/pgs/${target.id}?tab=maintenance` }] : []),
      ctx.token ? { label: 'Open my dashboard', to: '/dashboard' } : { label: 'Sign in', to: '/auth' },
    ],
    chips: ['Track my complaint', 'What if the owner ignores it?', 'Talk to a human'],
    source: ctx.token ? 'Guided flow (server unreachable)' : 'Guided flow',
  };
}

async function priceHistoryAnswer(t, ctx) {
  const target = listingFromContext(t, ctx) || matchListings(t)[0] || null;
  if (target) {
    try {
      const rows = await api.price.history(target.id);
      if (Array.isArray(rows) && rows.length) {
        return {
          text: `Rent history for **${target.name}** — read straight from the priceHistory collection:`,
          bullets: rows.slice(-6).map((r) => `${money(r.oldPrice)} → ${money(r.newPrice)} effective ${r.effectiveDate} · recorded by ${r.changedBy || 'owner'}`),
          listings: [target.id],
          actions: [{ label: 'See the chart', to: `/pgs/${target.id}?tab=price` }],
          chips: ['How much has it gone up in total?', 'Compare with other PGs'],
          source: 'Live priceHistory API',
        };
      }
      if (Array.isArray(rows)) {
        return {
          text: `**No rent change has ever been recorded for ${target.name}.** The tracker writes a record only when an owner or admin logs one, so an empty history is a genuine "never changed" — not missing data.`,
          listings: [target.id],
          actions: [{ label: 'Open Price & planning tab', to: `/pgs/${target.id}?tab=price` }],
          chips: ['Which PGs have changed rent?', 'Is my rent fair?'],
          source: 'Live priceHistory API',
        };
      }
    } catch {
      // offline
    }
    return {
      text: `The rent history for **${target.name}** lives on its Price & planning tab. Start the API server (port 5001) and it reads the real priceHistory records; the frontend alone never fabricates a history.`,
      listings: [target.id],
      actions: [{ label: 'Open Price & planning tab', to: `/pgs/${target.id}?tab=price` }],
      chips: ['How do I start the server?', 'Who can change the rent?'],
      source: 'Guided flow',
    };
  }
  return {
    text: 'Every rent change is stored as an immutable record — `propertyId, oldPrice, newPrice, effectiveDate, changedBy` — and the listing\'s current rent is synced to the newest record. Name a PG and I will pull its history.',
    bullets: LISTINGS.slice(0, 3).map((l) => `e.g. “rent history for ${l.name}”`),
    chips: ['Rent history for Sunrise House', 'Who can change the rent?'],
    source: 'Data model',
  };
}

function availabilityAnswer(t, ctx) {
  const target = listingFromContext(t, ctx) || matchListings(t)[0] || null;

  // "how accurate is the predictor?" wants the method, not the bed counts
  if (/accurat|reliab|predict|forecast|estimate|trust the/.test(t)) {
    return {
      text: 'The availability predictor is deliberately boring, because a confident wrong answer is worse than an honest vague one:',
      bullets: [
        'Fewer than **3** availability records → it prints *“Not enough historical data to estimate future availability”* and stops.',
        'With 3+ records it fits a simple day-slope trend over the last records and shows a 🟢 / ⚠ / 🔴 badge plus **“Based on N recent availability records”**.',
        'Every number on the chart came from an owner clicking “Update availability” — nothing is back-filled or simulated.',
        'It always carries the caveat that the owner\'s live bed count wins, and availability can change any day.',
      ],
      actions: [{ label: 'See it on a listing', to: target ? `/pgs/${target.id}` : '/pgs' }],
      chips: ['How many beds are free right now?', 'How do I update availability as an owner?'],
      source: 'Predictor method',
    };
  }
  if (target) {
    return {
      text: `**${target.name}** currently shows **${target.bedsAvailable} bed${target.bedsAvailable === 1 ? '' : 's'} left** (${target.roomType}, ${genderText(target.gender)}).`,
      bullets: [
        'The owner\'s live count is the truth — the listing page shows when availability was last updated.',
        'Move-In Availability Predictor: with fewer than 3 history records it deliberately says *“Not enough historical data to estimate future availability”* instead of guessing; with 3+ records it shows a trend badge and the number of records used.',
      ],
      listings: [target.id],
      actions: [{ label: 'Check availability on the listing', to: `/pgs/${target.id}` }],
      chips: ['Which PGs have 3+ beds free?', 'How do I book a bed?', 'Talk to the owner'],
      source: 'Listing + predictor rules',
    };
  }
  const withBeds = [...LISTINGS].filter((l) => l.bedsAvailable > 0).sort((a, b) => b.bedsAvailable - a.bedsAvailable);
  return {
    text: 'Live bed counts from the dataset — the owner\'s update always overrides this:',
    bullets: withBeds.map((l) => `**${l.name}** — ${l.bedsAvailable} bed${l.bedsAvailable === 1 ? '' : 's'} · ${l.roomType} · ${money(l.rent)}/month`),
    listings: withBeds.slice(0, 3).map((l) => l.id),
    chips: ['How accurate is the availability predictor?', 'Cheapest PG with a bed free'],
    source: 'Listing bed counts',
  };
}

function bookingAnswer(t, ctx) {
  const target = listingFromContext(t, ctx) || matchListings(t)[0] || null;
  return {
    text: 'Booking on StayScout is **free and brokers play no role**: you pick a visit slot on the listing, the owner confirms on WhatsApp, and you pay the owner directly at the PG.',
    bullets: [
      'Slots offered: 10:00 AM, 11:30 AM, 4:00 PM, 5:30 PM',
      target ? `You can book a slot for ${target.name} right on its page.` : 'Open any listing and use “Book a visit”.',
      'StayScout never collects rent or deposits in-app — no payment gateway, no brokerage fee.',
      'After a visit, the After-Booking checklist covers agreement, deposit receipt, move-in photos and a maintenance ticket if something is broken.',
    ],
    actions: target ? [{ label: `Book a visit — ${target.name}`, to: `/pgs/${target.id}` }] : [{ label: 'Browse PGs', to: '/pgs' }],
    chips: ['What should I check during a visit?', 'Is there a brokerage fee?', 'WhatsApp the owner'],
    source: 'Booking flow',
  };
}

function depositBackAnswer(t) {
  return {
    text: 'Getting the deposit back is a process, not a favour. Here is how the switching assistant handles it:',
    bullets: [
      'Check your notice period (1 month at Sunrise House, 15 days at The Den) and serve it in writing — WhatsApp counts if the owner acknowledges.',
      'Settle the refund amount before you vacate: deposit minus any recorded deductions.',
      'Upload move-out evidence — photos, the receipt, the meter reading.',
      'Then track the refund date in the PG Switching Assistant on your dashboard (8 steps, live % progress).',
      'Typical refund windows in our records: 15 days (Sunrise House) and 30 days (The Den).',
    ],
    actions: [{ label: 'Open Switching Assistant', to: '/dashboard' }],
    chips: ['What deductions are normal?', 'Compare deposits', 'Talk to a human'],
    source: 'Switching flow + policy records',
  };
}

async function switchingAnswer(t, ctx) {
  if (ctx.token) {
    try {
      const plans = await api.switching.mine(ctx.token);
      if (Array.isArray(plans) && plans.length) {
        const p = plans[0];
        const done = p.steps?.filter((s) => s.done).length || 0;
        return {
          text: `Your latest switching plan is **${Math.round((done / (p.steps?.length || 8)) * 100)}% complete** — pulled live from the database.`,
          bullets: [
            `Leaving ${nameOfListing(p.currentPGId)} · rent ${money(p.currentRent)} · deposit ${money(p.deposit)}`,
            `Notice ${p.noticePeriodDays} days · earliest move-out ${p.earliestMoveOut}`,
            `Estimated refund ${money(p.estimatedRefund)}${p.deductions ? ` after ${money(p.deductions)} deductions` : ''}`,
            done === p.steps.length ? 'All 8 steps are complete ✅' : `Next step: **${p.steps.find((s) => !s.done)?.label}**`,
          ],
          actions: [{ label: 'Continue the plan', to: '/dashboard' }],
          chips: ['What deductions are normal?', 'How do I get my deposit back?'],
          source: 'Live switchingPlans API',
        };
      }
      if (Array.isArray(plans)) {
        return {
          text: 'You have no saved switching plan yet — the assistant only reports what is in the database, so I will not show a progress bar you never created.',
          actions: [{ label: 'Create a switching plan', to: '/dashboard' }],
          chips: ['How do I get my deposit back?', 'What is a notice period?'],
          source: 'Live switchingPlans API',
        };
      }
    } catch {
      // offline
    }
  }
  return depositBackAnswer();
}

function roommateAnswer(t, ctx) {
  const q = parseQuery(t);
  const matches = ROOMMATES.filter((r) => {
    if (q.max && r.budget > q.max) return false;
    if (q.veg !== null && q.veg && !r.veg) return false;
    return true;
  });
  const pick = (matches.length ? matches : ROOMMATES).slice(0, 3);
  return {
    text: 'Here is the roommate side of StayScout — take the 6-question quiz and you get matched on sleep schedule, cleanliness, veg habit, study hours, smoking and budget.',
    bullets: pick.map((r) => `**${r.name}** (${r.age}, ${r.course} at ${r.college}) — budget ${money(r.budget)} · ${r.veg ? 'veg' : 'non-veg ok'} · ${r.sleep} sleeper · cleanliness ${r.cleanliness}/5 · ${r.bio}`),
    actions: [{ label: 'Open roommate matching', to: '/roommates' }],
    chips: ['Find a roommate under ₹8,000', 'Vacant bed board', 'What is the vacant bed board?'],
    source: 'Roommate profiles',
  };
}

function bedBoardAnswer() {
  return {
    text: 'The **vacant-bed board** is where someone with a bed free splits the room and the rent — the other half of “find a roommate”.',
    bullets: [
      'Posts show the PG, the split rent, the poster\'s college and trust level.',
      'You send a request from the board; the poster responds directly. No brokerage.',
      'Example: The Den single room split at ₹7,750 — posted by Dev, Nirma.',
    ],
    actions: [{ label: 'See vacant beds', to: '/roommates' }],
    chips: ['Find a roommate', 'WhatsApp the owner'],
    source: 'Bed board seed data',
  };
}

function marketplaceAnswer(t) {
  const words = t.split(/\s+/).filter((w) => w.length > 2);
  const hits = MARKET_ITEMS.filter((m) => words.some((w) => m.title.toLowerCase().includes(w)));
  const items = hits.length ? hits : MARKET_ITEMS;
  return {
    text: hits.length
      ? `Found ${hits.length} matching item${hits.length === 1 ? '' : 's'} on the Move-Out Marketplace:`
      : 'The **Move-Out Marketplace** is where passing-out students sell furniture, coolers and books instead of dumping them:',
    bullets: items.map((m) => `**${m.title}** — ${money(m.price)} · ${m.cond} · seller ${m.seller}`),
    actions: [{ label: 'Open the marketplace', to: '/marketplace' }],
    chips: ['Any study tables?', 'Where do I sell my stuff when I leave?'],
    source: 'Marketplace listings',
  };
}

function ownerAnswer(t, ctx) {
  const owner = ctx.user?.role === 'owner';
  return {
    text: owner
      ? `Welcome back, ${ctx.user.name.split(' ')[0]}. Your Owner Dashboard is the control room — I can explain every panel.`
      : 'Rent, availability and the maintenance queue are all owner-controlled. Listing is free: submit it, a StayScout person physically visits, photographs the bathroom and kitchen unedited, and runs a KYC check — only then does it go live as **verified**.',
    bullets: [
      '**Update rent** — writes a priceHistory record (propertyId, oldPrice, newPrice, effectiveDate, changedBy) and syncs the listing rent; students see the honest chart.',
      '**Update availability** — archives a record so the availability predictor has real data.',
      '**Maintenance queue** — filters by status/category/priority; every transition notifies the student.',
      '**Analytics** — views, enquiries, conversions; plus admin overview across price changes, complaints and switching reports.',
      owner ? 'Demo-owner reminder: you see only your own properties — the API scopes queries to your JWT.' : 'Demo owner login: own@t.com / test123',
    ],
    actions: owner ? [{ label: 'Open Owner Dashboard', to: '/owner' }] : [{ label: 'List your PG', to: '/list' }, { label: 'Sign in as owner', to: '/auth' }],
    chips: ['How do students find my PG?', 'What is the verified badge?', 'Talk to a human'],
    source: 'Owner workflow + API rules',
  };
}

function loginAnswer() {
  return {
    text: 'Three roles, all with the same demo password. Use the **Sign in** button in the navbar, or open the auth page directly.',
    bullets: [
      '**Student** — stu@t.com / test123 → dashboard, complaints, switching plan',
      '**Owner** — own@t.com / test123 → rent/availability updates, maintenance queue',
      '**Admin** — adm@t.com / test123 → platform-wide overview (403 for everyone else)',
      'The frontend also works with **no server running** (localStorage mode) — the demo accounts need the API on port 5001.',
    ],
    actions: [{ label: 'Sign in', to: '/auth' }, { label: 'Create an account', to: '/auth?mode=register' }],
    chips: ['What can an owner do?', 'Is my data private?'],
    source: 'Demo accounts',
  };
}

function privacyAnswer() {
  return {
    text: 'Yes — privacy is enforced server-side, not by hiding buttons.',
    bullets: [
      'Passwords are hashed, sessions use JWTs with a role claim; owner/admin endpoints reject students with **403** (verified).',
      'Your complaints and switching plans are queried by your JWT user id — never by an id the client sends.',
      'Notifications are per-user. Admin overview is the only cross-user view and it is role-gated.',
      'This chat stores its transcript only in your own browser localStorage; nothing is sent to any third party.',
    ],
    chips: ['Show me the API endpoints', 'Talk to a human'],
    source: 'Security model',
  };
}

function contactAnswer(t, ctx) {
  const listing = listeningIfAny(t, ctx);
  const text = listing
    ? `Want a human for **${listing.name}**? The owner replies fastest on WhatsApp.`
    : 'Happy to hand you over to a human — StayScout support is a real desk, not a bot loop.';
  return {
    text,
    bullets: [
      `WhatsApp: ${BRAND.phone}`,
      `Phone: ${BRAND.phone}`,
      `Email: ${BRAND.email}`,
      `Office: ${BRAND.address} (Mon–Sat, 10 AM–7 PM)`,
      listing ? 'On a listing page the “WhatsApp owner” button pre-fills your interest message.' : 'Tell me a PG name and I will open its owner contact.',
    ],
    actions: [
      { label: 'WhatsApp us', href: `https://wa.me/919810012345?text=${encodeURIComponent('Hi StayScout, I need help with: ' + (ctx.lastQuestion || 'a PG enquiry'))}` },
      ...(listing ? [{ label: `Open ${listing.name}`, to: `/pgs/${listing.id}` }] : []),
    ],
    chips: ['Track my complaint', 'How do I book a visit?'],
    source: 'Contact details',
  };
}

function listeningIfAny(t, ctx) {
  return listingFromContext(t, ctx) || matchListings(t)[0] || null;
}

function reviewsAnswer(t, ctx) {
  const target = listingFromContext(t, ctx) || matchListings(t)[0] || null;
  const pool = target ? REVIEWS.filter((r) => r.listingId === target.id) : REVIEWS;
  const tips = pool.filter((r) => r.tip);
  return {
    text: target
      ? `Verified-student reviews for **${target.name}** (college-email verified, not anonymous):`
      : 'Every review here comes from a college-email-verified resident — and seniors leave a tip, which is the most useful part:',
    bullets: pool.slice(0, 4).map((r) => `${'★'.repeat(r.rating)} **${r.name}** (${collegeById(r.college)?.name || r.college}) — ${r.text}`),
    listings: target ? [target.id] : [],
    chips: tips.length && target ? [`Senior tip for ${target.name}`, 'Show the lowest-rated PG'] : ['Show the lowest-rated PG', 'Which PG has the best mess?'],
    source: 'Verified reviews',
    extra: tips.length ? `Senior tip: ${tips[0].tip}` : null,
  };
}

function pgFinderGeneral(t) {
  return {
    text: 'StayScout is a verified-PG platform for Ahmedabad. Ask me anything about stays, money, travel time or your account — I only answer from data the site actually holds.',
    bullets: [
      `**${LISTINGS.length} verified PGs** across ${COLLEGES.length} partner colleges`,
      'Search in plain English, compare up to 3 side by side, true monthly cost on every card',
      'Price-history tracker, availability predictor, maintenance tracker, switching assistant, budget planner',
      'Roommate matching, vacant-bed board, move-out marketplace, owner and admin dashboards',
    ],
    chips: DEFAULT_CHIPS,
    actions: [{ label: 'Browse all PGs', to: '/pgs' }],
    source: 'Site overview',
  };
}

function fallback(t, ctx) {
  return {
    text: `I couldn't map **“${t.trim().slice(0, 120)}”** to anything in StayScout's records — and I would rather say that than invent an answer.`,
    bullets: [
      'Try a PG name (Sunrise House, The Den, Metro Nest…), a budget, a college, an amenity or a policy question.',
      'If it is about your own booking, ticket or refund, WhatsApp support and a human picks it up.',
    ],
    actions: [
      { label: 'WhatsApp support', href: `https://wa.me/919810012345?text=${encodeURIComponent('Hi StayScout, my question: ' + t.trim())}` },
    ],
    chips: DEFAULT_CHIPS,
    unmatched: true,
    source: 'No match found',
  };
}

// ─── dispatcher ─────────────────────────────────────────────────────
const RULES = [
  { re: /^(hi|hey|hello|yo|namaste|good (morning|afternoon|evening)|hola)\b/, run: (t, ctx) => welcome(ctx) },
  { re: /\b(thanks|thank you|thx|great|awesome|perfect|dhanyavaad|shukriya)\b/, run: () => ({ text: 'Anytime 🙌 Anything else — or shall I hand you to a human?', chips: ['Contact a human', 'Cheapest PG in Ahmedabad'], source: 'You\'re welcome' }) },
  { re: /\b(are you (a )?(real )?(ai|bot|robot|human|chatgpt)|is this an? (ai|bot)|who are you|who made you)\b/, run: () => aiDisclosure() },
  { re: /\b(help|what can you (do|answer)|how (do|does) (you|this|it) work|what should i ask|options|menu|guide me)\b/, run: () => helpAnswer() },
  { re: /\b(you there|test|anyone|hello\?)\b/, run: (t, ctx) => welcome(ctx) },
  { re: /\b(complaints?|complain|tickets?|maintenance|broken|leak|not working|slow wifi|wifi (is )?slow|repair|fault)\b/, run: (t, ctx) => complaintAnswer(t, ctx) },
  { re: /\b(price history|rent history|rent (increase|hike|hiked|raised|go up)|price (change|increase)|how much did the rent|rent tracker)\b/, run: (t, ctx) => priceHistoryAnswer(t, ctx) },
  { re: /\b(switch(ing)? (pg|plan|stays?)|notice period|move ?out|shift (to another|pg)|deposit back|get my deposit|refunds?)\b/, run: (t, ctx) => switchingAnswer(t, ctx) },
  { re: /\b(deposits?|advance|security money)\b.*\b(back|refund|return)\b/, run: () => depositBackAnswer() },
  { re: /\b(deductions?|deducted|cut from (my|the) deposit|deposit (is )?(cut|short))\b/, run: () => deductionsAnswer() },
  { re: /\b(deposits?|refund|notice period|visitors?|guests?|curfew|house rules|polic(y|ies)|agreement)\b/, run: (t, ctx) => policyAnswer(t, ctx) },
  { re: /\b(true cost|hidden (charge|cost|fee)|extra charge|electricity|electric bill|total (monthly )?cost|monthly bill|actual(ly)? pay|all[- ]inclusive|maintenance charge)\b/, run: (t, ctx) => trueCostAnswer(t, ctx) },
  { re: /\b(safe|safety|cctv|guard|parents?|mom|dad|women only|girls only|security)\b/, run: (t, ctx) => safetyAnswer(t) },
  { re: /\b(marketplace|market|buy|sell(ing)?|furniture|cooler|study table|bicycle|books|second hand|2nd hand)\b/, run: (t) => marketplaceAnswer(t) },
  { re: /\b(study|studying|exam|wi ?fi|wifi|internet|quiet|peaceful|desk|study room)\b/, run: (t, ctx) => searchAnswer(t, ctx) || studyingAnswer(t, ctx) },
  { re: /\b(compare|vs|versus|difference between|better than|side by side)\b/, run: (t, ctx) => compareAnswer(t, ctx) },
  { re: /\b(cheap(est|er)?|lowest rent|most affordable|budget friendly|least expensive)\b/, run: (t, ctx) => searchAnswer(t, ctx) || cheapestAnswer(t) },
  { re: /\b(expensive|costliest|priciest|highest rent|premium|top ?end|most you can pay|max budget)\b/, run: () => priciestAnswer() },
  { re: /\b(how far|distance|commute|travelling time|travel time|minutes (to|from)|near my college|nearest college)\b/, run: (t, ctx) => commuteAnswer(t, ctx) },
  { re: /\b(colleges?|universit(y|ies))\b/, run: (t) => collegesAnswer(t) },
  { re: /\b(semester|1 month|one month|short stay|6 month|12 month|academic year|duration|how long can i stay)\b/, run: (t, ctx) => durationAnswer(t, ctx) },
  { re: /\b(available|availability|vacan(t|cy)|beds? (left|free|available)|full|occupied)\b/, run: (t, ctx) => availabilityAnswer(t, ctx) },
  { re: /\b(book|booking|visits?|tour|slots?|appointment|schedule a|token|advance payment|hold a room)\b/, run: (t, ctx) => bookingAnswer(t, ctx) },
  { re: /\b(roommates?|room ?mates?|share a room|split the rent|vacant bed)\b/, run: (t, ctx) => (/vacant|bed board|split the rent/.test(t) ? bedBoardAnswer() : roommateAnswer(t, ctx)) },
  { re: /\b(list (my|our|a)? ?pg|i am an owner|i'?m an owner|add (my )?pg|hostel owner|owner dashboard|analytics|how do i (update|change) (the )?(rent|availability))\b/, run: (t, ctx) => ownerAnswer(t, ctx) },
  { re: /\b(log ?in|sign ?in|sign ?up|register|demo account|password|account|log ?out)\b/, run: () => loginAnswer() },
  { re: /\b(server|mongod|mongo|npm run|localhost|port 5001|database|offline mode|how do i run|set ?up|install)\b/, run: () => setupAnswer() },
  { re: /\b(who owns|owner of|who is the owner|owner'?s (number|contact)|call the owner)\b/, run: (t, ctx) => contactAnswer(t, ctx) },
  { re: /\b(private|privacy|secure|jwt|data safe|403|permission|roles?)\b/, run: () => privacyAnswer() },
  { re: /\b(reviews?|ratings?|rated|feedback|senior tip|mess quality)\b/, run: (t, ctx) => reviewsAnswer(t, ctx) },
  { re: /\b(contact|call|phone|whatsapp|email|talk to (a )?(human|someone|owner|person|team)|support|helpline|complain to someone)\b/, run: (t, ctx) => contactAnswer(t, ctx) },
  { re: /\b(brokerage|broker|zero brokerage)\b/, run: () => ({ text: 'StayScout charges **no brokerage** and takes no cut of your rent — you deal with the owner directly, and no rent or deposit passes through the app.', chips: ['How do I book a visit?', 'Contact a human'], source: 'Booking policy' }) },
  { re: /\b(what is (this|stayscout|pgfinder)|about (the )?(site|project)|what do you do)\b/, run: (t) => pgFinderGeneral(t) },
  { re: /\b(compare top two|top two|best pgs?|recommend|which pg|suggest|find (me )?(a )?pg|show me pgs?|looking for a pg)\b/, run: (t, ctx) => searchAnswer(t, ctx) || compareAnswer(t, ctx) || cheapestAnswer(t) },
];

/**
 * Answer a user question.
 * @param {string} prompt  raw text from the input box
 * @param {{user?:object, token?:string, pathname?:string, rush?:boolean, lastQuestion?:string}} ctx
 * @returns {Promise<{text:string, bullets?:string[], listings?:string[], actions?:{label:string,to?:string,href?:string}[], chips?:string[], source?:string, extra?:string, unmatched?:boolean}>}
 */
export async function answer(prompt, ctx = {}) {
  const raw = String(prompt || '').trim();
  if (!raw) return welcome(ctx);
  const t = raw.toLowerCase().replace(/[?!,;:"']/g, ' ').replace(/\s+/g, ' ').trim();
  const c = { ...ctx, lastQuestion: raw };

  for (const rule of RULES) {
    if (rule.re.test(t)) {
      const res = await rule.run(t, c);
      if (res) return res;
    }
  }

  // Name-based: a listing mentioned on its own ("sunrise house") or a question about "this" PG
  const named = matchListings(t);
  if (named.length && (SEARCH_WORDS.test(t) || named.length === 1)) return listingSummary(named[0]);

  // Free-text search as the last data-driven attempt (e.g. "veg mess, AC under 12k")
  const search = searchAnswer(t, c);
  if (search) return search;

  return fallback(raw, c);
}

// Contextual starter chips — the widget uses these when a conversation opens
export function starterChips(ctx = {}) {
  const listing = listingFromPath(ctx.pathname);
  if (listing) {
    return [
      `Is ${listing.name} safe?`,
      `Total monthly cost at ${listing.name}`,
      `How far is ${listing.name} from LD College?`,
      'Compare with the cheapest PG',
    ];
  }
  if (ctx.user?.role === 'owner') {
    return ['How do I update the rent?', 'What do students see on their side?', 'Owner dashboard guide'];
  }
  if (ctx.user?.role === 'student') {
    return ['Track my complaint', 'What is my rent history?', 'How do I get my deposit back?', ...DEFAULT_CHIPS.slice(0, 2)];
  }
  return DEFAULT_CHIPS;
}

export { DEFAULT_CHIPS };
