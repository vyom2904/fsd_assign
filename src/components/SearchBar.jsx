import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Users, Wallet } from 'lucide-react';
import { CITIES } from '../data/listings.js';

const GENDERS = ['Any', 'Boys', 'Girls'];

export default function SearchBar({ compact = false }) {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('Any');
  const [budget, setBudget] = useState(20000);

  function search(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (gender !== 'Any') params.set('gender', gender.toLowerCase());
    params.set('max', String(budget));
    navigate(`/pgs?${params.toString()}`);
  }

  const field = 'flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2.5';

  return (
    <form
      onSubmit={search}
      className={`mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-[26px] border border-white/[0.12] bg-white/[0.08] p-2 backdrop-blur-md ${
        compact ? '' : 'sm:flex-row sm:rounded-full'
      }`}
    >
      <label className={field}>
        <MapPin size={14} className="shrink-0 text-bronze" />
        <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-transparent text-[13px] text-white outline-none [&>option]:bg-[#1c1c1c]">
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>

      <label className={field}>
        <Users size={14} className="shrink-0 text-bronze" />
        <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-transparent text-[13px] text-white outline-none [&>option]:bg-[#1c1c1c]">
          {GENDERS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </label>

      <label className={`${field} flex-col !items-stretch gap-1 sm:w-44 sm:flex-row sm:items-center`}>
        <span className="flex items-center gap-2">
          <Wallet size={14} className="shrink-0 text-bronze" />
          <span className="whitespace-nowrap text-[12px] text-white/60">₹{Number(budget).toLocaleString('en-IN')}</span>
        </span>
        <input
          type="range"
          min="4000"
          max="20000"
          step="500"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-bronze"
          aria-label="Max budget"
        />
      </label>

      <button
        type="submit"
        className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-black transition hover:bg-white/90"
      >
        Search PG
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:translate-x-0.5">
          <ArrowRight size={12} />
        </span>
      </button>
    </form>
  );
}
