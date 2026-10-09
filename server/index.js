// ─── StayScout server · Express API (port 5001) ─────────────────────
import express from 'express';
import cors from 'cors';
import { connectDB, getDB, PORT } from './db.js';
import { sign, hashPassword, verifyPassword, optionalAuth, requireAuth, requireRole } from './auth.js';
import { LISTINGS } from './seed-data.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(optionalAuth);

// ─── Seed listings ONCE (only if properties collection is empty) ────
async function seedIfEmpty() {
  const db = getDB();
  const n = await db.collection('properties').countDocuments();
  if (n > 0) return;
  const docs = LISTINGS.map((l) => ({ ...l, ownerId: l.ownerEmail || null }));
  await db.collection('properties').insertMany(docs);
  console.log(`[seed] ${docs.length} properties inserted`);
}

// ─── Helpers ────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);
const invalid = (res, msg) => res.status(400).json({ error: msg });

function toPublic(l) {
  return l;
}

// ─── AUTH ───────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) return invalid(res, 'name, email, password are required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return invalid(res, 'Invalid email');
  if (password.length < 6) return invalid(res, 'Password must be at least 6 characters');
  if (!['student', 'owner', 'admin'].includes(role)) return invalid(res, 'Role must be student, owner or admin');
  try {
    const db = getDB();
    if (await db.collection('users').findOne({ email: email.toLowerCase() }))
      return invalid(res, 'Email already registered');
    const user = { name, email: email.toLowerCase(), passwordHash: hashPassword(password), role, createdAt: new Date() };
    const r = await db.collection('users').insertOne(user);
    user._id = r.insertedId;
    res.json({ token: sign(user), user: { id: user._id, name, email: user.email, role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return invalid(res, 'email and password required');
  const db = getDB();
  const user = await db.collection('users').findOne({ email: email.toLowerCase() });
  if (!user || !verifyPassword(password, user.passwordHash)) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: sign(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

// ─── LISTINGS (public; server DB when available) ────────────────────
app.get('/api/listings', async (_req, res) => {
  try {
    const rows = await getDB().collection('properties').find().toArray();
    res.json(rows.map(toPublic));
  } catch {
    res.json(LISTINGS); // fallback so the site never breaks
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const l = await getDB().collection('properties').findOne({ id: req.params.id });
    if (l) return res.json(toPublic(l));
  } catch { /* fallthrough */ }
  const l = LISTINGS.find((x) => x.id === req.params.id);
  if (!l) return res.status(404).json({ error: 'Not found' });
  res.json(toPublic(l));
});

// ─── FEATURE 1 · PRICE HISTORY ──────────────────────────────────────
app.post('/api/price-history/update', requireRole('owner', 'admin'), async (req, res) => {
  const { propertyId, newPrice } = req.body || {};
  const p = Number(newPrice);
  if (!propertyId) return invalid(res, 'propertyId required');
  if (!p || p < 500) return invalid(res, 'newPrice must be a number ≥ 500');
  try {
    const db = getDB();
    const prop = await db.collection('properties').findOne({ id: propertyId });
    if (!prop) return res.status(404).json({ error: 'Property not found' });
    if (req.user.role === 'owner' && prop.ownerId && prop.ownerId !== req.user.id)
      return res.status(403).json({ error: 'Not your property' });

    const rec = {
      propertyId, oldPrice: prop.rent, newPrice: p,
      effectiveDate: todayStr(), changedBy: req.user.name, changedByRole: req.user.role,
      recordedAt: new Date(),
    };
    await db.collection('priceHistory').insertOne(rec);
    await db.collection('properties').updateOne({ id: propertyId }, { $set: { rent: p } });
    res.json({ ok: true, record: rec, currentRent: p });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/price-history/:propertyId', async (req, res) => {
  try {
    const rows = await getDB().collection('priceHistory')
      .find({ propertyId: req.params.propertyId }).sort({ recordedAt: 1 }).toArray();
    res.json(rows);
  } catch {
    res.json([]);
  }
});

// ─── FEATURE 3 · AVAILABILITY ───────────────────────────────────────
app.post('/api/availability/update', requireRole('owner', 'admin'), async (req, res) => {
  const { propertyId, availableRooms, availabilityStatus } = req.body || {};
  const rooms = Number(availableRooms);
  if (!propertyId) return invalid(res, 'propertyId required');
  if (rooms < 0) return invalid(res, 'availableRooms must be ≥ 0');
  if (availabilityStatus && !['available', 'limited', 'full', 'uncertain'].includes(availabilityStatus))
    return invalid(res, 'availabilityStatus must be available | limited | full | uncertain');
  try {
    const db = getDB();
    const prop = await db.collection('properties').findOne({ id: propertyId });
    if (!prop) return res.status(404).json({ error: 'Property not found' });
    if (req.user.role === 'owner' && prop.ownerId && prop.ownerId !== req.user.id)
      return res.status(403).json({ error: 'Not your property' });
    const set = { lastUpdatedAt: new Date().toISOString() };
    if (rooms !== undefined) set.bedsAvailable = rooms;
    if (availabilityStatus) set.availabilityStatus = availabilityStatus;
    await db.collection('properties').updateOne({ id: propertyId }, { $set: set });
    await db.collection('availabilityHistory').insertOne({
      propertyId, availableRooms: rooms ?? prop.bedsAvailable,
      availabilityStatus: availabilityStatus || 'uncertain', recordedAt: new Date(),
    });
    res.json({ ok: true, ...set });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/availability-history/:propertyId', async (req, res) => {
  try {
    const rows = await getDB().collection('availabilityHistory')
      .find({ propertyId: req.params.propertyId }).sort({ recordedAt: 1 }).toArray();
    res.json(rows);
  } catch {
    res.json([]);
  }
});

// Estimate: transparent trend model over the NEXT 30 days
app.get('/api/availability/estimate/:propertyId', async (req, res) => {
  const daysAhead = Math.min(90, Math.max(1, Number(req.query.days || 30)));
  try {
    const db = getDB();
    const rows = await db.collection('availabilityHistory')
      .find({ propertyId: req.params.propertyId }).sort({ recordedAt: 1 }).toArray();
    const prop = await db.collection('properties').findOne({ id: req.params.propertyId });
    if (!prop) return res.status(404).json({ error: 'Not found' });
    const current = prop.bedsAvailable ?? 0;
    const totalRooms = prop.totalRooms || ((prop.bedsAvailable || 0) + (prop.occupiedRooms || 3));
    if (rows.length < 3) {
      return res.json({
        enough: false, current, totalRooms,
        note: 'Not enough historical data to estimate future availability.',
      });
    }
    // Slope of beds/day across recorded history
    const t0 = +new Date(rows[0].recordedAt), t1 = +new Date(rows[rows.length - 1].recordedAt);
    const slope = (rows[rows.length - 1].availableRooms - rows[0].availableRooms) / ((t1 - t0) / 86400000 || 1);
    const est = Math.max(0, Math.min(totalRooms, Math.round(current + slope * daysAhead)));
    const spread = Math.abs(rows[rows.length - 1].availableRooms - rows[0].availableRooms);
    const confidence = spread > totalRooms * 0.6 ? 'uncertain' : rows[rows.length - 1].availableRooms > 0 ? 'likely' : 'full';
    res.json({
      enough: true, current, totalRooms, estimated: est, slope, confidence, daysAhead,
      note: `Based on ${rows.length} recent availability records.`,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── FEATURE 4 · COMPLAINTS ─────────────────────────────────────────
const CATEGORIES = ['WiFi', 'Water', 'AC', 'Electricity', 'Plumbing', 'Cleaning', 'Furniture', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

app.post('/api/complaints/file', requireAuth, async (req, res) => {
  const { propertyId, roomNumber, category, title, description, priority, photo } = req.body || {};
  if (!propertyId || !category || !title || !description) return invalid(res, 'propertyId, category, title, description are required');
  if (!CATEGORIES.includes(category)) return invalid(res, `category must be one of ${CATEGORIES.join(', ')}`);
  if (priority && !PRIORITIES.includes(priority)) return invalid(res, `priority must be one of ${PRIORITIES.join(', ')}`);
  try {
    const db = getDB();
    const t = {
      propertyId, roomNumber: roomNumber || '', category,
      title: String(title).slice(0, 80), description: String(description).slice(0, 600),
      priority: priority || 'Medium', photo: typeof photo === 'string' ? photo : null,
      status: 'Reported', reportedBy: req.user.id,
      timeline: [{ status: 'Reported', at: new Date().toISOString(), by: req.user.name }],
      createdAt: new Date(),
    };
    const r = await db.collection('complaints').insertOne(t);
    res.json({ ok: true, id: r.insertedId, ticket: t });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Student's inbox / owner's queue / admin's all
app.get('/api/complaints/mine', requireAuth, async (req, res) => {
  const db = getDB();
  let q = {};
  if (req.user.role === 'student') q = { reportedBy: req.user.id };
  else if (req.user.role === 'owner') q = { propertyId: { $in: await ownedIds(db, req.user) } };
  const rows = await db.collection('complaints').find(q).sort({ createdAt: -1 }).toArray();
  res.json(rows);
});

async function ownedIds(db, user) {
  const props = await db.collection('properties').find({}).toArray();
  return props.filter((p) => !p.ownerId || p.ownerId === user.id).map((p) => p.id);
}

// Owner/admin transition: Reported → In Progress → Resolved
app.post('/api/complaints/:id/status', requireRole('owner', 'admin'), async (req, res) => {
  const { status, note } = req.body || {};
  if (!['Reported', 'In Progress', 'Resolved'].includes(status))
    return invalid(res, 'status must be Reported | In Progress | Resolved');
  const db = getDB();
  const { ObjectId } = await import('mongodb');
  let _id; try { _id = new ObjectId(req.params.id); } catch { return invalid(res, 'bad id'); }
  const t = await db.collection('complaints').findOne({ _id });
  if (!t) return res.status(404).json({ error: 'Complaint not found' });
  if (req.user.role === 'owner' && !(await ownedIds(db, req.user)).includes(t.propertyId))
    return res.status(403).json({ error: 'Not your property' });
  const seq = { Reported: 0, 'In Progress': 1, Resolved: 2 };
  if (seq[status] < seq[t.status]) return invalid(res, `Cannot go back from ${t.status}`);
  const upd = {
    $set: { status },
    $push: { timeline: { status, at: new Date().toISOString(), by: req.user.name, note: note || '' } },
  };
  await db.collection('complaints').updateOne({ _id }, upd);
  // Notification for student
  await db.collection('notifications').insertOne({
    userId: t.reportedBy, type: 'complaint-status', complaintId: _id,
    text: `Your "${t.title}" ticket is now ${status}`, at: new Date().toISOString(), read: false,
  });
  res.json({ ok: true, status });
});

app.get('/api/notifications', requireAuth, async (req, res) => {
  const rows = await getDB().collection('notifications')
    .find({ userId: req.user.id }).sort({ at: -1 }).limit(15).toArray();
  res.json(rows);
});

// ─── FEATURE 5 · SWITCHING PLANS ────────────────────────────────────
const STEPS = [
  'Check notice period', 'Submit notice to current PG', 'Confirm deposit settlement',
  'Find new PG', 'Confirm new PG', 'Upload move-out evidence', 'Complete move-out', 'Track deposit refund',
];

app.post('/api/switching-plans', requireAuth, async (req, res) => {
  const { currentPGId, currentRent, deposit, noticePeriodDays, deductions } = req.body || {};
  if (!currentPGId) return invalid(res, 'currentPGId required');
  const rent = Number(currentRent), dep = Number(deposit), notice = Number(noticePeriodDays);
  if (rent < 0 || dep < 0 || notice < 0) return invalid(res, 'rent, deposit, noticePeriodDays must be non-negative');
  const depositOf = new Date();
  depositOf.setDate(depositOf.getDate() + (notice || 0));
  const doc = {
    userId: req.user.id, currentPGId, currentRent: rent, deposit: dep,
    noticePeriodDays: notice || 0, deductions: Math.max(0, Number(deductions) || 0),
    earliestMoveOut: depositOf.toISOString().slice(0, 10),
    estimatedRefund: Math.max(0, dep - (Number(deductions) || 0)),
    steps: STEPS.map((label, i) => ({ i, label, done: i === 0, at: i === 0 ? new Date().toISOString() : null })),
    createdAt: new Date(),
  };
  const r = await getDB().collection('switchingPlans').insertOne(doc);
  res.json({ id: r.insertedId, plan: doc });
});

app.get('/api/switching-plans/mine', requireAuth, async (req, res) => {
  const rows = await getDB().collection('switchingPlans')
    .find({ userId: req.user.id }).sort({ createdAt: -1 }).toArray();
  res.json(rows);
});

app.post('/api/switching-plans/:id/step', requireAuth, async (req, res) => {
  const { index, done } = req.body || {};
  const i = Number(index);
  if (i < 0 || i > 7) return invalid(res, 'step index must be 0–7');
  const { ObjectId } = await import('mongodb');
  let _id; try { _id = new ObjectId(req.params.id); } catch { return invalid(res, 'bad id'); }
  const db = getDB();
  const plan = await db.collection('switchingPlans').findOne({ _id, userId: req.user.id });
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  plan.steps[i] = { ...plan.steps[i], done: !!done, at: done ? new Date().toISOString() : null };
  await db.collection('switchingPlans').updateOne({ _id }, { $set: { steps: plan.steps } });
  const pct = Math.round((plan.steps.filter((s) => s.done).length / plan.steps.length) * 100);
  res.json({ ok: true, steps: plan.steps, percent: pct });
});

// ─── ADMIN overview ─────────────────────────────────────────────────
app.get('/api/admin/overview', requireRole('admin'), async (_req, res) => {
  const db = getDB();
  const [price, avail, comps, plans, users] = await Promise.all([
    db.collection('priceHistory').find().sort({ recordedAt: -1 }).limit(30).toArray(),
    db.collection('availabilityHistory').find().sort({ recordedAt: -1 }).limit(30).toArray(),
    db.collection('complaints').find().sort({ createdAt: -1 }).limit(30).toArray(),
    db.collection('switchingPlans').find().sort({ createdAt: -1 }).limit(30).toArray(),
    db.collection('users').find({}, { projection: { passwordHash: 0 } }).toArray(),
  ]);
  res.json({ priceChanges: price, availabilityUpdates: avail, complaints: comps, switchingPlans: plans, users });
});

// ─── START ──────────────────────────────────────────────────────────
connectDB().then(seedIfEmpty).then(() => {
  app.listen(PORT, () => console.log(`[stayscout-server] listening → http://localhost:${PORT}`));
}).catch((e) => {
  console.error('DB connection failed:', e.message);
});
