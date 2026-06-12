import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

const BLANK = {
  slug: '',
  name: '',
  name_ka: '',
  tagline: '',
  tagline_ka: '',
  price: '0',
  price_suffix: 'GEL / month',
  price_suffix_ka: '',
  price_note: '',
  price_note_ka: '',
  features: [{ en: '', ka: '' }],
  cta_label: 'Get started',
  cta_label_ka: '',
  badge: '',
  badge_ka: '',
  featured: false,
  order: 0,
  status: 'published',
};

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.18em] uppercase font-bold text-[#465B70]">
        {label}
      </span>
      {children}
      {hint && <span className="text-xs text-[#465B70]/80 mt-1 block">{hint}</span>}
    </label>
  );
}

const inputCls =
  'mt-1.5 w-full rounded-lg border border-[#0A4D8C26] bg-white px-3 py-2 text-sm text-[#05223D] focus:outline-none focus:ring-2 focus:ring-[#F25C05]/30';

export default function AdminPlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const [loadErr, setLoadErr] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    let alive = true;
    (async () => {
      try {
        const d = await adminApi.getPlan(id);
        if (!alive) return;
        setForm({
          ...BLANK,
          ...d,
          features: d.features?.length ? d.features : [{ en: '', ka: '' }],
        });
      } catch (e) {
        if (e.unauthorized) navigate('/admin/login');
        setLoadErr(e.message || 'Failed to load plan');
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, isNew, navigate]);

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

  const setFeature = (i, k) => (e) =>
    setForm((f) => {
      const copy = [...f.features];
      copy[i] = { ...copy[i], [k]: e.target.value };
      return { ...f, features: copy };
    });

  const addFeature = () =>
    setForm((f) => ({ ...f, features: [...f.features, { en: '', ka: '' }] }));
  const removeFeature = (i) =>
    setForm((f) => ({ ...f, features: f.features.filter((_, j) => j !== i) }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaveErr('');
    setBusy(true);
    try {
      const payload = {
        ...form,
        order: Number(form.order) || 0,
        features: form.features.filter((x) => x.en.trim()),
        // strip empty strings → undefined-like
        name_ka: form.name_ka || null,
        tagline_ka: form.tagline_ka || null,
        price_suffix_ka: form.price_suffix_ka || null,
        price_note: form.price_note || null,
        price_note_ka: form.price_note_ka || null,
        cta_label_ka: form.cta_label_ka || null,
        badge: form.badge || null,
        badge_ka: form.badge_ka || null,
      };
      if (isNew) {
        const created = await adminApi.createPlan(payload);
        navigate(`/admin/plans/${created.id}`, { replace: true });
      } else {
        await adminApi.updatePlan(id, payload);
      }
      navigate('/admin/plans');
    } catch (err) {
      setSaveErr(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[#465B70] py-10">
        <Loader2 className="w-5 h-5 animate-spin text-[#F25C05]" /> Loading plan…
      </div>
    );
  }
  if (loadErr) return <div className="card-soft p-6 text-red-700">{loadErr}</div>;

  return (
    <form onSubmit={onSubmit} data-testid="admin-plan-form">
      <Link
        to="/admin/plans"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A4D8C] hover:text-[#F25C05] transition mb-3"
      >
        <ArrowLeft size={14} /> Back to plans
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <h1 className="font-display font-extrabold text-3xl tracking-tight">
          {isNew ? 'New plan' : `Edit · ${form.name || form.slug}`}
        </h1>
        <button
          type="submit"
          disabled={busy}
          data-testid="save-plan-button"
          className="inline-flex items-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] text-white text-sm font-bold px-5 py-2.5 transition disabled:opacity-60"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {isNew ? 'Create plan' : 'Save changes'}
        </button>
      </div>

      {saveErr && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          {saveErr}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Identity */}
        <section className="card-soft p-6 space-y-4">
          <h2 className="font-display font-bold text-lg">Identity</h2>
          <Field label="Slug (URL key)">
            <input className={inputCls} value={form.slug} onChange={set('slug')} required
              pattern="[a-z0-9-]+" data-testid="plan-slug-input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name (EN)">
              <input className={inputCls} value={form.name} onChange={set('name')} required data-testid="plan-name-input" />
            </Field>
            <Field label="Name (KA)">
              <input className={inputCls} value={form.name_ka || ''} onChange={set('name_ka')} data-testid="plan-name-ka-input" />
            </Field>
          </div>
          <Field label="Tagline (EN)">
            <textarea className={inputCls} rows={2} value={form.tagline} onChange={set('tagline')} required data-testid="plan-tagline-input" />
          </Field>
          <Field label="Tagline (KA)">
            <textarea className={inputCls} rows={2} value={form.tagline_ka || ''} onChange={set('tagline_ka')} data-testid="plan-tagline-ka-input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Badge (EN)">
              <input className={inputCls} value={form.badge || ''} onChange={set('badge')} placeholder="e.g. Most popular" data-testid="plan-badge-input" />
            </Field>
            <Field label="Badge (KA)">
              <input className={inputCls} value={form.badge_ka || ''} onChange={set('badge_ka')} data-testid="plan-badge-ka-input" />
            </Field>
          </div>
        </section>

        {/* Pricing & status */}
        <section className="card-soft p-6 space-y-4">
          <h2 className="font-display font-bold text-lg">Pricing & status</h2>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Price">
              <input className={inputCls} value={form.price} onChange={set('price')} required data-testid="plan-price-input" />
            </Field>
            <Field label="Suffix (EN)">
              <input className={inputCls} value={form.price_suffix} onChange={set('price_suffix')} data-testid="plan-price-suffix-input" />
            </Field>
            <Field label="Suffix (KA)">
              <input className={inputCls} value={form.price_suffix_ka || ''} onChange={set('price_suffix_ka')} data-testid="plan-price-suffix-ka-input" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price note (EN)">
              <input className={inputCls} value={form.price_note || ''} onChange={set('price_note')} data-testid="plan-price-note-input" />
            </Field>
            <Field label="Price note (KA)">
              <input className={inputCls} value={form.price_note_ka || ''} onChange={set('price_note_ka')} data-testid="plan-price-note-ka-input" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="CTA label (EN)">
              <input className={inputCls} value={form.cta_label} onChange={set('cta_label')} data-testid="plan-cta-input" />
            </Field>
            <Field label="CTA label (KA)">
              <input className={inputCls} value={form.cta_label_ka || ''} onChange={set('cta_label_ka')} data-testid="plan-cta-ka-input" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3 items-end">
            <Field label="Display order">
              <input type="number" className={inputCls} value={form.order} onChange={set('order')} data-testid="plan-order-input" />
            </Field>
            <Field label="Status">
              <select className={inputCls} value={form.status} onChange={set('status')} data-testid="plan-status-select">
                <option value="published">published</option>
                <option value="draft">draft</option>
              </select>
            </Field>
            <label className="flex items-center gap-2.5 mt-6 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={set('featured')} className="w-4 h-4 accent-[#F25C05]" data-testid="plan-featured-toggle" />
              <span className="text-sm font-bold text-[#05223D]">Featured / Most popular</span>
            </label>
          </div>
        </section>

        {/* Features */}
        <section className="card-soft p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">Plan features</h2>
            <button
              type="button"
              onClick={addFeature}
              data-testid="add-feature-button"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A4D8C] hover:text-[#F25C05] transition"
            >
              <Plus size={14} /> Add feature
            </button>
          </div>
          <div className="space-y-3">
            {form.features.map((f, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-start">
                <input
                  className={inputCls}
                  value={f.en}
                  onChange={setFeature(i, 'en')}
                  placeholder="Feature in English (required)"
                  data-testid={`feature-en-${i}`}
                  required
                />
                <input
                  className={inputCls}
                  value={f.ka || ''}
                  onChange={setFeature(i, 'ka')}
                  placeholder="Feature in Georgian"
                  data-testid={`feature-ka-${i}`}
                />
                <button
                  type="button"
                  onClick={() => removeFeature(i)}
                  data-testid={`remove-feature-${i}`}
                  className="mt-1.5 w-9 h-9 inline-flex items-center justify-center rounded-full bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition"
                  disabled={form.features.length <= 1}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </form>
  );
}
