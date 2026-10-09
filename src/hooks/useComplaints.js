import { useCallback, useEffect, useState } from 'react';
import { COMPLAINTS_SEED } from '../data/listings.js';

const KEY = 'pgfinder_complaints';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

// Student-filed complaint tickets (persisted) merged with seeded owner threads
export default function useComplaints() {
  const [mine, setMine] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(mine)); } catch { /* ignore */ }
  }, [mine]);

  const file = useCallback((listingId, title, category) => {
    const ticket = {
      id: Date.now(),
      listingId,
      title,
      category,
      status: 'Open',
      opened: 'Today',
      mine: true,
      updates: ['Ticket opened — owner notified on WhatsApp'],
    };
    setMine((ms) => [ticket, ...ms]);
    return ticket;
  }, []);

  // All tickets for the owner dashboard (seeded + student-filed)
  const all = [...mine, ...COMPLAINTS_SEED];
  return { mine, all, file };
}
