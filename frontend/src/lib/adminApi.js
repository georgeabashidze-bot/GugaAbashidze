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

/**
 * Note: we use XMLHttpRequest instead of fetch because the preview ingress
 * (Cloudflare) pre-reads response bodies for non-2xx responses, leaving the
 * `Response.body` stream in a consumed state by the time it reaches the JS
 * fetch promise. XHR exposes the body via `responseText` and works correctly.
 */
function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const method = (options.method || 'GET').toUpperCase();
    const isForm = options.body instanceof FormData;
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${BASE}${path}`);

    const token = getToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    if (!isForm && options.body != null) xhr.setRequestHeader('Content-Type', 'application/json');
    if (options.headers) {
      for (const [k, v] of Object.entries(options.headers)) xhr.setRequestHeader(k, v);
    }

    xhr.onload = () => {
      const status = xhr.status;
      const text = xhr.responseText || '';

      if (status === 401) {
        setToken(null);
        let detail = 'Unauthorized';
        try {
          if (text) {
            const j = JSON.parse(text);
            if (typeof j.detail === 'string') detail = j.detail;
          }
        } catch {
          /* ignore */
        }
        const err = new Error(detail);
        err.unauthorized = true;
        err.status = 401;
        reject(err);
        return;
      }

      if (status >= 200 && status < 300) {
        if (status === 204 || !text) {
          resolve(null);
          return;
        }
        try {
          resolve(JSON.parse(text));
        } catch (e) {
          reject(e);
        }
        return;
      }

      // Other errors
      let detail = xhr.statusText || 'Request failed';
      try {
        if (text) {
          const j = JSON.parse(text);
          detail =
            typeof j.detail === 'string'
              ? j.detail
              : Array.isArray(j.detail)
              ? j.detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
              : JSON.stringify(j.detail || j);
        }
      } catch {
        /* ignore */
      }
      const err = new Error(`${status}: ${detail}`);
      err.status = status;
      reject(err);
    };

    xhr.onerror = () => {
      reject(new Error('Network error'));
    };

    xhr.send(isForm ? options.body : options.body || null);
  });
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

  // bulk import (Excel)
  downloadImportTemplate: () => {
    // Browser navigation can't pass the Bearer token, so fetch the binary
    // with XHR and trigger a download client-side.
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${BASE}/api/admin/products/import/template`);
      const token = getToken();
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.responseType = 'blob';
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const blob = xhr.response;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'smartpaw-products-template.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 0);
          resolve(true);
        } else {
          if (xhr.status === 401) setToken(null);
          reject(new Error(`${xhr.status}: template download failed`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send();
    });
  },
  importProducts: (file, { dryRun = false, downloadImages = true } = {}) => {
    const fd = new FormData();
    fd.append('file', file);
    const qs = new URLSearchParams({
      dry_run: dryRun ? 'true' : 'false',
      download_images: downloadImages ? 'true' : 'false',
    }).toString();
    return request(`/api/admin/products/import?${qs}`, { method: 'POST', body: fd });
  },

  // Bewital partner-catalogue AI enrichment (one-click)
  importBewital: ({ dryRun = false, limit = null } = {}) => {
    const params = { dry_run: dryRun ? 'true' : 'false' };
    if (limit) params.limit = String(limit);
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/products/import/bewital?${qs}`, { method: 'POST' });
  },

  // Product list helpers + bulk actions
  productsSummary: () => request('/api/admin/products/summary'),
  bulkPublish: (ids) =>
    request('/api/admin/products/bulk-publish', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
  bulkUnpublish: (ids) =>
    request('/api/admin/products/bulk-unpublish', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
  bulkDelete: (ids) =>
    request('/api/admin/products/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
  enrichBulk: (ids, { overwrite = false } = {}) =>
    request('/api/admin/products/enrich-bulk', {
      method: 'POST',
      body: JSON.stringify({ ids, overwrite }),
    }),
  getJob: (id) => request(`/api/admin/jobs/${id}`),

  // leads / contacts
  listLeads: () => request('/api/admin/leads'),
  listContacts: () => request('/api/admin/contact-inquiries'),

  // cabinet (customer dashboard)
  listCabinetCustomers: () => request('/api/admin/cabinet-customers'),
  cabinetStats: () => request('/api/admin/cabinet-stats'),

  // plans
  listPlans: () => request('/api/admin/plans'),
  getPlan: (id) => request(`/api/admin/plans/${id}`),
  createPlan: (payload) =>
    request('/api/admin/plans', { method: 'POST', body: JSON.stringify(payload) }),
  updatePlan: (id, payload) =>
    request(`/api/admin/plans/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deletePlan: (id) => request(`/api/admin/plans/${id}`, { method: 'DELETE' }),

  // blog posts
  listBlogPosts: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    ).toString();
    return request(`/api/admin/blog-posts${qs ? `?${qs}` : ''}`);
  },
  getBlogPost: (id) => request(`/api/admin/blog-posts/${id}`),
  createBlogPost: (payload) =>
    request('/api/admin/blog-posts', { method: 'POST', body: JSON.stringify(payload) }),
  updateBlogPost: (id, payload) =>
    request(`/api/admin/blog-posts/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteBlogPost: (id) => request(`/api/admin/blog-posts/${id}`, { method: 'DELETE' }),
};
