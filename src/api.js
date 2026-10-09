// ─── StayScout · API layer ──────────────────────────────────────────
// Talks to the Express+MongoDB server on :5001 when it is up; callers
// must handle failures (offline / demo-without-server mode).
const BASE = import.meta.env?.VITE_API_URL || 'http://localhost:5001';

async function req(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const SERVER_ON = () =>
  fetch(`${BASE}/api/listings`, { method: 'HEAD' }).then(() => true).catch(() => false);

export const api = {
  auth: {
    register: (p) => req('/api/auth/register', { method: 'POST', body: p }),
    login: (p) => req('/api/auth/login', { method: 'POST', body: p }),
  },
  listings: {
    all: () => req('/api/listings'),
    get: (id) => req(`/api/listings/${id}`),
  },
  price: {
    update: (p, token) => req('/api/price-history/update', { method: 'POST', body: p, token }),
    history: (id) => req(`/api/price-history/${id}`),
  },
  availability: {
    update: (p, token) => req('/api/availability/update', { method: 'POST', body: p, token }),
    history: (id) => req(`/api/availability-history/${id}`),
    estimate: (id, days = 30) => req(`/api/availability/estimate/${id}?days=${days}`),
  },
  complaints: {
    file: (p, token) => req('/api/complaints/file', { method: 'POST', body: p, token }),
    mine: (token) => req('/api/complaints/mine', { token }),
    setStatus: (id, p, token) => req(`/api/complaints/${id}/status`, { method: 'POST', body: p, token }),
  },
  notifications: {
    list: (token) => req('/api/notifications', { token }),
  },
  switching: {
    create: (p, token) => req('/api/switching-plans', { method: 'POST', body: p, token }),
    mine: (token) => req('/api/switching-plans/mine', { token }),
    step: (id, p, token) => req(`/api/switching-plans/${id}/step`, { method: 'POST', body: p, token }),
  },
  admin: {
    overview: (token) => req('/api/admin/overview', { token }),
  },
};
