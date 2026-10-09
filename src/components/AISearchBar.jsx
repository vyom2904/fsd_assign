import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

const EXAMPLES = [
  'Girls PG under ₹9,000 with WiFi near LD College',
  'Veg mess, AC, single room under ₹12k',
  'Co-living near Nirma University',
  'Boys PG under ₹7,000',
];

export default function AISearchBar() {
  const navigate = useNavigate();
  const [text, setText] = useState('');

  function search(q) {
    const query = (q ?? text).trim();
    navigate(`/pgs?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="relative"
      >
        <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2">
          <Sparkles size={16} className="text-bronze" />
        </span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Try: "Girls PG under ₹9,000 with AC near LD College"'
          className="w-full rounded-full border border-white/[0.12] bg-white/[0.08] py-4 pl-12 pr-32 text-[13.5px] text-white placeholder:text-white/40 backdrop-blur-md outline-none focus:border-bronze/50"
        />
        <button
          type="submit"
          className="group absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-2 rounded-full bg-white py-2.5 pl-5 pr-3 text-[13px] font-medium text-black transition hover:bg-white/90"
        >
          Search
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:translate-x-0.5">
            <ArrowRight size={12} />
          </span>
        </button>
      </form>
      <div className="mt-2.5 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setText(ex);
              search(ex);
            }}
            className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] text-white/60 transition hover:border-bronze/40 hover:text-bronze"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
