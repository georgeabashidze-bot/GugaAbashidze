import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Loader2, Edit2, Trash2, Star, Upload } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

const SUB_LABELS = {
  food: 'Food',
  hygiene: 'Hygiene',
  vitamins: 'Vitamins',
  'toys-accessories': 'Toys & Accessories',
  'innovation-tech': 'Innovation & Tech',
  services: 'Services',
};

export default function AdminProducts() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setError('');
    try {
      const list = await adminApi.listProducts();
      setItems(list);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    const t = q.trim().toLowerCase();
    return items.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (!t) return true;
      return (
        p.name.toLowerCase().includes(t) ||
        p.brand.toLowerCase().includes(t) ||
        p.slug.toLowerCase().includes(t)
      );
    });
  }, [items, q, category]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      await adminApi.deleteProduct(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div data-testid="admin-products-page">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">Catalogue + Specials</p>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
            Products
          </h1>
          <p className="text-[#465B70] mt-1">{items ? `${filtered.length} / ${items.length}` : 'Loading…'} products</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/products/import"
            data-testid="import-products-button"
            className="inline-flex items-center gap-2 rounded-full border border-[#0A4D8C26] bg-white hover:bg-[#0A4D8C] hover:text-white text-[#0A4D8C] text-sm font-bold px-5 py-2.5 transition"
          >
            <Upload size={16} /> Bulk import
          </Link>
          <Link
            to="/admin/products/new"
            data-testid="new-product-button"
            className="inline-flex items-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] text-white text-sm font-bold px-5 py-2.5 transition"
          >
            <Plus size={16} /> New product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[220px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#465B70]" />
          <input
            data-testid="product-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, brand or slug…"
            className="w-full rounded-full border border-[#0A4D8C26] bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#0A4D8C] focus:ring-2 focus:ring-[#F25C05]/20 transition"
          />
        </div>
        <select
          data-testid="product-category-filter"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-full border border-[#0A4D8C26] bg-white px-4 py-2.5 text-sm font-bold text-[#05223D] focus:outline-none focus:border-[#0A4D8C] transition"
        >
          <option value="all">All categories</option>
          <option value="catalogue">Catalogue</option>
          <option value="specials">Specials</option>
        </select>
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
      ) : filtered.length === 0 ? (
        <div className="card-soft p-10 text-center">
          <p className="font-bold text-[#05223D]">No products match.</p>
          <p className="text-sm text-[#465B70] mt-1">Adjust your search or add a new product.</p>
        </div>
      ) : (
        <div className="card-soft p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F2EB] text-[#465B70] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-bold">Product</th>
                  <th className="text-left px-4 py-3 font-bold">Category</th>
                  <th className="text-left px-4 py-3 font-bold">Pet</th>
                  <th className="text-right px-4 py-3 font-bold">Price</th>
                  <th className="text-left px-4 py-3 font-bold">Status</th>
                  <th className="text-right px-4 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody data-testid="products-table-body">
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t border-[#0A4D8C0F] hover:bg-[#FDFBF7]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-[#F5F2EB] overflow-hidden shrink-0">
                          {p.image && (
                            <img
                              src={p.image}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#05223D] flex items-center gap-1.5">
                            {p.featured && <Star size={12} className="fill-[#F25C05] text-[#F25C05]" />}
                            <span className="truncate">{p.name}</span>
                          </div>
                          <div className="text-xs text-[#465B70]">{p.brand} · {p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-[#0A4D8C0F] text-[#0A4D8C] text-xs font-bold">
                        {p.category}
                      </span>
                      <div className="text-xs text-[#465B70] mt-1">{SUB_LABELS[p.sub_category] || p.sub_category}</div>
                    </td>
                    <td className="px-4 py-3 capitalize text-[#465B70]">{p.pet_type}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#05223D]">
                      {p.price != null
                        ? `${p.currency === 'USD' ? '$' : p.currency === 'EUR' ? '€' : '₾'}${Number(p.price).toFixed(2)}`
                        : <span className="text-[#465B70]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/products/${p.id}`}
                          data-testid={`edit-product-${p.id}`}
                          className="w-8 h-8 rounded-lg border border-[#0A4D8C26] flex items-center justify-center text-[#0A4D8C] hover:bg-[#0A4D8C] hover:text-white transition"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={busyId === p.id}
                          data-testid={`delete-product-${p.id}`}
                          className="w-8 h-8 rounded-lg border border-red-200 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                          title="Delete"
                        >
                          {busyId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
