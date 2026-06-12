import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

const BLANK = {
  slug: '',
  title: '',
  title_ka: '',
  excerpt: '',
  excerpt_ka: '',
  content: '',
  content_ka: '',
  cover_image: '',
  cover_alt: '',
  tag: '',
  category: '',
  author_name: 'SmartPaw Team',
  author_role: '',
  author_avatar: '',
  read_minutes: 4,
  tags: '',
  seo_title: '',
  seo_description: '',
  published_at: '',
  status: 'published',
};

const inputCls =
  'mt-1.5 w-full rounded-lg border border-[#0A4D8C26] bg-white px-3 py-2 text-sm text-[#05223D] focus:outline-none focus:ring-2 focus:ring-[#F25C05]/30';

function Field({ label, children, hint }) {
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

export default function AdminBlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [loadErr, setLoadErr] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isNew) return;
    let alive = true;
    (async () => {
      try {
        const d = await adminApi.getBlogPost(id);
        if (!alive) return;
        setForm({
          ...BLANK,
          ...d,
          tags: Array.isArray(d.tags) ? d.tags.join(', ') : '',
        });
      } catch (e) {
        if (e.unauthorized) navigate('/admin/login');
        setLoadErr(e.message || 'Failed to load post');
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

  const slugify = (s) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);

  const onTitleBlur = () => {
    if (isNew && !form.slug && form.title) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  };

  const onUploadCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await adminApi.uploadImage(file);
      setForm((f) => ({ ...f, cover_image: url }));
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaveErr('');
    setBusy(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        read_minutes: Number(form.read_minutes) || 4,
        tags: form.tags
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        // null out empty optional strings
        title_ka: form.title_ka || null,
        excerpt_ka: form.excerpt_ka || null,
        content_ka: form.content_ka || null,
        cover_alt: form.cover_alt || null,
        tag: form.tag || null,
        category: form.category || null,
        author_role: form.author_role || null,
        author_avatar: form.author_avatar || null,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        published_at: form.published_at || null,
      };
      if (isNew) {
        await adminApi.createBlogPost(payload);
      } else {
        await adminApi.updateBlogPost(id, payload);
      }
      navigate('/admin/blog-posts');
    } catch (err) {
      setSaveErr(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[#465B70] py-10">
        <Loader2 className="w-5 h-5 animate-spin text-[#F25C05]" /> Loading post…
      </div>
    );
  }
  if (loadErr) return <div className="card-soft p-6 text-red-700">{loadErr}</div>;

  return (
    <form onSubmit={onSubmit} data-testid="admin-blog-form">
      <Link
        to="/admin/blog-posts"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A4D8C] hover:text-[#F25C05] transition mb-3"
      >
        <ArrowLeft size={14} /> Back to articles
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <h1 className="font-display font-extrabold text-3xl tracking-tight">
          {isNew ? 'New post' : `Edit · ${form.title || form.slug}`}
        </h1>
        <button
          type="submit"
          disabled={busy}
          data-testid="save-blog-button"
          className="inline-flex items-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] text-white text-sm font-bold px-5 py-2.5 transition disabled:opacity-60"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {isNew ? 'Publish post' : 'Save changes'}
        </button>
      </div>

      {saveErr && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          {saveErr}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        {/* Main content */}
        <div className="space-y-5">
          <section className="card-soft p-6 space-y-4">
            <h2 className="font-display font-bold text-lg">Content (English)</h2>
            <Field label="Title">
              <input className={inputCls} value={form.title} onChange={set('title')} onBlur={onTitleBlur} required data-testid="blog-title-input" />
            </Field>
            <Field label="Slug">
              <input className={inputCls} value={form.slug} onChange={set('slug')} required pattern="[a-z0-9-]+" data-testid="blog-slug-input" />
            </Field>
            <Field label="Excerpt" hint="One-line teaser shown on /blog cards (max 600 chars).">
              <textarea className={inputCls} rows={3} value={form.excerpt} onChange={set('excerpt')} required maxLength={600} data-testid="blog-excerpt-input" />
            </Field>
            <Field label="Body (Markdown)">
              <textarea className={`${inputCls} font-mono`} rows={18} value={form.content} onChange={set('content')} required data-testid="blog-content-input" />
            </Field>
          </section>

          <section className="card-soft p-6 space-y-4">
            <h2 className="font-display font-bold text-lg">Content (Georgian)</h2>
            <Field label="Title (KA)">
              <input className={inputCls} value={form.title_ka || ''} onChange={set('title_ka')} data-testid="blog-title-ka-input" />
            </Field>
            <Field label="Excerpt (KA)">
              <textarea className={inputCls} rows={3} value={form.excerpt_ka || ''} onChange={set('excerpt_ka')} maxLength={600} data-testid="blog-excerpt-ka-input" />
            </Field>
            <Field label="Body (Markdown, KA)">
              <textarea className={`${inputCls} font-mono`} rows={16} value={form.content_ka || ''} onChange={set('content_ka')} data-testid="blog-content-ka-input" />
            </Field>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <section className="card-soft p-6 space-y-4">
            <h2 className="font-display font-bold text-lg">Cover image</h2>
            {form.cover_image && (
              <img src={form.cover_image} alt="" className="w-full aspect-[16/9] rounded-xl object-cover" />
            )}
            <Field label="Image URL">
              <input className={inputCls} value={form.cover_image} onChange={set('cover_image')} placeholder="https://…" data-testid="blog-cover-url-input" />
            </Field>
            <label className="block">
              <span className="text-[11px] tracking-[0.18em] uppercase font-bold text-[#465B70]">
                Or upload
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={onUploadCover}
                className="mt-1.5 block w-full text-xs text-[#465B70] file:mr-3 file:rounded-full file:border-0 file:bg-[#0A4D8C] file:text-white file:font-bold file:px-4 file:py-2 file:cursor-pointer"
                data-testid="blog-cover-upload"
              />
              {uploading && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs text-[#465B70]">
                  <Loader2 size={12} className="animate-spin" /> Uploading…
                </span>
              )}
            </label>
            <Field label="Alt text">
              <input className={inputCls} value={form.cover_alt || ''} onChange={set('cover_alt')} data-testid="blog-cover-alt-input" />
            </Field>
          </section>

          <section className="card-soft p-6 space-y-4">
            <h2 className="font-display font-bold text-lg">Meta</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tag (primary)">
                <input className={inputCls} value={form.tag || ''} onChange={set('tag')} placeholder="e.g. Care" data-testid="blog-tag-input" />
              </Field>
              <Field label="Category">
                <input className={inputCls} value={form.category || ''} onChange={set('category')} data-testid="blog-category-input" />
              </Field>
            </div>
            <Field label="Tags (comma separated)">
              <input className={inputCls} value={form.tags} onChange={set('tags')} placeholder="vet, cats, food" data-testid="blog-tags-input" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Author name">
                <input className={inputCls} value={form.author_name} onChange={set('author_name')} required data-testid="blog-author-name-input" />
              </Field>
              <Field label="Author role">
                <input className={inputCls} value={form.author_role || ''} onChange={set('author_role')} data-testid="blog-author-role-input" />
              </Field>
            </div>
            <Field label="Author avatar URL">
              <input className={inputCls} value={form.author_avatar || ''} onChange={set('author_avatar')} data-testid="blog-author-avatar-input" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Read minutes">
                <input type="number" className={inputCls} value={form.read_minutes} onChange={set('read_minutes')} min={1} data-testid="blog-read-min-input" />
              </Field>
              <Field label="Status">
                <select className={inputCls} value={form.status} onChange={set('status')} data-testid="blog-status-select">
                  <option value="published">published</option>
                  <option value="draft">draft</option>
                </select>
              </Field>
            </div>
            <Field label="Published at (ISO)" hint="Leave blank to keep current value (or auto-set on first publish).">
              <input className={inputCls} value={form.published_at || ''} onChange={set('published_at')} placeholder="2026-02-15T10:00:00Z" data-testid="blog-published-at-input" />
            </Field>
          </section>

          <section className="card-soft p-6 space-y-4">
            <h2 className="font-display font-bold text-lg">SEO</h2>
            <Field label="SEO title">
              <input className={inputCls} value={form.seo_title || ''} onChange={set('seo_title')} maxLength={200} data-testid="blog-seo-title-input" />
            </Field>
            <Field label="SEO description">
              <textarea className={inputCls} rows={3} value={form.seo_description || ''} onChange={set('seo_description')} maxLength={400} data-testid="blog-seo-description-input" />
            </Field>
          </section>
        </div>
      </div>
    </form>
  );
}
