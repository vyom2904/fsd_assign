import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Wallet, TrendingUp, CalendarCheck, Wrench, Repeat, Bell } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import SwitchingAssistant from '../components/SwitchingAssistant.jsx';
import ComplaintTimeline from '../components/ComplaintTimeline.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { LISTINGS } from '../data/listings.js';

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;

const QUICK = [
  { icon: Wallet, label: 'Budget Planner', to: '/pgs/sunrise-house?tab=price' },
  { icon: TrendingUp, label: 'Price History', to: '/pgs/sunrise-house?tab=price' },
  { icon: CalendarCheck, label: 'Availability', to: '/pgs/sunrise-house' },
  { icon: Wrench, label: 'Maintenance', to: '/pgs/sunrise-house?tab=maintenance' },
  { icon: Repeat, label: 'Switch PG', to: '/dashboard#switch' },
];

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.complaints.mine(token).then(setComplaints).catch(() => {});
    api.notifications.list(token).then(setNotifs).catch(() => {});
  }, [user, token]);

  const badge = (s) => s === 'Resolved' ? '🟢 Resolved' : s === 'In Progress' ? '🟡 In Progress' : '🔵 Reported';

  return (
    <div className="min-h-screen bg-canvas text-white">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-3 pb-16 pt-24 sm:pt-28">
        <div className="rounded-[24px] border border-white/[0.08] bg-surface p-5 sm:rounded-[28px] sm:p-8">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-bronze">
            <LayoutDashboard size={12} /> Student dashboard
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Hi {user?.name?.split(' ')[0] || 'there'} 👋</h1>

          {/* MY STAY */}
          <div className="mt-8 grid gap-3 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-[20px] border border-white/10 bg-card p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">My stay</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Current PG', 'Sunrise House PG'],
                  ['Current rent', fmt(8500)],
                  ['Deposit paid', fmt(17000)],
                  ['Move-out date', '—'],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-white/40">{k}</p>
                    <p className="mt-1 text-[13px] font-medium">{v}</p>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-white/45">Quick actions</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {QUICK.map((q) => (
                  <Link key={q.label} to={q.to}
                    className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-3.5 text-center transition hover:border-bronze/50">
                    <q.icon size={16} className="text-bronze" />
                    <span className="text-[11px] text-white/70">{q.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-[20px] border border-white/10 bg-card p-5">
              <p className="flex items-center gap-2 text-[13px] font-semibold"><Bell size={13} className="text-bronze" /> Notifications</p>
              <div className="mt-3 space-y-2">
                {notifs.length ? notifs.map((n) => (
                  <p key={n._id} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[12px] text-white/70">{n.text}</p>
                )) : (
                  <p className="text-[12px] text-white/35">No notifications yet. You'll hear about complaint updates here.</p>
                )}
              </div>
            </div>
          </div>

          {/* MY COMPLAINTS + switching assistant */}
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            <div className="rounded-[20px] border border-white/10 bg-card p-5">
              <p className="text-[13px] font-semibold">🔧 My complaints</p>
              <div className="mt-3 space-y-3">
                {complaints.length ? complaints.map((c) => (
                  <div key={c._id} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] font-medium">{c.title}</p>
                      <span className="text-[11px]">{badge(c.status)}</span>
                    </div>
                    <p className="mt-0.5 text-[10.5px] text-white/40">{c.category} · {LISTINGS.find((l) => l.id === c.propertyId)?.name || c.propertyId}</p>
                    <ComplaintTimeline timeline={c.timeline} current={c.status} />
                  </div>
                )) : (
                  <p className="text-[12px] text-white/35">No complaints filed. File one from any PG's 🔧 Maintenance tab.</p>
                )}
              </div>
            </div>

            <div id="switch"><SwitchingAssistant /></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
