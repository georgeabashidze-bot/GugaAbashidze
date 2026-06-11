import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import ImageInput from './ImageInput';

const SUBS = [
  { value: '', label: '— None —' },
  { value: 'toys-accessories', label: 'Toys & Accessories' },
  { value: 'innovation-tech', label: 'Innovation & Tech' },
  { value: 'services', label: 'Services' },
];

const EMPTY = {
  slug: '',
  title: '',
  title_ka: '',
  description: '',
  description_ka: '',
  image: '',
  badge: '',
  discount_percent: '',
  original_price: '',
  sale_price: '',
  sub_category: '',
  linked_product_slug: '',
  starts_at: '',
  ends_at: '',
  status: 'published',
  order: 100,
};

export default function AdminOfferForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    let alive = true;
    (async () => {
      try {
        const list = await adminApi.listOffers();
        const found = list.find((o) => o.id === id);
        if (!found) throw new Error('Offer not found');
        if (alive) {
          setForm({
            slug: found.slug || '',
            title: found.title || '',
            title_ka: found.title_ka || '',
            description: found.description || '',
            description_ka: found.description_ka || '',
            image: found.image || '',
            badge: found.badge || '',
            discount_percent: found.discount_percent ?? '',
            original_price: found.original_price ?? '',
            sale_price: found.sale_price ?? '',
            sub_category: found.sub_category || '',
            linked_product_slug: found.linked_product_slug || '',
            starts_at: found.starts_at ? found.starts_at.slice(0, 16) : '',
            ends_at: found.ends_at ? found.ends_at.slice(0, 16) : '',
            status: found.status || 'published',
            order: found.order ?? 100,
          });
        }
      } catch (e) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, isNew]);

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.image) {
      setError('Please add an image (upload or paste URL).');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: form.slug.trim() || undefined,
        title: form.title,
        title_ka: form.title_ka.trim() || null,
        description: form.description,
        description_ka: form.description_ka.trim() || null,
        image: form.image,
        badge: form.badge.trim() || null,
        discount_percent: form.discount_percent === '' ? null : Number(form.discount_percent),
        original_price: form.original_price === '' ? null : Number(form.original_price),
        sale_price: form.sale_price === '' ? null : Number(form.sale_price),
        sub_category: form.sub_category || null,
        linked_product_slug: form.linked_product_slug.trim() || null,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        status: form.status,
        order: Number(form.order) || 100,
      };
      if (isNew) {
        await adminApi.createOffer(payload);
      } else {
        await adminApi.updateOffer(id, payload);
      }
      navigate('/admin/special-offers');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-14 flex items-center justify-center text-[#465B70]">
        <Loader2 className="w-6 h-6 animate-spin text-[#F25C05]" />
      </div>
    );
  }

  return (
    <div data-testid="admin-offer-form">
      <Link
        to="/admin/special-offers"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#0A4D8C] hover:text-[#F25C05] mb-5 transition"
      >
        <ArrowLeft size={14} /> Back to offers
      </Link>

      <div className="mb-7">
        <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">
          {isNew ? 'New offer' : 'Edit offer'}
        </p>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
          {isNew ? 'Create special offer' : form.title || 'Edit offer'}
        </h1>
      </div>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card-soft p-6 space-y-5">
            <Field label="Title (English)" required>
              <input
                data-testid="field-title"
                value={form.title}
                onChange={(e) => update({ title: e.target.value })}
                required
                maxLength={200}
                className={inputCls}
              />
            </Field>
            <Field label="Title (Georgian)">
              <input
                data-testid="field-title-ka"
                value={form.title_ka}
                onChange={(e) => update({ title_ka: e.target.value })}
                maxLength={200}
                className={inputCls}
              />
            </Field>
            <Field label="Description (English)" required>
              <textarea
                data-testid="field-description"
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                required
                rows={4}
                maxLength={4000}
                className={inputCls}
              />
            </Field>
            <Field label="Description (Georgian)">
              <textarea
                data-testid="field-description-ka"
                value={form.description_ka}
                onChange={(e) => update({ description_ka: e.target.value })}
                rows={4}
                maxLength={4000}
                className={inputCls}
              />
            </Field>
            <Field label="Slug" hint="Auto-generated from title if blank">
              <input
                data-testid="field-slug"
                value={form.slug}
                onChange={(e) => update({ slug: e.target.value.toLowerCase() })}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="card-soft p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Discount %" hint="0-100">
              <input
                data-testid="field-discount"
                type="number"
                min="0"
                max="100"
                value={form.discount_percent}
                onChange={(e) => update({ discount_percent: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Original price">
              <input
                data-testid="field-original-price"
                type="number"
                step="0.01"
                min="0"
                value={form.original_price}
                onChange={(e) => update({ original_price: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Sale price">
              <input
                data-testid="field-sale-price"
                type="number"
                step="0.01"
                min="0"
                value={form.sale_price}
                onChange={(e) => update({ sale_price: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Starts at">
              <input
                data-testid="field-starts-at"
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => update({ starts_at: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Ends at">
              <input
                data-testid="field-ends-at"
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => update({ ends_at: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Order" hint="Lower = shown first">
              <input
                data-testid="field-order"
                type="number"
                value={form.order}
                onChange={(e) => update({ order: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card-soft p-6">
            <Field label="Image" required>
              <ImageInput value={form.image} onChange={(v) => update({ image: v })} testId="field-image" />
            </Field>
          </div>

          <div className="card-soft p-6 space-y-4">
            <Field label="Badge" hint="Short label like ‘New’ or ‘Limited’">
              <input
                data-testid="field-badge"
                value={form.badge}
                onChange={(e) => update({ badge: e.target.value })}
                maxLength={80}
                className={inputCls}
              />
            </Field>
            <Field label="Sub-category">
              <select
                data-testid="field-sub-category"
                value={form.sub_category}
                onChange={(e) => update({ sub_category: e.target.value })}
                className={inputCls}
              >
                {SUBS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Linked product slug" hint="Optional — link to a product detail page">
              <input
                data-testid="field-linked-slug"
                value={form.linked_product_slug}
                onChange={(e) => update({ linked_product_slug: e.target.value.toLowerCase() })}
                placeholder="royal-canin-medium-adult"
                className={inputCls}
              />
            </Field>
            <Field label="Status">
              <select
                data-testid="field-status"
                value={form.status}
                onChange={(e) => update({ status: e.target.value })}
                className={inputCls}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
          </div>

          <button
            data-testid="save-offer-button"
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] text-white font-bold text-sm py-3.5 transition disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving…' : isNew ? 'Create offer' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-[#0A4D8C26] bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0A4D8C] focus:ring-2 focus:ring-[#F25C05]/20 transition';

function Field({ label, hint, children, required }) {
  return (
    <label className="block">
      <span className="text-xs font-bold tracking-wider uppercase text-[#465B70]">
        {label} {required && <span className="text-[#F25C05]">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="text-[11px] text-[#465B70] mt-1">{hint}</p>}
    </label>
  );
}
