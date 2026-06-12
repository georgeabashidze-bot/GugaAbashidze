import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Loader2, Edit2, Trash2, Star, Layers } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.listPlans();
      setPlans(data);
    } catch (e) {
      if (e.unauthorized) {
        navigate('/admin/login');
        return;
      }
      setError(e.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const onDelete = async (plan) => {
    if (!window.confirm(`Delete the "${plan.name}" plan? This can't be undone.`)) return;
    try {
      await adminApi.deletePlan(plan.id);
      setPlans((list) => list.filter((p) => p.id !== plan.id));
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  };

  return (
    <div data-testid="admin-plans-page">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">Plans</p>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
            Subscription tiers
          </h1>
          <p className="text-[#465B70] mt-1 max-w-xl">
            Edit the pricing tiers shown on the public /plans page. Drag-free ordering uses the
            <code className="bg-[#F5F2EB] px-1.5 py-0.5 rounded text-[12px] mx-1">order</code>
            field.
          </p>
        </div>
        <Link
          to="/admin/plans/new"
          data-testid="new-plan-button"
          className="inline-flex items-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] text-white text-sm font-bold px-5 py-2.5 transition"
        >
          <Plus size={16} /> New plan
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-[#465B70] py-10">
          <Loader2 className="w-5 h-5 animate-spin text-[#F25C05]" /> Loading plans…
        </div>
      ) : error ? (
        <div data-testid="admin-plans-error" className="card-soft p-6 text-red-700">
          {error}
        </div>
      ) : plans.length === 0 ? (
        <div className="card-soft p-10 text-center">
          <Layers className="w-8 h-8 text-[#F25C05] mx-auto" />
          <p className="font-display font-bold text-[#05223D] text-xl mt-3">No plans yet</p>
          <p className="text-sm text-[#465B70] mt-2">Create your first subscription tier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map((p) => (
            <article
              key={p.id}
              data-testid={`admin-plan-card-${p.slug}`}
              className="card-soft p-6 relative"
            >
              {p.featured && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 bg-[#F25C05] text-white text-[10px] tracking-wider uppercase font-bold rounded-full px-2.5 py-1">
                  <Star size={11} /> {p.badge || 'Featured'}
                </span>
              )}
              <p className="text-[10px] tracking-[0.22em] uppercase font-bold text-[#465B70]">
                #{p.order} · {p.slug}
              </p>
              <h2 className="font-display font-extrabold text-2xl text-[#05223D] mt-1">
                {p.name}
              </h2>
              {p.name_ka && (
                <p className="text-sm text-[#465B70] mt-0.5">KA: {p.name_ka}</p>
              )}
              <p className="text-sm text-[#465B70] mt-3 line-clamp-2">{p.tagline}</p>
              <p className="font-display font-extrabold text-3xl text-[#0A4D8C] mt-4">
                {p.price}{' '}
                <span className="text-xs font-bold text-[#465B70]">{p.price_suffix}</span>
              </p>
              <ul className="text-xs text-[#465B70] mt-3 space-y-1">
                {(p.features || []).slice(0, 3).map((f, i) => (
                  <li key={i}>• {f.en}</li>
                ))}
                {p.features.length > 3 && (
                  <li className="text-[#465B70]/70">+ {p.features.length - 3} more</li>
                )}
              </ul>
              <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#0A4D8C14]">
                <span
                  className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                    p.status === 'published'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {p.status}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/plans/${p.id}`}
                    data-testid={`edit-plan-${p.slug}`}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-[#0A4D8C0F] text-[#0A4D8C] hover:bg-[#0A4D8C] hover:text-white transition"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </Link>
                  <button
                    onClick={() => onDelete(p)}
                    data-testid={`delete-plan-${p.slug}`}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
