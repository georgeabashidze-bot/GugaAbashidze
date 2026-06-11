/**
 * Admin API client. Bearer JWT stored in localStorage under SP_ADMIN_TOKEN.
 * On 401, clears token and rejects with `unauthorized: true` so callers
 * can redirect to /admin/login.
 */

const BASE = process.env.REACT_APP_BACKEND_URL;
const TOKEN_KEY = 'SP_ADMIN_TOKEN';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

function authHeaders(extra = {}) {
  const t = getToken();
  return t ? { ...extra, Authorization: `Bearer ${t}` } : extra;
}

async function request(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...authHeaders(options.headers || {}),
    },
  });
  if (res.status === 401) {
    setToken(null);
    const err = new Error('Unauthorized');
    err.unauthorized = true;
    throw err;
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      detail = typeof j.detail === 'string'
        ? j.detail
        : Array.isArray(j.detail)
        ? j.detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
        : JSON.stringify(j.detail || j);
    } catch {
      /* ignore */
    }
    const err = new Error(`${res.status}: ${detail}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export const adminApi = {
  // auth
  login: (email, password) =>
    request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request('/api/admin/me'),

  // products
  listProducts: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    ).toString();
    return request(`/api/admin/products${qs ? `?${qs}` : ''}`);
  },
  createProduct: (payload) =>
    request('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (id, payload) =>
    request(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProduct: (id) => request(`/api/admin/products/${id}`, { method: 'DELETE' }),

  // special offers
  listOffers: () => request('/api/admin/special-offers'),
  createOffer: (payload) =>
    request('/api/admin/special-offers', { method: 'POST', body: JSON.stringify(payload) }),
  updateOffer: (id, payload) =>
    request(`/api/admin/special-offers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteOffer: (id) => request(`/api/admin/special-offers/${id}`, { method: 'DELETE' }),

  // uploads
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return request('/api/admin/uploads', { method: 'POST', body: fd });
  },

  // leads / contacts
  listLeads: () => request('/api/admin/leads'),
  listContacts: () => request('/api/admin/contact-inquiries'),
};
