import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Loader2,
  Edit2,
  Trash2,
  Star,
  Upload,
  Sparkles,
  CheckCircle2,
  XCircle,
  EyeOff,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import QuickAddDialog from './QuickAddDialog';

const SUB_LABELS = {
  food: 'Food',
  hygiene: 'Hygiene',
  vitamins: 'Vitamins',
  'toys-accessories': 'Toys & Accessories',
  'innovation-tech': 'Innovation & Tech',
  services: 'Services',
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'needs', label: 'Needs AI enrichment' },
  { key: 'draft', label: 'Drafts' },
  { key: 'published', label: 'Published' },
];

const PAGE_SIZE = 50;

export default function AdminProducts() {
  const [items, setItems] = useState(null); // current page result
  const [summary, setSummary] = useState(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('all');
  const [brand, setBrand] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);

  // Bulk action UX
  const [bulkBusy, setBulkBusy] = useState(false);
  const [job, setJob] = useState(null); // {job_id, total, status, processed, succeeded, failed, skipped, ...}
  const [overwrite, setOverwrite] = useState(false);
  const pollRef = useRef(null);

  const fetchList = useCallback(async () => {
    setError('');
    const params = {};
    if (q.trim()) params.q = q.trim();
    if (tab === 'draft') params.status = 'draft';
    else if (tab === 'published') params.status = 'published';
    else if (tab === 'needs') params.needs_enrichment = 'true';
    if (brand !== 'all') params.brand = brand;
    params.limit = 5000;
    try {
      const list = await adminApi.listProducts(params);
      setItems(list);
      setSelected(new Set());
      setPage(1);
    } catch (e) {
      setError(e.message);
    }
  }, [q, tab, brand]);

  const fetchSummary = useCallback(async () => {
    try {
      const s = await adminApi.productsSummary();
      setSummary(s);
    } catch (e) {
      // non-fatal
      console.warn('summary load failed', e);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const brandOptions = useMemo(() => {
    if (!summary) return [];
    const set = new Map();
    for (const row of summary.by_brand || []) {
      set.set(row.brand, (set.get(row.brand) || 0) + row.count);
    }
    return Array.from(set.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [summary]);

  const total = items?.length || 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paged = useMemo(() => {
    if (!items) return [];
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  const allOnPageSelected = paged.length > 0 && paged.every((p) => selected.has(p.id));
  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        paged.forEach((p) => next.delete(p.id));
      } else {
        paged.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };
  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectAllInView = () => {
    if (!items) return;
    setSelected(new Set(items.map((p) => p.id)));
  };
  const clearSelection = () => setSelected(new Set());

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      await adminApi.deleteProduct(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      fetchSummary();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };
  useEffect(() => stopPolling, []);

  const pollJob = (jobId) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const j = await adminApi.getJob(jobId);
        setJob(j);
        if (j.status === 'done' || j.status === 'error') {
          stopPolling();
          setBulkBusy(false);
          // Refresh data once the job lands
          fetchSummary();
          fetchList();
        }
      } catch (e) {
        stopPolling();
        setBulkBusy(false);
        setError(`Job poll failed: ${e.message}`);
      }
    }, 1500);
  };

  const handleBulkEnrich = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const confirmMsg =
      `Run AI enrichment on ${ids.length} product${ids.length === 1 ? '' : 's'}?` +
      (overwrite ? '\n\nThis will OVERWRITE existing EN/KA copy.' : '\n\nProducts that already have EN+KA copy will be skipped.');
    if (!window.confirm(confirmMsg)) return;
    setError('');
    setBulkBusy(true);
    try {
      const resp = await adminApi.enrichBulk(ids, { overwrite });
      setJob({
        id: resp.job_id,
        total: resp.total,
        status: 'queued',
        processed: 0,
        succeeded: 0,
        failed: 0,
        skipped: resp.skipped_already_enriched || 0,
        meta: { pre_skipped: resp.skipped_already_enriched },
      });
      pollJob(resp.job_id);
    } catch (e) {
      setError(e.message);
      setBulkBusy(false);
    }
  };

  const handleBulkPublish = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!window.confirm(`Publish ${ids.length} product${ids.length === 1 ? '' : 's'}?`)) return;
    setBulkBusy(true);
    try {
      const r = await adminApi.bulkPublish(ids);
      setItems((prev) =>
        prev.map((p) => (selected.has(p.id) ? { ...p, status: 'published' } : p)),
      );
      setError('');
      setSelected(new Set());
      fetchSummary();
      window.alert(`Published ${r.modified} of ${r.matched}.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkUnpublish = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!window.confirm(`Move ${ids.length} product${ids.length === 1 ? '' : 's'} back to draft?`)) return;
    setBulkBusy(true);
    try {
      const r = await adminApi.bulkUnpublish(ids);
      setItems((prev) =>
        prev.map((p) => (selected.has(p.id) ? { ...p, status: 'draft' } : p)),
      );
      setSelected(new Set());
      fetchSummary();
      window.alert(`Moved ${r.modified} of ${r.matched} to draft.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} product${ids.length === 1 ? '' : 's'}? This cannot be undone.`)) return;
    setBulkBusy(true);
    try {
      const r = await adminApi.bulkDelete(ids);
      setItems((prev) => prev.filter((p) => !selected.has(p.id)));
      setSelected(new Set());
      fetchSummary();
      window.alert(`Deleted ${r.deleted}.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBulkBusy(false);
    }
  };

  const statusCounts = summary?.status_counts || { draft: 0, published: 0, total: 0 };
  const needsCount = summary?.needs_enrichment ?? 0;
  const selectionCount = selected.size;

  return (
    <div data-testid="admin-products-page">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">Catalogue + Specials</p>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
            Products
          </h1>
          <p className="text-[#465B70] mt-1" data-testid="products-counts">
            {summary
              ? `${statusCounts.total} total · ${statusCounts.published} published · ${statusCounts.draft} drafts · ${needsCount} need AI`
              : 'Loading…'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            data-testid="quick-add-product-button"
            className="inline-flex items-center gap-2 rounded-full border border-[#F25C05] bg-[#F25C05]/8 text-[#F25C05] hover:bg-[#F25C05] hover:text-white text-sm font-bold px-5 py-2.5 transition"
          >
            <Sparkles size={16} /> Quick add (AI)
          </button>
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
      <QuickAddDialog open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5" data-testid="status-tabs">
        {TABS.map((t) => {
          const count =
            t.key === 'all'
              ? statusCounts.total
              : t.key === 'needs'
              ? needsCount
              : t.key === 'draft'
              ? statusCounts.draft
              : statusCounts.published;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              data-testid={`tab-${t.key}`}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition border ${
                active
                  ? 'bg-[#0A4D8C] text-white border-[#0A4D8C]'
                  : 'bg-white text-[#0A4D8C] border-[#0A4D8C26] hover:border-[#0A4D8C]'
              }`}
            >
              {t.label}
              <span className={`ml-2 text-xs ${active ? 'text-white/80' : 'text-[#465B70]'}`}>
                {summary ? count : '…'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
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
          data-testid="brand-filter"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="rounded-full border border-[#0A4D8C26] bg-white px-4 py-2.5 text-sm font-bold text-[#05223D] focus:outline-none focus:border-[#0A4D8C] transition max-w-[260px]"
        >
          <option value="all">All brands</option>
          {brandOptions.map((b) => (
            <option key={b.name} value={b.name}>
              {`${b.name} (${b.count})`}
            </option>
          ))}
        </select>
      </div>

      {/* Bulk action bar */}
      {selectionCount > 0 && (
        <div
          data-testid="bulk-action-bar"
          className="sticky top-2 z-20 mb-5 rounded-2xl border-2 border-[#F25C05] bg-[#F25C05]/10 backdrop-blur px-4 py-3 flex flex-wrap items-center gap-3"
        >
          <div className="font-bold text-[#05223D]">
            <span data-testid="selection-count">{selectionCount}</span> selected
          </div>
          <button
            onClick={selectAllInView}
            disabled={selectionCount === total}
            className="text-xs font-bold underline text-[#0A4D8C] disabled:opacity-40"
            data-testid="select-all-in-view"
          >
            Select all {total} in view
          </button>
          <button
            onClick={clearSelection}
            className="text-xs font-bold underline text-[#465B70]"
            data-testid="clear-selection"
          >
            Clear
          </button>
          <div className="flex-1" />
          <label className="flex items-center gap-2 text-xs font-bold text-[#05223D] mr-2">
            <input
              type="checkbox"
              checked={overwrite}
              onChange={(e) => setOverwrite(e.target.checked)}
              data-testid="overwrite-toggle"
            />
            Overwrite existing copy
          </label>
          <button
            onClick={handleBulkEnrich}
            disabled={bulkBusy}
            data-testid="bulk-enrich-button"
            className="inline-flex items-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] text-white text-sm font-bold px-4 py-2 transition disabled:opacity-50"
          >
            <Sparkles size={14} /> Enrich with AI
          </button>
          <button
            onClick={handleBulkPublish}
            disabled={bulkBusy}
            data-testid="bulk-publish-button"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 transition disabled:opacity-50"
          >
            <Eye size={14} /> Publish
          </button>
          <button
            onClick={handleBulkUnpublish}
            disabled={bulkBusy}
            data-testid="bulk-unpublish-button"
            className="inline-flex items-center gap-2 rounded-full bg-white border border-[#0A4D8C26] hover:border-[#0A4D8C] text-[#0A4D8C] text-sm font-bold px-4 py-2 transition disabled:opacity-50"
          >
            <EyeOff size={14} /> Unpublish
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={bulkBusy}
            data-testid="bulk-delete-button"
            className="inline-flex items-center gap-2 rounded-full bg-white border border-red-300 hover:bg-red-600 hover:text-white text-red-600 text-sm font-bold px-4 py-2 transition disabled:opacity-50"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      {/* Job progress */}
      {job && (
        <JobProgressCard
          job={job}
          onDismiss={() => {
            setJob(null);
          }}
        />
      )}

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm" data-testid="error-banner">
          {error}
        </div>
      )}

      {items === null ? (
        <div className="py-14 flex items-center justify-center text-[#465B70]">
          <Loader2 className="w-6 h-6 animate-spin text-[#F25C05]" />
        </div>
      ) : paged.length === 0 ? (
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
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleAllOnPage}
                      data-testid="select-all-checkbox"
                    />
                  </th>
                  <th className="text-left px-4 py-3 font-bold">Product</th>
                  <th className="text-left px-4 py-3 font-bold">Category</th>
                  <th className="text-left px-4 py-3 font-bold">Brand</th>
                  <th className="text-right px-4 py-3 font-bold">Price</th>
                  <th className="text-left px-4 py-3 font-bold">Status</th>
                  <th className="text-left px-4 py-3 font-bold">KA</th>
                  <th className="text-right px-4 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody data-testid="products-table-body">
                {paged.map((p) => {
                  const hasKa = Boolean(
                    p.name_ka &&
                      p.description_ka &&
                      String(p.description_ka).trim().length >= 30,
                  );
                  return (
                    <tr key={p.id} className="border-t border-[#0A4D8C0F] hover:bg-[#FDFBF7]">
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(p.id)}
                          onChange={() => toggleOne(p.id)}
                          data-testid={`row-checkbox-${p.id}`}
                        />
                      </td>
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
                            <div className="text-xs text-[#465B70]">{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-[#0A4D8C0F] text-[#0A4D8C] text-xs font-bold">
                          {p.category}
                        </span>
                        <div className="text-xs text-[#465B70] mt-1">{SUB_LABELS[p.sub_category] || p.sub_category}</div>
                      </td>
                      <td className="px-4 py-3 text-[#465B70]">{p.brand || '—'}</td>
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
                      <td className="px-4 py-3" data-testid={`ka-status-${p.id}`}>
                        {hasKa ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold">
                            <CheckCircle2 size={12} /> ok
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-bold">
                            <AlertTriangle size={12} /> missing
                          </span>
                        )}
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
                  );
                })}
              </tbody>
            </table>
          </div>
          {pageCount > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#0A4D8C0F] bg-white text-sm">
              <span className="text-[#465B70]">
                Page {page} of {pageCount} · {total} items
              </span>
              <div className="flex items-center gap-2">
                <button
                  data-testid="prev-page"
                  onClick={() => setPage((n) => Math.max(1, n - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-full border border-[#0A4D8C26] text-sm font-bold text-[#0A4D8C] disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  data-testid="next-page"
                  onClick={() => setPage((n) => Math.min(pageCount, n + 1))}
                  disabled={page === pageCount}
                  className="px-3 py-1.5 rounded-full border border-[#0A4D8C26] text-sm font-bold text-[#0A4D8C] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function JobProgressCard({ job, onDismiss }) {
  const total = job.total || 0;
  const processed = job.processed || 0;
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  const isDone = job.status === 'done';
  const isError = job.status === 'error';
  const ringColor = isError ? 'border-red-400' : isDone ? 'border-emerald-400' : 'border-[#F25C05]';
  return (
    <div
      data-testid="job-progress-card"
      className={`mb-5 rounded-2xl border-2 ${ringColor} bg-white p-4`}
    >
      <div className="flex items-center gap-3">
        {isError ? (
          <XCircle className="text-red-500" size={22} />
        ) : isDone ? (
          <CheckCircle2 className="text-emerald-600" size={22} />
        ) : (
          <Sparkles className="text-[#F25C05] animate-pulse" size={22} />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[#05223D]">
            {isError
              ? 'AI enrichment failed'
              : isDone
              ? 'AI enrichment complete'
              : 'AI enrichment in progress…'}
          </div>
          <div className="text-xs text-[#465B70] truncate" data-testid="job-last-message">
            {job.last_message || (isDone ? 'All done.' : 'Starting up…')}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-[#05223D]" data-testid="job-progress-text">
            {processed} / {total}
          </div>
          <div className="text-xs text-[#465B70]">
            ok {job.succeeded || 0} · skip {job.skipped || 0} · err {job.failed || 0}
          </div>
        </div>
        {(isDone || isError) && (
          <button
            onClick={onDismiss}
            data-testid="job-dismiss"
            className="ml-2 text-xs font-bold underline text-[#465B70]"
          >
            Dismiss
          </button>
        )}
      </div>
      <div className="mt-3 h-2 rounded-full bg-[#0A4D8C14] overflow-hidden">
        <div
          className={`h-full transition-all ${
            isError ? 'bg-red-500' : isDone ? 'bg-emerald-500' : 'bg-[#F25C05]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isError && job.error && (
        <p className="mt-2 text-xs text-red-700">{job.error}</p>
      )}
    </div>
  );
}
