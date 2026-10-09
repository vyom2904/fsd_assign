import { useEffect, useState } from 'react';

const KEY = 'pgfinder_compare';

export default function useCompare() {
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  const has = (id) => ids.includes(id);
  const toggle = (id) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id]));
  const clear = () => setIds([]);

  return { ids, has, toggle, clear };
}
