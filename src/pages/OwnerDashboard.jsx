import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Eye, MessageSquareText, Rocket, Wrench, IndianRupee, BedDouble } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { LISTINGS, OWNER_ANALYTICS } from '../data/listings.js';
import useComplaints from '../hooks/useComplaints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import ComplaintTimeline from '../components/ComplaintTimeline.jsx';

// ── Update Rent: records price history automatically via the API ─────
function UpdateRentCard({ token, onDone }) {
  const [pgId, setPgId] = useState('sunrise-house');
  const [price, setPrice] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const p = Number(price);
    if (!p || p < 500) { setMsg({ ok: false, t: 'Rent must be a number ≥ 500' }); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await api.price.update({ propertyId: pgId, newPrice: p }, token);
      setMsg({ ok: true, t: `✓ Rent recorded: ₹${r.record.oldPrice.toLocaleString('en-IN')} → ₹${r.record.newPrice.toLocaleString('en-IN')} (history archived)` });
      setPrice('');
      onDone?.();
    } catch (ex) { setMsg({ ok: false, t: ex.message }); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="rounded-[20px] border border-white/10 bg-card p-5">
      <p className="flex items-center gap-2 text-[13px] font-semibold"><IndianRupee size={14} className="text-bronze" /> Update rent</p>
      <p className="mt-1 text-[11px] text-white/40">Old vs new price is archived automatically — students see the full history.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <select value={pgId} onChange={(e) => setPgId(e.target.value)} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[12.5px] text-white outline-none">
          {LISTINGS.map((l) => <option key={l.id} value={l.id} className="bg-[#1c1c1c]">{l.name} (₹{l.rent.toLocaleString('en-IN')})</option>)}
        </select>
        <input type="number" min="500" placeholder="New monthly rent ₹" value={price} onChange={(e) => setPrice(e.target.value)}
          className="w-44 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[12.5px] text-white outline-none" />
        <button disabled={busy} type="submit" className="rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-black disabled:opacity-50">Record change</button>
      </div>
      {msg && <p className={`mt-2 text-[11.5px] ${msg.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{msg.t}</p>}
    </form>
  );
}

// ── Update Availability: records availability history automatically ──
function UpdateAvailabilityCard({ token, onDone }) {
  const [pgId, setPgId] = useState('sunrise-house');
  const [rooms, setRooms] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const r = Number(rooms);
    if (r < 0 || rooms === '') { setMsg({ ok: false, t: 'Rooms must be 0 or more' }); return; }
    setBusy(true); setMsg(null);
    try {
      await api.availability.update({ propertyId: pgId, availableRooms: r }, token);
      setMsg({ ok: true, t: `✓ Availability recorded: ${r} room(s) — history archived for the predictor` });
      setRooms('');
      onDone?.();
    } catch (ex) { setMsg({ ok: false, t: ex.message }); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="rounded-[20px] border border-white/10 bg-card p-5">
      <p className="flex items-center gap-2 text-[13px] font-semibold"><BedDouble size={14} className="text-bronze" /> Update availability</p>
      <p className="mt-1 text-[11px] text-white/40">Every update feeds the move-in availability estimate students see.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <select value={pgId} onChange={(e) => setPgId(e.target.value)} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[12.5px] text-white outline-none">
          {LISTINGS.map((l) => <option key={l.id} value={l.id} className="bg-[#1c1c1c]">{l.name}</option>)}
        </select>
        <input type="number" min="0" placeholder="Available rooms" value={rooms} onChange={(e) => setRooms(e.target.value)}
          className="w-40 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[12.5px] text-white outline-none" />
        <button disabled={busy} type="submit" className="rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-black disabled:opacity-50">Record availability</button>
      </div>
      {msg && <p className={`mt-2 text-[11.5px] ${msg.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{msg.t}</p>}
    </form>
  );
}

// ── DB-backed complaints with status transitions (owner role) ───────
function DbComplaints({ token, refresh }) {
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState({ status: '', category: '', priority: '' });

  useEffect(() => { api.complaints.mine(token).then(setRows).catch(() => setRows([])); }, [token, refresh]);

  if (rows === null) return <p className="text-[12px] text-white/40">Loading complaints…</p>;
  const filtered = rows.filter((c) =>
    (!filter.status || c.status === filter.status) &&
    (!filter.category || c.category === filter.category) &&
    (!filter.priority || c.priority === filter.priority));

  const move = async (c, status) => {
    const note = prompt('Note for the student (optional):') || '';
    try {
      await api.complaints.setStatus(c._id, { status, note }, token);
      setRows((rs) => rs.map((r) => (r._id === c._id ? { ...r, status, timeline: [...(r.timeline || []), { status, at: new Date().toISOString(), note }] } : r)));
    } catch (ex) { alert(ex.message); }
  };

  const sel = 'rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-white outline-none';

  return (
    <div>
      <div className="mt-4 flex flex-wrap gap-2">
        <select className={sel} value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="" className="bg-[#1c1c1c]">All statuses</option>
          {['Reported', 'In Progress', 'Resolved'].map((s) => <option key={s} value={s} className="bg-[#1c1c1c]">{s}</option>)}
        </select>
        <select className={sel} value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
          <option value="" className="bg-[#1c1c1c]">All categories</option>
          {['WiFi', 'Water', 'AC', 'Electricity', 'Plumbing', 'Cleaning', 'Furniture', 'Other'].map((s) => <option key={s} value={s} className="bg-[#1c1c1c]">{s}</option>)}
        </select>
        <select className={sel} value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })}>
          <option value="" className="bg-[#1c1c1c]">All priorities</option>
          {['Low', 'Medium', 'High'].map((s) => <option key={s} value={s} className="bg-[#1c1c1c]">{s} priority</option>)}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((c) => (
          <div key={c._id} className="rounded-[20px] border border-white/10 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13.5px] font-medium">{c.title}</p>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${c.status === 'Resolved' ? 'bg-emerald-400/15 text-emerald-300' : c.status === 'In Progress' ? 'bg-amber-400/15 text-amber-300' : 'bg-sky-400/15 text-sky-300'}`}>{c.status}</span>
            </div>
            <p className="mt-1 text-[11.5px] text-white/40">
              {c.category} · {c.priority} priority · Room {c.roomNumber || '—'} · <Link to={`/pgs/${c.propertyId}`} className="underline hover:text-white">{LISTINGS.find((l) => l.id === c.propertyId)?.name}</Link>
            </p>
            <p className="mt-1 text-[12px] text-white/60">“{c.description}”</p>
            <ComplaintTimeline timeline={c.timeline} current={c.status} />
            <div className="mt-3 flex gap-2">
              {c.status === 'Reported' && <button onClick={() => move(c, 'In Progress')} className="rounded-full bg-amber-400/15 px-3 py-1.5 text-[11.5px] font-medium text-amber-300 hover:bg-amber-400/25">Start work → In Progress</button>}
              {c.status !== 'Resolved' && <button onClick={() => move(c, 'Resolved')} className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-[11.5px] font-medium text-emerald-300 hover:bg-emerald-400/25">Mark Resolved</button>}
            </div>
          </div>
        ))}
        {!filtered.length && <p className="text-[12px] text-white/35">No complaints match the filters.</p>}
      </div>
    </div>
  );
}

function Bars({ data, color = 'bg-bronze' }) {
  const max = Math.max(...data);
  return (
    <div className="flex h-24 items-end gap-1.5">
      {data.map((v, i) => (
        <div key={i} className={`w-full rounded-t-md ${color} opacity-80`} style={{ height: `${(v / max) * 100}%` }} title={`${v}`} />
      ))}
    </div>
  );
}

export default function OwnerDashboard() {
  const { all: allComplaints } = useComplaints();
  const { user, token } = useAuth();
  const [refresh, setRefresh] = useState(0);
  const a = OWNER_ANALYTICS;
  const totalViews = a.views.reduce((s, v) => s + v, 0);
  const totalEnq = a.enquiries.reduce((s, v) => s + v, 0);
  const totalConv = a.conversions.reduce((s, v) => s + v, 0);
  const convRate = ((totalConv / totalEnq) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-canvas text-white">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-3 pb-16 pt-24 sm:pt-28">
        <div className="rounded-[24px] border border-white/[0.08] bg-surface p-5 sm:rounded-[28px] sm:p-8">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-bronze">
            <LayoutDashboard size={12} /> Owner dashboard
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Your PG, at a glance.</h1>

          {/* Stats */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Eye, label: 'Profile views (7 wks)', value: totalViews.toLocaleString('en-IN'), chart: <Bars data={a.views} /> },
              { icon: MessageSquareText, label: 'Enquiries (7 wks)', value: String(totalEnq), chart: <Bars data={a.enquiries} color="bg-sky-400/70" /> },
              { icon: TrendingUp, label: 'Booked (7 wks)', value: `${totalConv} · ${convRate}% rate`, chart: <Bars data={a.conversions} color="bg-emerald-400/70" /> },
            ].map((s) => (
              <div key={s.label} className="rounded-[20px] border border-white/10 bg-card p-5">
                <p className="flex items-center gap-2 text-[11.5px] uppercase tracking-[0.15em] text-white/45"><s.icon size={13} className="text-bronze" /> {s.label}</p>
                <p className="mt-2 font-serif text-3xl">{s.value}</p>
                <div className="mt-3">{s.chart}</div>
              </div>
            ))}
          </div>

          {/* Listing manager */}
          <h2 className="mt-10 font-serif text-2xl">Your listings</h2>
          <div className="mt-4 overflow-x-auto rounded-[20px] border border-white/10">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead className="bg-white/[0.04] text-[11px] uppercase tracking-[0.15em] text-white/45">
                <tr>
                  <th className="p-4">PG</th><th className="p-4">Status</th><th className="p-4">Beds left</th><th className="p-4">Rating</th><th className="p-4">Boost</th>
                </tr>
              </thead>
              <tbody>
                {LISTINGS.slice(0, 3).map((l, i) => (
                  <tr key={l.id} className="border-t border-white/[0.06]">
                    <td className="p-4">
                      <Link to={`/pgs/${l.id}`} className="font-medium hover:text-bronze">{l.name}</Link>
                      <p className="text-[11.5px] text-white/40">{l.area}</p>
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${i === 0 ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/10 text-white/60'}`}>
                        {i === 0 ? 'Live · verified' : 'Live'}
                      </span>
                    </td>
                    <td className="p-4">{l.bedsAvailable}</td>
                    <td className="p-4 text-bronze">{l.rating}</td>
                    <td className="p-4">
                      {i === 0 ? (
                        <span className="text-[11.5px] text-bronze">★ Boosted till 30 Sep</span>
                      ) : (
                        <button className="flex items-center gap-1.5 rounded-full border border-bronze/40 px-3 py-1 text-[11.5px] text-bronze transition hover:bg-bronze/10">
                          <Rocket size={11} /> Boost ₹499
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── NEW: property management (DB-backed) ── */}
          <h2 className="mt-10 font-serif text-2xl">Property management</h2>
          <p className="mt-1 text-[12.5px] text-white/50">
            {user
              ? 'Rent & availability changes are archived to the database automatically when you record them.'
              : <><a href="#/auth?mode=login" className="text-bronze underline">Sign in as owner</a> to record rent & availability changes with automatic history.</>}
          </p>
          {user && (
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <UpdateRentCard token={token} onDone={() => setRefresh((r) => r + 1)} />
              <UpdateAvailabilityCard token={token} onDone={() => setRefresh((r) => r + 1)} />
            </div>
          )}

          {/* Maintenance requests (database) */}
          {user && (
            <>
              <h2 className="mt-10 flex items-center gap-2 font-serif text-2xl"><Wrench size={17} className="text-bronze" /> Maintenance requests</h2>
              <p className="mt-1 text-[12.5px] text-white/50">Live tickets from signed-in students. Status changes notify the student.</p>
              <div className="mt-3"><DbComplaints token={token} refresh={refresh} /></div>
            </>
          )}

          {/* Legacy complaint tracker (kept for compatibility) */}
          <h2 className="mt-10 flex items-center gap-2 font-serif text-2xl opacity-70"><Wrench size={17} className="text-bronze" /> Complaint tracker (archive)</h2>
          <p className="mt-1 text-[12.5px] text-white/50">Students raise issues here. Response time affects your ranking.</p>
          <div className="mt-4 space-y-3">
            {allComplaints.map((c) => (
              <div key={c.id} className="rounded-[20px] border border-white/10 bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13.5px] font-medium">{c.title}</p>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${c.status === 'Resolved' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300'}`}>
                    {c.status}
                  </span>
                </div>
                <p className="mt-1 text-[11.5px] text-white/40">
                  Opened {c.opened} · {c.category} · <Link to={`/pgs/${c.listingId}`} className="underline hover:text-white">{LISTINGS.find((l) => l.id === c.listingId)?.name || 'Unknown PG'}</Link>
                  {c.mine && <span className="ml-2 rounded-full bg-sky-400/15 px-2 py-0.5 text-[10px] font-semibold text-sky-300">NEW from student</span>}
                </p>
                <ol className="mt-3 space-y-1 border-l border-white/15 pl-4">
                  {c.updates.map((u, i) => (
                    <li key={i} className="text-[12px] text-white/60">{u}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
