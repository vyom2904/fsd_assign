const dot = { Reported: 'bg-sky-400', 'In Progress': 'bg-amber-400', Resolved: 'bg-emerald-400' };

export default function ComplaintTimeline({ timeline, current }) {
  return (
    <ol className="mt-3 space-y-2.5 border-l border-white/15 pl-4">
      {(timeline || []).map((t, i) => (
        <li key={i} className="relative">
          <span className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${dot[t.status] || 'bg-white/40'}`} />
          <p className="text-[12px] font-medium text-white/85">{t.status}{t.status === current ? '' : ''}</p>
          <p className="text-[10.5px] text-white/40">{new Date(t.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}{t.by ? ` · by ${t.by}` : ''}</p>
          {t.note && <p className="text-[11px] text-white/55">“{t.note}”</p>}
        </li>
      ))}
    </ol>
  );
}
