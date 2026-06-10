/**
 * Tiny fetch helper for SmartPaw Food backend.
 * All endpoints are namespaced under /api on the same origin as REACT_APP_BACKEND_URL.
 */

const BASE = process.env.REACT_APP_BACKEND_URL;

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export const api = {
  listProducts: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    ).toString();
    return request(`/api/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (slug) => request(`/api/products/${slug}`),
  createLead: (payload) =>
    request('/api/leads', { method: 'POST', body: JSON.stringify(payload) }),
};
