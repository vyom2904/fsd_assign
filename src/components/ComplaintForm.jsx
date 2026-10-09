import { useState } from 'react';
import { Wrench, Send } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const CATEGORIES = ['WiFi', 'Water', 'AC', 'Electricity', 'Plumbing', 'Cleaning', 'Furniture', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function ComplaintForm({ listing, onFiled }) {
  const { user, token } = useAuth();
  const [form, setForm] = useState({ category: 'WiFi', title: '', description: '', roomNumber: '', priority: 'Medium' });
  const [msg, setMsg] = useState(null); // {type:'ok'|'err', text}
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <p className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5 text-[12px] text-white/50">
        🔒 Maintenance requests are visible to signed-in residents only. <a className="text-bronze hover:underline" href="#/auth">Sign in</a> to file a ticket.
      </p>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setMsg({ type: 'err', text: 'Title and description are required.' });
      return;
    }
    setBusy(true); setMsg(null);
    try {
      await api.complaints.file({ propertyId: listing.id, ...form }, token);
      setMsg({ type: 'ok', text: '✓ Complaint filed. Track its status on your dashboard.' });
      setForm({ category: form.category, title: '', description: '', roomNumber: form.roomNumber, priority: form.priority });
      onFiled?.();
    } catch (ex) {
      setMsg({ type: 'err', text: ex.message || 'Could not file complaint.' });
    } finally {
      setBusy(false);
    }
  };

  const input = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[12.5px] text-white placeholder:text-white/30 outline-none focus:border-bronze/50';

  return (
    <form onSubmit={submit} className="rounded-[20px] border border-white/10 bg-card p-5">
      <p className="flex items-center gap-2 text-[13px] font-semibold"><Wrench size={14} className="text-bronze" /> Report a maintenance issue</p>
      <p className="mt-1 text-[11px] text-white/40">{listing.name} · residents only</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
          className={input}>
          {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#1c1c1c]">{c}</option>)}
        </select>
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
          className={input}>
          {PRIORITIES.map((p) => <option key={p} value={p} className="bg-[#1c1c1c]">{p} priority</option>)}
        </select>
      </div>
      <input className={`${input} mt-2`} placeholder="Room number (e.g. 203)" value={form.roomNumber}
        onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} />
      <input className={`${input} mt-2`} placeholder="Title — e.g. Internet not working" value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={80} required />
      <textarea className={`${input} mt-2 min-h-[70px]`} placeholder="What's happening? Since when?" value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={600} required />

      <button type="submit" disabled={busy}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-white py-2.5 text-[13px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-50">
        {busy ? 'Submitting…' : <><Send size={13} /> Submit Complaint</>}
      </button>

      {msg && <p className={`mt-2 text-[11.5px] ${msg.type === 'ok' ? 'text-emerald-300' : 'text-rose-300'}`}>{msg.text}</p>}
    </form>
  );
}
