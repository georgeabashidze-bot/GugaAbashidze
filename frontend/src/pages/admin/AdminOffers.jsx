import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2, Edit2, Trash2, Calendar } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

export default function AdminOffers() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setError('');
    try {
      const list = await adminApi.listOffers();
      setItems(list);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete offer "${title}"?`)) return;
    setBusyId(id);
    try {
      await adminApi.deleteOffer(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div data-testid="admin-offers-page">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">Promotions</p>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
            Special Offers
          </h1>
          <p className="text-[#465B70] mt-1">
            {items ? `${items.length}` : 'Loading…'} offer{items?.length === 1 ? '' : 's'}
          </p>
        </div>
        <Link
          to="/admin/special-offers/new"
          data-testid="new-offer-button"
          className="inline-flex items-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] text-white text-sm font-bold px-5 py-2.5 transition"
        >
          <Plus size={16} /> New offer
        </Link>
      </div>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {items === null ? (
        <div className="py-14 flex items-center justify-center text-[#465B70]">
          <Loader2 className="w-6 h-6 animate-spin text-[#F25C05]" />
        </div>
      ) : items.length === 0 ? (
        <div className="card-soft p-10 text-center">
          <p className="font-bold text-[#05223D]">No special offers yet.</p>
          <p className="text-sm text-[#465B70] mt-1">Create your first promotion to drive subscriptions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((o) => (
            <div
              key={o.id}
              data-testid={`offer-card-${o.id}`}
              className="card-soft p-0 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-[#F5F2EB]">
                {o.image && (
                  <img
                    src={o.image}
                    alt={o.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                {o.discount_percent != null && (
                  <span className="absolute top-3 right-3 bg-[#F25C05] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    -{o.discount_percent}%
                  </span>
                )}
                <span
                  className={`absolute top-3 left-3 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                    o.status === 'published'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {o.status}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-display font-bold text-lg text-[#05223D] tracking-tight">{o.title}</h3>
                <p className="text-sm text-[#465B70] mt-1.5 line-clamp-2">{o.description}</p>
                <div className="text-xs text-[#465B70] mt-3 flex items-center gap-1.5">
                  <Calendar size={12} />
                  {o.starts_at ? new Date(o.starts_at).toLocaleDateString() : '∞'} →{' '}
                  {o.ends_at ? new Date(o.ends_at).toLocaleDateString() : '∞'}
                </div>
                <div className="flex items-center gap-2 mt-auto pt-4">
                  <Link
                    to={`/admin/special-offers/${o.id}`}
                    data-testid={`edit-offer-${o.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#0A4D8C] hover:bg-[#053B70] text-white text-xs font-bold py-2 transition"
                  >
                    <Edit2 size={12} /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(o.id, o.title)}
                    disabled={busyId === o.id}
                    data-testid={`delete-offer-${o.id}`}
                    className="w-9 h-9 rounded-full border border-red-200 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                  >
                    {busyId === o.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
