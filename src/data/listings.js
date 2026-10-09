// ─── PGFinder · Ahmedabad demo data ─────────────────────────────────
// All "real-world" features (commute times, trust flags, true costs,
// mess menus, nearby places, safety info) are seeded here.

export const BRAND = {
  name: 'PGFinder',
  wordmark: 'PGFINDER',
  tagline: 'Find your home away from home',
  since: '2015',
  city: 'Ahmedabad',
  phone: '+91 98100 12345',
  phoneHref: 'tel:+919810012345',
  whatsapp: 'https://wa.me/919810012345',
  email: 'hello@pgfinder.example',
  address: '2nd Floor, Commerce Six Roads, Navrangpura, Ahmedabad 380009',
};

// Google-Maps-style links (open real map, zero API key needed)
export const mapLink = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query + ', Ahmedabad')}`;

export const IMG = {
  hero: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=2400&q=80',
  why: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1400&q=80',
  cta: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
};

export const CITIES = ['Ahmedabad'];

// ─── Colleges (commute search targets) ──────────────────────────────
export const COLLEGES = [
  { id: 'ld', name: 'LD Arts College', area: 'Navrangpura' },
  { id: 'gu', name: 'Gujarat University', area: 'Navrangpura' },
  { id: 'nirma', name: 'Nirma University', area: 'Chharodi, SG Highway' },
  { id: 'cept', name: 'CEPT University', area: 'Navrangpura' },
  { id: 'imanipal', name: 'ICCCR / Manipal', area: 'Beta, Gandhinagar highway' },
  { id: 'bvm', name: 'BVM Engineering', area: 'Vallabh Vidyanagar' },
];

// ─── Listings ────────────────────────────────────────────────────────
// commute: minutes by mode to each COLLEGES id, [normal, rushHour]
const L = (o) => o;

export const LISTINGS = [
  L({
    id: 'sunrise-house',
    name: 'Sunrise House PG',
    city: 'Ahmedabad',
    area: 'Navrangpura',
    gender: 'girls',
    rent: 8500,
    roomType: 'Sharing Room',
    bedsAvailable: 3,
    rating: 4.7,
    reviews: 32,
    verified: true,
    trust: { physicallyVisited: true, ownerKYC: true, photosMatch: true },
    trueCost: { electricity: 600, food: 0, maintenance: 200, deposit: 8500, note: 'Meals included in rent' },
    commute: {
      ld: [8, 14], gu: [10, 16], cept: [12, 20], nirma: [35, 55], imanipal: [50, 75], bvm: [80, 110],
    },
    amenities: ['WiFi', 'Meals', 'AC', 'Laundry', 'Power Backup', 'CCTV'],
    rules: ['No smoking', 'Visitors till 8 PM', 'Vegetarian mess'],
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
    ],
    realityCheck: {
      bathroom: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
      kitchen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      waterPressure: 'Good — 24×7 borewell + AMC water',
      wifiTested: '86 Mbps download, 42 upload (tested 2 Sep)',
    },
    mess: {
      rating: 4.5,
      menu: {
        Mon: 'Thepla, Sev tameta nu shaak, Rotli, Dal, Chawal',
        Tue: 'Poha, Undhiyu, Rotli, Kadhi, Chawal',
        Wed: 'Idli-sambhar, Paneer sabzi, Rotli, Dal, Chawal',
        Thu: 'Upma, Mix veg, Rotli, Dal, Chawal',
        Fri: 'Besan chilla, Bhindi sabzi, Rotli, Dal, Chawal',
        Sat: 'Dhokla, Handvo, Rotli, Dal, Chawal',
        Sun: 'Puri bhaji, Khichdi kadhi',
      },
    },
    nearby: [
      { type: 'Mess', name: 'Radhe Mess', dist: '350 m' },
      { type: 'Laundry', name: 'Ujjala Dry Clean', dist: '500 m' },
      { type: 'Medical', name: 'Sunrise Medical Store', dist: '250 m' },
      { type: 'Stationery', name: 'Navrang Book Depot', dist: '700 m' },
      { type: 'Gym', name: 'Gold Gym Navrangpura', dist: '1.1 km' },
      { type: 'Coaching', name: 'Career Launcher', dist: '900 m' },
    ],
    safety: { cctv: true, guard: true, curfew: '10:30 PM', womenOnlyFloor: true, hospital: 'Civil Hospital — 2.8 km', police: 'Navrangpura PS — 1.2 km' },
    study: { wifiSpeed: 86, quietHours: true, studyRoom: false, powerBackup: true, desk: true },
    policy: { depositMonths: 2, refundDays: 15, visitors: 'Till 8 PM, register at desk', guestNights: 'Not allowed', noticePeriod: '1 month' },
    description: 'A calm, family-run girls PG two lanes off Gujarat College road. Home-cooked Gujarati mess, spotless bathrooms and a reading corner — most residents are LD and GU first-years.',
  }),

  L({
    id: 'the-den',
    name: 'The Den Co-living',
    city: 'Ahmedabad',
    area: 'Prahladnagar',
    gender: 'any',
    rent: 15500,
    roomType: 'Co-living',
    bedsAvailable: 1,
    rating: 4.9,
    reviews: 58,
    verified: true,
    trust: { physicallyVisited: true, ownerKYC: true, photosMatch: true },
    trueCost: { electricity: 0, food: 1500, maintenance: 0, deposit: 15500, note: 'All-inclusive: AC, power, housekeeping' },
    commute: {
      ld: [25, 40], gu: [22, 38], cept: [24, 40], nirma: [18, 30], imanipal: [30, 48], bvm: [90, 120],
    },
    amenities: ['WiFi', 'AC', 'Housekeeping', 'Gym', 'Meals on request'],
    rules: ['No smoking', 'Quiet hours after 10 PM'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1000&q=80',
    ],
    realityCheck: {
      bathroom: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
      kitchen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      waterPressure: 'Excellent — corporate building supply',
      wifiTested: '240 Mbps fibre (tested 5 Sep)',
    },
    mess: null,
    nearby: [
      { type: 'Cafe', name: 'Third Wave Coffee', dist: '200 m' },
      { type: 'Gym', name: 'Cult Prahladnagar', dist: '400 m' },
      { type: 'Medical', name: 'Zota Health Care', dist: '1.0 km' },
      { type: 'Laundry', name: 'TumbleDry', dist: '600 m' },
    ],
    safety: { cctv: true, guard: true, curfew: 'None — keycard access', womenOnlyFloor: false, hospital: 'Zota Care — 1.0 km', police: 'Prahladnagar PS — 1.5 km' },
    study: { wifiSpeed: 240, quietHours: true, studyRoom: true, powerBackup: true, desk: true },
    policy: { depositMonths: 1, refundDays: 7, visitors: 'Anytime in common lounge', guestNights: '2 guest nights/month, ₹500', noticePeriod: '15 days' },
    description: 'Hotel-grade co-living on Prahladnagar corporate road. 240 Mbps fibre, a silent study lounge, weekly housekeeping and zero curfew — built for final-years and interns.',
    tiffins: [
      { name: 'Maa Tiffin Service', price: 2200, opts: 'Veg · Jain on request', dist: 'delivers to door' },
      { name: 'Rasoi Tiffin Point', price: 1800, opts: 'Veg & non-veg', dist: '1.2 km' },
    ],
  }),

  L({
    id: 'metro-nest',
    name: 'Metro Nest PG',
    city: 'Ahmedabad',
    area: 'Maninagar',
    gender: 'boys',
    rent: 6500,
    roomType: 'Sharing Room',
    bedsAvailable: 5,
    rating: 4.4,
    reviews: 41,
    verified: true,
    trust: { physicallyVisited: true, ownerKYC: true, photosMatch: false },
    trueCost: { electricity: 400, food: 2200, maintenance: 100, deposit: 6500, note: 'Mess optional ₹2,200/month' },
    commute: {
      ld: [30, 45], gu: [32, 48], cept: [30, 48], nirma: [45, 65], imanipal: [60, 85], bvm: [55, 80],
    },
    amenities: ['WiFi', 'Laundry', 'CCTV', 'Meals'],
    rules: ['No smoking', 'Night entry till 11 PM'],
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1000&q=80',
    ],
    realityCheck: {
      bathroom: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
      kitchen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      waterPressure: 'Average — municipal supply, evening dip',
      wifiTested: '34 Mbps (tested 1 Sep)',
    },
    mess: {
      rating: 3.9,
      menu: {
        Mon: 'Khaman, Dal fry, Rotli, Chawal',
        Tue: 'Poha, Chana masala, Rotli, Chawal',
        Wed: 'Fafda-jalebi (Sun special), Dal, Rotli',
        Thu: 'Upma, Veg kolhapuri, Rotli, Chawal',
        Fri: 'Khichdi, Kadhi, Papad',
        Sat: 'Pav bhaji',
        Sun: 'Puri shak, Halwa',
      },
    },
    nearby: [
      { type: 'Mess', name: 'Maninagar Bhojanalay', dist: '300 m' },
      { type: 'Stationery', name: 'Shreeji Book Center', dist: '450 m' },
      { type: 'Medical', name: 'Life Care Pharmacy', dist: '350 m' },
      { type: 'Laundry', name: 'Speed Wash', dist: '800 m' },
    ],
    safety: { cctv: true, guard: false, curfew: '11 PM', womenOnlyFloor: false, hospital: 'LG Hospital — 2.2 km', police: 'Maninagar PS — 900 m' },
    study: { wifiSpeed: 34, quietHours: false, studyRoom: false, powerBackup: false, desk: false },
    policy: { depositMonths: 2, refundDays: 30, visitors: 'Till 9 PM in common area', guestNights: 'Not allowed', noticePeriod: '1 month' },
    description: 'No-frills boys PG near Maninagar station — the cheapest verified option with meals. WiFi is average and evenings are lively; bring a study table.',
  }),

  L({
    id: 'green-nest',
    name: 'Green Nest PG',
    city: 'Ahmedabad',
    area: 'Vastrapur',
    gender: 'girls',
    rent: 9200,
    roomType: 'Single Room',
    bedsAvailable: 2,
    rating: 4.6,
    reviews: 22,
    verified: true,
    trust: { physicallyVisited: true, ownerKYC: true, photosMatch: true },
    trueCost: { electricity: 700, food: 0, maintenance: 300, deposit: 9200, note: 'Pure-veg mess included' },
    commute: {
      ld: [12, 20], gu: [9, 15], cept: [14, 22], nirma: [22, 38], imanipal: [40, 60], bvm: [85, 115],
    },
    amenities: ['WiFi', 'Meals', 'Power Backup', 'CCTV', 'Hot Water'],
    rules: ['Vegetarian mess', 'Visitors till 7 PM'],
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80',
    ],
    realityCheck: {
      bathroom: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
      kitchen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      waterPressure: 'Good',
      wifiTested: '72 Mbps (tested 3 Sep)',
    },
    mess: {
      rating: 4.7,
      menu: {
        Mon: 'Idada, Gujarati thali',
        Tue: 'Dhokla, Undhiyu, Rotli',
        Wed: 'Khandvi, Paneer bhurji, Rotli',
        Thu: 'Thepla, Dal makhani, Jeera rice',
        Fri: 'Handvo, Mix sabzi, Rotli',
        Sat: 'Khichdi, Kadhi, Papad',
        Sun: 'Special thali',
      },
    },
    nearby: [
      { type: 'Market', name: 'Vastrapur Lake Market', dist: '600 m' },
      { type: 'Gym', name: 'Anytime Fitness', dist: '900 m' },
      { type: 'Medical', name: 'Sterling Hospital', dist: '1.4 km' },
      { type: 'Mess', name: 'Gokul Mess', dist: '400 m' },
    ],
    safety: { cctv: true, guard: true, curfew: '10 PM', womenOnlyFloor: true, hospital: 'Sterling — 1.4 km', police: 'Vastrapur PS — 1.1 km' },
    study: { wifiSpeed: 72, quietHours: true, studyRoom: true, powerBackup: true, desk: true },
    policy: { depositMonths: 2, refundDays: 15, visitors: 'Till 7 PM, guardians only', guestNights: 'Not allowed', noticePeriod: '1 month' },
    description: 'Single-room girls PG by Vastrapur lake with a dedicated study room and pure-veg mess. Quiet hours after 10 — popular with GU and CEPT postgrad students.',
  }),

  L({
    id: 'campus-court',
    name: 'Campus Court Residency',
    city: 'Ahmedabad',
    area: 'Chharodi, SG Highway',
    gender: 'any',
    rent: 11000,
    roomType: 'Single Room',
    bedsAvailable: 4,
    rating: 4.5,
    reviews: 18,
    verified: true,
    trust: { physicallyVisited: true, ownerKYC: true, photosMatch: true },
    trueCost: { electricity: 500, food: 2400, maintenance: 0, deposit: 11000, note: 'Mess plan mandatory ₹2,400' },
    commute: {
      ld: [30, 48], gu: [28, 45], cept: [32, 50], nirma: [6, 10], imanipal: [20, 35], bvm: [95, 130],
    },
    amenities: ['WiFi', 'AC', 'Meals', 'Gym', 'Parking'],
    rules: ['No smoking', 'Guests with prior notice'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80',
    ],
    realityCheck: {
      bathroom: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
      kitchen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      waterPressure: 'Excellent',
      wifiTested: '150 Mbps (tested 28 Aug)',
    },
    mess: { rating: 4.2, menu: { Mon: 'Poha, Thali', Tue: 'Dosa, Thali', Wed: 'Upma, Thali', Thu: 'Idli, Thali', Fri: 'Poha, Thali', Sat: 'Pav bhaji', Sun: 'Biryani' } },
    nearby: [
      { type: 'Cafe', name: 'Coffee Culture', dist: '300 m' },
      { type: 'Stationery', name: 'SG Xerox & Books', dist: '250 m' },
      { type: 'Medical', name: 'Apollo Pharmacy', dist: '700 m' },
      { type: 'Gym', name: 'FitZone SG', dist: '850 m' },
    ],
    safety: { cctv: true, guard: true, curfew: 'None', womenOnlyFloor: false, hospital: 'Apollo — 1.6 km', police: 'Sarkhej PS — 2.0 km' },
    study: { wifiSpeed: 150, quietHours: true, studyRoom: true, powerBackup: true, desk: true },
    policy: { depositMonths: 2, refundDays: 15, visitors: 'Lounge, with prior notice', guestNights: '1 night/month, free', noticePeriod: '1 month' },
    description: 'Six minutes from the Nirma gate — wake up at 8:50 for a 9 AM lecture. AC single rooms, resident gym and a proper study room shared by four students per floor.',
  }),

  L({
    id: 'heritage-homes',
    name: 'Heritage Homes PG',
    city: 'Ahmedabad',
    area: 'Old City, Khadia',
    gender: 'boys',
    rent: 5500,
    roomType: 'Sharing Room',
    bedsAvailable: 6,
    rating: 4.1,
    reviews: 15,
    verified: false,
    trust: { physicallyVisited: false, ownerKYC: false, photosMatch: false },
    trueCost: { electricity: 350, food: 2000, maintenance: 0, deposit: 5500, note: 'Cheap but basic' },
    commute: {
      ld: [22, 35], gu: [25, 38], cept: [20, 32], nirma: [42, 60], imanipal: [55, 80], bvm: [70, 100],
    },
    amenities: ['WiFi', 'Meals', 'Hot Water'],
    rules: ['No smoking', 'Night entry till 10 PM'],
    images: [
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1000&q=80',
    ],
    realityCheck: {
      bathroom: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
      kitchen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      waterPressure: 'Low in summer',
      wifiTested: '22 Mbps (tested 30 Aug)',
    },
    mess: { rating: 3.6, menu: { Mon: 'Rotli dal', Tue: 'Khichdi', Wed: 'Rotli shak', Thu: 'Pulav', Fri: 'Rotli dal', Sat: 'Pav bhaji', Sun: 'Thali' } },
    nearby: [
      { type: 'Market', name: 'Manek Chowk', dist: '1.2 km' },
      { type: 'Mess', name: 'Khadia Bhojanalay', dist: '200 m' },
      { type: 'Medical', name: 'GCS Hospital', dist: '1.8 km' },
    ],
    safety: { cctv: false, guard: false, curfew: '10 PM', womenOnlyFloor: false, hospital: 'GCS — 1.8 km', police: 'Khadia PS — 600 m' },
    study: { wifiSpeed: 22, quietHours: false, studyRoom: false, powerBackup: false, desk: false },
    policy: { depositMonths: 1, refundDays: 30, visitors: 'Till 8 PM', guestNights: 'Not allowed', noticePeriod: '15 days' },
    description: 'Old-city budget PG in Khadia — ₹5,500 all-in with simple meals. Basic rooms, no study extras; you are paying for location and price, nothing else.',
  }),
];

// ─── Study Score inputs (per listing, above) → scored in utils/intelligence.js

// ─── Flexible stays: semester & exam-period pricing ───────────────
export const DURATIONS = [
  { id: '1m', label: '1 month', months: 1, mult: 1.15, note: 'Exam-period / short stay premium' },
  { id: '6m', label: 'Semester · 6 months', months: 6, mult: 1.0, note: 'Standard rate' },
  { id: '12m', label: 'Academic year · 12 months', months: 12, mult: 0.9, note: '10% locked-in discount' },
];

// ─── Verified-student reviews (college-email verified) + senior tips ─
export const REVIEWS = [
  { id: 1, listingId: 'sunrise-house', name: 'Ananya I.', college: 'ld', verified: true, rating: 5, food: 5, text: 'Warden treats you like family. Rotis are unlimited and the WiFi held up through my entire submission week.', date: 'Sep 2026', senior: true, tip: 'Ask for the 2nd-floor rooms — better water pressure and the WiFi router is right there.' },
  { id: 2, listingId: 'sunrise-house', name: 'Riya S.', college: 'gu', verified: true, rating: 4, food: 4, text: 'Great location, 8 min walk to LD. Curfew is strict at 10:30 but that is exactly what my parents wanted.', date: 'Aug 2026', senior: false },
  { id: 3, listingId: 'the-den', name: 'Dev S.', college: 'nirma', verified: true, rating: 5, food: 3, text: 'The study lounge at 2 AM before internals is the reason I renewed. Food plan is okay, I mostly order tiffin.', date: 'Sep 2026', senior: true, tip: 'Book 3 months before the semester — the 12-month rate is the only way it feels affordable.' },
  { id: 4, listingId: 'metro-nest', name: 'Kunal P.', college: 'bvm', verified: true, rating: 4, food: 4, text: 'For ₹6,500 with meals this is unbeatable near Maninagar. Evenings are noisy during cricket season, headphones solve it.', date: 'Jul 2026', senior: true, tip: 'Bring your own table and extension board — sockets are only two per room.' },
  { id: 5, listingId: 'green-nest', name: 'Mahek D.', college: 'gu', verified: true, rating: 5, food: 5, text: 'The study room saved my CPA exams. Pure veg mess is genuinely good — the Thursday dal makhani is famous.', date: 'Sep 2026', senior: false },
  { id: 6, listingId: 'campus-court', name: 'Arjun T.', college: 'nirma', verified: true, rating: 5, food: 4, text: '6 minutes to the Nirma gate is not marketing, I have timed it. Gym is small but never crowded.', date: 'Aug 2026', senior: true, tip: 'Mess is mandatory — if you eat out often, do the math before choosing this over The Den.' },
  { id: 7, listingId: 'heritage-homes', name: 'Rahul M.', college: 'ld', verified: true, rating: 3, food: 3, text: 'Cheapest verified bed in old city. Photos on the listing are flattering — rooms are darker in person.', date: 'Jun 2026', senior: true, tip: 'Summer afternoons are rough without AC. The Khadia library nearby is the real study room.' },
  { id: 8, listingId: 'the-den', name: 'Nidhi S.', college: 'bvm', verified: true, rating: 4, food: 3, text: 'Zero curfew and keycard entry felt too liberal to my parents until they saw the CCTV coverage in parent view.', date: 'Sep 2026', senior: false },
];

// ─── "Find a roommate for this room" vacant-bed board ─────────────
export const BED_BOARD_SEED = [
  { id: 1, listingId: 'the-den', area: 'Prahladnagar', gender: 'any', rent: 7750, note: 'I have the single room, looking for one person to split it. Silent study types preferred.', postedBy: 'Dev Shah', college: 'nirma', contact: 'dev.s@nirmauni.ac.in', date: '28 Sep', requests: 3 },
  { id: 2, listingId: 'metro-nest', area: 'Maninagar', gender: 'boys', rent: 3250, note: 'Vacant bed in our 2-sharing. We are three BVM juniors, mess is optional.', postedBy: 'Kunal Patel', college: 'bvm', contact: 'kunal.p@bvm.ac.in', date: '27 Sep', requests: 1 },
  { id: 3, listingId: 'sunrise-house', area: 'Navrangpura', gender: 'girls', rent: 4250, note: 'Sharing room, 8 min from LD. Looking for an early sleeper — warden is very particular.', postedBy: 'Krisha Patel', college: 'ld', contact: 'krisha@ldarts.ac.in', date: '26 Sep', requests: 5 },
];

export const SPOTLIGHT = LISTINGS[0];

// Deposit + refund policy in plain language
export function depositPolicy(listing) {
  const p = listing.policy;
  if (!p) return null;
  return `${p.depositMonths} month${p.depositMonths > 1 ? 's' : ''} deposit · refundable in ${p.refundDays} days`;
}

export const STAT_CARDS = [
  { big: '2,400+', small: 'Verified PGs in Ahmedabad' },
  { big: '18,000+', small: 'Happy Residents' },
  { big: '6', small: 'Partner Colleges' },
];

export const TESTIMONIALS = [
  {
    quote: 'Found a verified girls PG near LD College in two days. The commute times were accurate to the minute and there was zero brokerage. Genuinely refreshing.',
    name: 'Ananya Iyer',
    place: 'LD Arts College',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'The Price Honesty Score saved me from a PG that looked cheap but charged ₹1,800 extra for electricity. The true monthly cost shown here was exactly what I pay.',
    name: 'Rohit Malhotra',
    place: 'Nirma University',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'My parents used Parent Mode before I even visited. Seeing CCTV, the curfew and the distance to the hospital convinced them instantly.',
    name: 'Simran Kaur',
    place: 'CEPT University',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  },
];

// ─── Roommate matching (quiz → mock profiles) ───────────────────────
export const ROOMMATES = [
  { id: 1, name: 'Krisha Patel', age: 20, college: 'LD Arts College', course: 'B.Des', veg: true, sleep: 'early', cleanliness: 5, study: 'night', smoking: false, budget: 9000, bio: 'Design student, early sleeper, keeps the desk organized, chai over coffee.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
  { id: 2, name: 'Dev Shah', age: 21, college: 'Nirma University', course: 'B.Tech CSE', veg: true, sleep: 'late', cleanliness: 4, study: 'night', smoking: false, budget: 12000, bio: 'Coder, plays badminton at 6 AM, looking for a quiet roommate near campus.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { id: 3, name: 'Mahek Desai', age: 19, college: 'Gujarat University', course: 'BBA', veg: false, sleep: 'early', cleanliness: 3, study: 'morning', smoking: false, budget: 8000, bio: 'Morning person, loves Gujarati novels, OK with non-veg twice a week.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80' },
  { id: 4, name: 'Arjun Trivedi', age: 22, college: 'CEPT', course: 'M.Arch', veg: true, sleep: 'late', cleanliness: 5, study: 'night', smoking: false, budget: 15000, bio: 'Architecture studios run late. Neat freak about shared spaces though.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
  { id: 5, name: 'Nidhi Soni', age: 20, college: 'BVM', course: 'B.Tech IT', veg: true, sleep: 'early', cleanliness: 4, study: 'morning', smoking: false, budget: 7000, bio: 'Gujarati foodie, 5 AM riser, marathon trainee on weekends.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
];

// ─── Complaint tracker seeds ────────────────────────────────────────
export const COMPLAINTS_SEED = [
  { id: 1, listingId: 'sunrise-house', title: 'WiFi slow after 9 PM', category: 'WiFi', status: 'In progress', opened: '12 Sep', updates: ['Ticket opened', 'Owner restarted router', 'Technician scheduled 16 Sep'] },
  { id: 2, listingId: 'sunrise-house', title: 'Geyser leaking in bathroom 2', category: 'Water', status: 'Resolved', opened: '2 Sep', updates: ['Ticket opened', 'Plumber visited', 'Fixed and verified'] },
];

// ─── Move-out marketplace seeds ─────────────────────────────────────
export const MARKET_ITEMS = [
  { id: 1, title: 'Study table + chair (2 yrs old)', price: 1200, seller: 'Aarav (passed out 2024)', cond: 'Good', img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80' },
  { id: 2, title: 'Symphony air cooler', price: 2200, seller: 'Kunal (final year)', cond: 'Like new', img: 'https://images.unsplash.com/photo-1730299789489-b55bf96b22bf?q=80&w=1365&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 3, title: 'B.Tech CSE books bundle', price: 800, seller: 'Priya (alumna)', cond: 'Good', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80' },
  { id: 4, title: 'Bicycle — Hero Sprint', price: 3000, seller: 'Dev (moving to Bengaluru)', cond: 'Well used', img: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80' },
];

// ─── Owner dashboard mock analytics ─────────────────────────────────
export const OWNER_ANALYTICS = {
  views: [320, 410, 380, 520, 610, 590, 720],
  enquiries: [12, 18, 15, 24, 30, 27, 38],
  conversions: [2, 3, 2, 5, 6, 5, 8],
  weeks: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
};

// ─── i18n (EN / HI / GU) ────────────────────────────────────────────
export const I18N = {
  en: { search: 'Search PG', trueCost: 'True monthly cost', verified: 'Verified', viewDetails: 'View Details', bedsLeft: 'beds left' },
  hi: { search: 'पीजी खोजें', trueCost: 'असली मासिक खर्च', verified: 'सत्यापित', viewDetails: 'विवरण देखें', bedsLeft: 'बिस्तर बचे' },
  gu: { search: 'પીજી શોધો', trueCost: 'અસલી માસિક ખર્ચ', verified: 'ચકાસાયેલ', viewDetails: 'વિગતો જુઓ', bedsLeft: 'બેડ બાકી' },
};
