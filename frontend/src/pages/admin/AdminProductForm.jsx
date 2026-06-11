import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import ImageInput from './ImageInput';

const CATALOGUE_SUBS = ['food', 'hygiene', 'vitamins'];
const SPECIALS_SUBS = ['toys-accessories', 'innovation-tech', 'services'];

const EMPTY = {
  slug: '',
  name: '',
  name_ka: '',
  brand: '',
  category: 'catalogue',
  sub_category: 'food',
  pet_type: 'both',
  image: '',
  description: '',
  description_ka: '',
  size: '',
  tags: [],
  featured: false,
  status: 'published',
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isNew) return;
    let alive = true;
    (async () => {
      try {
        const list = await adminApi.listProducts();
        const found = list.find((p) => p.id === id);
        if (!found) throw new Error('Product not found');
        if (alive) {
          setForm({
            slug: found.slug || '',
            name: found.name || '',
            name_ka: found.name_ka || '',
            brand: found.brand || '',
            category: found.category || 'catalogue',
            sub_category: found.sub_category || 'food',
            pet_type: found.pet_type || 'both',
            image: found.image || '',
            description: found.description || '',
            description_ka: found.description_ka || '',
            size: found.size || '',
            tags: found.tags || [],
            featured: !!found.featured,
            status: found.status || 'published',
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

  // When category switches, snap sub_category to a valid value
  const handleCategoryChange = (cat) => {
    const subs = cat === 'catalogue' ? CATALOGUE_SUBS : SPECIALS_SUBS;
    update({ category: cat, sub_category: subs.includes(form.sub_category) ? form.sub_category : subs[0] });
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (form.tags.includes(t)) {
      setTagInput('');
      return;
    }
    update({ tags: [...form.tags, t] });
    setTagInput('');
  };

  const removeTag = (t) => update({ tags: form.tags.filter((x) => x !== t) });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.image) {
      setError('Please add a product image (upload or paste URL).');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug.trim() || undefined,
        name_ka: form.name_ka.trim() || null,
        description_ka: form.description_ka.trim() || null,
        size: form.size.trim() || null,
      };
      if (isNew) {
        await adminApi.createProduct(payload);
      } else {
        await adminApi.updateProduct(id, payload);
      }
      navigate('/admin/products');
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

  const subs = form.category === 'catalogue' ? CATALOGUE_SUBS : SPECIALS_SUBS;

  return (
    <div data-testid="admin-product-form">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#0A4D8C] hover:text-[#F25C05] mb-5 transition"
      >
        <ArrowLeft size={14} /> Back to products
      </Link>

      <div className="mb-7">
        <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">
          {isNew ? 'New' : 'Edit'}
        </p>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
          {isNew ? 'Add a product' : form.name || 'Edit product'}
        </h1>
      </div>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main fields */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card-soft p-6 space-y-5">
            <Field label="Name (English)" required>
              <input
                data-testid="field-name"
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
                required
                maxLength={200}
                className={inputCls}
              />
            </Field>
            <Field label="Name (Georgian)" hint="Optional — used when Georgian locale is active">
              <input
                data-testid="field-name-ka"
                value={form.name_ka}
                onChange={(e) => update({ name_ka: e.target.value })}
                maxLength={200}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Brand" required>
                <input
                  data-testid="field-brand"
                  value={form.brand}
                  onChange={(e) => update({ brand: e.target.value })}
                  required
                  className={inputCls}
                />
              </Field>
              <Field label="Size / Pack" hint="e.g. 4 kg · 15 kg">
                <input
                  data-testid="field-size"
                  value={form.size}
                  onChange={(e) => update({ size: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Slug" hint="URL identifier — auto-generated from the name if left blank">
              <input
                data-testid="field-slug"
                value={form.slug}
                onChange={(e) => update({ slug: e.target.value.toLowerCase() })}
                placeholder="auto from name"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="card-soft p-6 space-y-5">
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
            <Field label="Description (Georgian)" hint="Optional — leave blank to fall back to English">
              <textarea
                data-testid="field-description-ka"
                value={form.description_ka}
                onChange={(e) => update({ description_ka: e.target.value })}
                rows={4}
                maxLength={4000}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="card-soft p-6">
            <Field label="Tags" hint="Press Enter or comma to add">
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#0A4D8C26] bg-white px-3 py-2 focus-within:border-[#0A4D8C]">
                {form.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 bg-[#0A4D8C] text-white text-xs font-bold rounded-full px-2.5 py-0.5"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="hover:text-red-200"
                      aria-label={`Remove ${t}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  data-testid="field-tag-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a tag…"
                  className="flex-1 min-w-[120px] outline-none text-sm py-1"
                />
              </div>
            </Field>
          </div>
        </div>

        {/* Right: meta + image */}
        <div className="space-y-5">
          <div className="card-soft p-6">
            <Field label="Image" required>
              <ImageInput value={form.image} onChange={(v) => update({ image: v })} testId="field-image" />
            </Field>
          </div>

          <div className="card-soft p-6 space-y-4">
            <Field label="Category">
              <select
                data-testid="field-category"
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={inputCls}
              >
                <option value="catalogue">Catalogue</option>
                <option value="specials">Specials</option>
              </select>
            </Field>
            <Field label="Sub-category">
              <select
                data-testid="field-sub-category"
                value={form.sub_category}
                onChange={(e) => update({ sub_category: e.target.value })}
                className={inputCls}
              >
                {subs.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Pet type">
              <select
                data-testid="field-pet-type"
                value={form.pet_type}
                onChange={(e) => update({ pet_type: e.target.value })}
                className={inputCls}
              >
                <option value="both">Dog & Cat</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
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
            <label className="flex items-center gap-2 text-sm">
              <input
                data-testid="field-featured"
                type="checkbox"
                checked={form.featured}
                onChange={(e) => update({ featured: e.target.checked })}
                className="rounded"
              />
              <span className="font-bold text-[#05223D]">Featured product</span>
            </label>
          </div>

          <button
            data-testid="save-product-button"
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] text-white font-bold text-sm py-3.5 transition disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}
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
