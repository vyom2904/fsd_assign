import { answer, starterChips } from './src/utils/assistant.js';

const Qs = [
  'hi',
  'what can you do?',
  'are you a real AI?',
  'girls PG under ₹9,000 with WiFi near LD College',
  'cheapest PG in Ahmedabad',
  'which PG is best for studying?',
  'is it safe for girls?',
  'what is the deposit at Sunrise House?',
  'total monthly cost at The Den',
  'compare Sunrise House and The Den',
  'how far is Metro Nest from BVM Engineering?',
  'show me colleges',
  'PG for one semester',
  'any beds available?',
  'how do I book a visit?',
  'I need a roommate under ₹8,000',
  'where can I buy a study table?',
  'I am an owner, how do I update the rent?',
  'demo account login details',
  'is my data private?',
  'reviews for The Den',
  'whats the wifi speed at Sunrise House',
  'talk to a human',
  'who won the cricket world cup',
  'tell me about Heritage Homes',
  'pgs with no curfew',
  'how do I get my deposit back',
  'track my complaint',
  'rent history for Sunrise House',
  'reviews for The Den',
  'where can I buy a study table?',
  'pgs with no curfew',
  "what's the wifi speed at Sunrise House",
  'complaints at Sunrise House',
  'cheapest with wifi',
  'roommates under 8000',
  'compare the top two',
  'tell me about Metro Nest',
  'who won the cricket world cup',
  'is there a brokerage fee',
  "I'm a parent, is it safe for girls",
  'show the most expensive ones',
  'what deductions are normal',
  'how accurate is the availability predictor?',
  'show PGs with a curfew',
  'does The Den have a study room',
  'who owns The Den',
  'how do I start the server?',
  'which is closest to the hospital?',
];

const ctx = { user: null, token: null, pathname: '/' };
let fail = 0;
for (const q of Qs) {
  const r = await answer(q, ctx);
  const empty = !r.text;
  if (empty) fail++;
  console.log('─'.repeat(72));
  console.log('Q:', q);
  console.log('TEXT:', r.text.replace(/\*\*/g, ''));
  (r.bullets || []).slice(0, 4).forEach((b) => console.log('   •', b.replace(/\*\*/g, '')));
  if (r.listings?.length) console.log('   cards:', r.listings.join(', '));
  if (r.actions?.length) console.log('   actions:', r.actions.map((a) => a.label).join(' | '));
  console.log('   chips:', (r.chips || []).join(' | '), '| source:', r.source || '-');
}
console.log('\nstarterChips(listing page):', starterChips({ pathname: '/pgs/sunrise-house' }).join(' | '));
console.log('empty replies:', fail);
