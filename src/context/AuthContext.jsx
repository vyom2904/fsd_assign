import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';

const Ctx = createContext(null);
const KEY = 'stayscout_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
  });
  const [token, setToken] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY))?.token || null; } catch { return null; }
  });

  useEffect(() => {
    try {
      if (user && token) localStorage.setItem(KEY, JSON.stringify({ user, token }));
      else localStorage.removeItem(KEY);
    } catch { /* ignore */ }
  }, [user, token]);

  const login = useCallback(async (email, password) => {
    const r = await api.auth.login({ email, password });
    setUser(r.user); setToken(r.token);
    return r.user;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const r = await api.auth.register({ name, email, password, role });
    setUser(r.user); setToken(r.token);
    return r.user;
  }, []);

  const logout = useCallback(() => { setUser(null); setToken(null); }, []);

  return <Ctx.Provider value={{ user, token, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
