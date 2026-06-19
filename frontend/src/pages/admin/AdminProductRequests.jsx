import React, { useEffect, useState } from 'react';
import { Loader2, Mail, Phone, Package, CheckCircle2, XCircle, Clock, ShoppingBag } from 'lucide-react';

const TOKEN_KEY = 'admin_token';

async function fetchJSON(path, opts = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '', ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `${res.status}`);
  }
  return res.json();
}

const STATUS_OPTIONS = [
  { v: 'pending',  label: 'Pending',  icon: Clock,        color: 'text-amber-600 bg-amber-50' },
  { v: 'sourced',  label: 'Sourced',  icon: Package,      color: 'text-blue-600 bg-blue-50' },
  { v: 'ordered',  label: 'Ordered',  icon: ShoppingBag,  color: 'text-green-600 bg-green-50' },
  { v: 'declined', label: 'Declined', icon: XCircle,      color: 'text-red-600 bg-red-50' },
];

export default function AdminProductRequests() {
  const [items, setItems] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  const reload = async () => {
    try {
      const [list, s] = await Promise.all([
        fetchJSON('/api/admin/product-requests'),
        fetchJSON('/api/admin/product-requests/stats'),
      ]);
      setItems(list);
      setStats(s);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { reload(); }, []);

  const updateStatus = async (id, status) => {
    setSavingId(id);
    try {
      await fetchJSON(`/api/admin/product-requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingId(null);
    }
  };

  if (items === null) {
    return (
      <div className="p-10 text-center text-[#465B70]" data-testid="admin-product-requests-loading">
        <Loader2 className="mx-auto mb-3 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div data-testid="admin-product-requests-page">
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">Inbox</p>
          <h1 className="font-display font-bold text-[#05223D] text-3xl tracking-tight mt-1">
            Product Requests
          </h1>
          <p className="text-[#465B70] mt-2 max-w-xl text-sm">
            Customer requests for products not in the catalogue yet. Update each one's status as
            you source / order / fulfil it.
          </p>
        </div>
        {stats && (
          <div className="flex flex-wrap gap-3 text-xs">
            <Stat label="Total"   value={stats.total} />
            <Stat label="Pending" value={stats.pending} highlight />
            <Stat label="Sourced" value={stats.sourced} />
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#0A4D8C26] bg-white/60 p-12 text-center text-[#465B70]" data-testid="admin-product-requests-empty">
          No product requests yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <article
              key={r.request_id}
              className="rounded-2xl bg-white border border-[#0A4D8C14] p-5"
              data-testid={`product-request-row-${r.request_id}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <h3 className="font-bold text-[#05223D] text-lg break-words">
                    {r.product_name}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                    {r.brand && <Chip>{r.brand}</Chip>}
                    {r.size && <Chip>{r.size}</Chip>}
                    <Chip>×{r.quantity}</Chip>
                  </div>
                  {r.notes && <p className="text-sm text-[#465B70] mt-2">{r.notes}</p>}
                </div>
                <div className="md:col-span-4 text-sm">
                  <p className="font-bold text-[#05223D]">{r.name}</p>
                  <p className="text-[#465B70] flex items-center gap-1.5">
                    <Mail size={13} /> <a className="hover:text-[#F25C05]" href={`mailto:${r.email}`}>{r.email}</a>
                  </p>
                  {r.phone && (
                    <p className="text-[#465B70] flex items-center gap-1.5">
                      <Phone size={13} />{' '}
                      <a className="hover:text-[#F25C05]" href={`tel:${r.phone}`}>{r.phone}</a>
                    </p>
                  )}
                  <p className="text-[11px] text-[#465B70]/60 mt-1">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="md:col-span-3 flex flex-col items-start gap-2">
                  <StatusBadge status={r.status} />
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r.request_id, e.target.value)}
                    disabled={savingId === r.request_id}
                    data-testid={`product-request-status-${r.request_id}`}
                    className="w-full text-sm rounded-xl border border-[#0A4D8C26] bg-white px-3 py-2"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.v} value={s.v}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className={`rounded-xl px-4 py-2 ${highlight ? 'bg-[#F25C05] text-white' : 'bg-white border border-[#0A4D8C14]'}`}>
      <p className={`text-[10px] tracking-[0.18em] uppercase font-bold ${highlight ? 'opacity-80' : 'text-[#465B70]'}`}>{label}</p>
      <p className="font-bold text-lg leading-none mt-0.5">{value}</p>
    </div>
  );
}

function Chip({ children }) {
  return <span className="rounded-full bg-[#F5F2EB] px-2.5 py-0.5 font-bold text-[#05223D]">{children}</span>;
}

function StatusBadge({ status }) {
  const opt = STATUS_OPTIONS.find((s) => s.v === status) || STATUS_OPTIONS[0];
  const Icon = opt.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${opt.color}`}>
      <Icon size={13} /> {opt.label}
    </span>
  );
}
