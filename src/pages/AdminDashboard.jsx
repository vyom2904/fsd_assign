import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { LISTINGS } from '../data/listings.js';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const name = (id) => LISTINGS.find((l) => l.id === id)?.name || id;

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { setErr('Admin access required'); return; }
    api.admin.overview(token).then(setData).catch((e) => setErr(e.message));
  }, [user, token]);

  return (
    <div className="min-h-screen bg-canvas text-white">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-3 pb-16 pt-24 sm:pt-28">
        <div className="rounded-[24px] border border-white/[0.08] bg-surface p-5 sm:rounded-[28px] sm:p-8">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-bronze">
            <ShieldCheck size={12} /> Admin dashboard
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Platform overview</h1>

          {err && <p className="mt-6 rounded-xl bg-rose-500/10 px-4 py-3 text-[13px] text-rose-300">{err}</p>}

          {data && (
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <Card title="Price changes (latest)">{/* price rows */}
                {data.priceChanges.length ? data.priceChanges.map((r) => (
                  <Row key={r._id} main={`${name(r.propertyId)}: ${fmt(r.oldPrice)} → ${fmt(r.newPrice)}`} sub={`${r.effectiveDate} · by ${r.changedBy} (${r.changedByRole})`} />
                )) : <Empty />}
              </Card>

              <Card title="Availability history (latest)">
                {data.availabilityUpdates.length ? data.availabilityUpdates.map((r) => (
                  <Row key={r._id} main={`${name(r.propertyId)}: ${r.availableRooms} room(s) · ${r.availabilityStatus}`} sub={new Date(r.recordedAt).toLocaleString('en-IN')} />
                )) : <Empty />}
              </Card>

              <Card title="Maintenance complaints">
                {data.complaints.length ? data.complaints.map((c) => (
                  <Row key={c._id} main={`${c.title} · ${c.status}`} sub={`${name(c.propertyId)} · ${c.category} · ${c.priority} priority`} />
                )) : <Empty />}
              </Card>

              <Card title="PG switching reports">
                {data.switchingPlans.length ? data.switchingPlans.map((p) => (
                  <Row key={p._id} main={`${name(p.currentPGId)} → move-out ${p.earliestMoveOut}`} sub={`refund est. ${fmt(p.estimatedRefund)} · ${p.steps.filter((s) => s.done).length}/${p.steps.length} steps done`} />
                )) : <Empty />}
              </Card>

              <Card title="Users" className="lg:col-span-2">
                {data.users.map((u) => (
                  <Row key={u._id} main={`${u.name} (${u.role})`} sub={u.email} />
                ))}
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Card({ title, children, className = '' }) {
  return (
    <div className={`rounded-[20px] border border-white/10 bg-card p-5 ${className}`}>
      <p className="text-[13px] font-semibold">{title}</p>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function Row({ main, sub }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
      <p className="text-[12px] text-white/80">{main}</p>
      <p className="text-[10.5px] text-white/40">{sub}</p>
    </div>
  );
}

const Empty = () => <p className="text-[12px] text-white/35">No records yet.</p>;
