import { useCallback, useEffect, useState } from 'react';
import { BED_BOARD_SEED } from '../data/listings.js';

const KEY = 'pgfinder_bed_board';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return BED_BOARD_SEED;
}

// "Find a roommate for this room" — vacant-bed board with local CRUD
export default function useBedBoard() {
  const [posts, setPosts] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(posts)); } catch { /* ignore */ }
  }, [posts]);

  const addPost = useCallback((p) => {
    setPosts((ps) => [{ id: Date.now(), date: 'Today', requests: 0, ...p }, ...ps]);
  }, []);

  const requestToJoin = useCallback((id) => {
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, requests: p.requests + 1, requested: true } : p)));
  }, []);

  const removePost = useCallback((id) => {
    setPosts((ps) => ps.filter((p) => p.id !== id));
  }, []);

  return { posts, addPost, requestToJoin, removePost };
}
