import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Download,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

export default function AdminProductsImport() {
  const [file, setFile] = useState(null);
  const [downloadImages, setDownloadImages] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [downloadingTpl, setDownloadingTpl] = useState(false);
  const inputRef = useRef(null);

  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setResult(null);
    setError('');
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTpl(true);
    setError('');
    try {
      await adminApi.downloadImportTemplate();
    } catch (e) {
      setError(e.message || 'Template download failed');
    } finally {
      setDownloadingTpl(false);
    }
  };

  const handleImport = async (dryRun) => {
    if (!file) {
      setError('Please choose an .xlsx file first.');
      return;
    }
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const r = await adminApi.importProducts(file, { dryRun, downloadImages });
      setResult(r);
    } catch (e) {
      setError(e.message || 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="admin-products-import-page">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A4D8C] hover:text-[#F25C05] transition mb-3"
      >
        <ArrowLeft size={14} /> Back to products
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">
            Bulk import
          </p>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
            Upload product list
          </h1>
          <p className="text-[#465B70] mt-1 max-w-2xl">
            Upload your Excel file (.xlsx). Each row becomes one product. Existing products
            are matched on <code className="bg-[#F5F2EB] px-1.5 py-0.5 rounded text-[12px]">slug</code> (auto-generated
            from <code className="bg-[#F5F2EB] px-1.5 py-0.5 rounded text-[12px]">name</code> if you leave it blank)
            — matched rows are updated in place, new ones are created.
          </p>
        </div>
      </div>

      {/* Step 1 — template */}
      <section className="card-soft p-7 md:p-9 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#F25C05]/15 text-[#F25C05] flex items-center justify-center shrink-0">
            <FileSpreadsheet size={20} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] tracking-[0.22em] uppercase font-bold text-[#F25C05]">
              Step 1
            </p>
            <h2 className="font-display font-bold text-[#05223D] text-xl mt-1">
              Download the latest template
            </h2>
            <p className="text-sm text-[#465B70] mt-1 max-w-xl">
              Pre-filled with column headers, dropdown validation for category &amp;
              status, and one example row to show the expected format. Delete the
              example row before importing your real data.
            </p>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={downloadingTpl}
              data-testid="download-template-button"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0A4D8C] hover:bg-[#073968] text-white text-sm font-bold px-5 py-2.5 transition disabled:opacity-60"
            >
              {downloadingTpl ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Download size={15} />
              )}
              {downloadingTpl ? 'Preparing…' : 'Download template (.xlsx)'}
            </button>
          </div>
        </div>
      </section>

      {/* Step 2 — upload */}
      <section className="card-soft p-7 md:p-9 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#0A4D8C]/10 text-[#0A4D8C] flex items-center justify-center shrink-0">
            <Upload size={20} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] tracking-[0.22em] uppercase font-bold text-[#F25C05]">
              Step 2
            </p>
            <h2 className="font-display font-bold text-[#05223D] text-xl mt-1">
              Upload your filled file
            </h2>
            <p className="text-sm text-[#465B70] mt-1 max-w-xl">
              .xlsx only — max 12 MB. Image URLs are downloaded server-side and hosted on
              our CDN so the catalogue keeps working even if the source URL changes.
            </p>

            {/* Dropzone */}
            <label
              htmlFor="import-file"
              className="mt-5 block cursor-pointer border-2 border-dashed border-[#0A4D8C40] rounded-2xl px-6 py-9 text-center hover:bg-[#F5F2EB] hover:border-[#0A4D8C] transition"
            >
              <input
                ref={inputRef}
                id="import-file"
                type="file"
                accept=".xlsx,.xlsm"
                onChange={onFileChange}
                className="sr-only"
                data-testid="import-file-input"
              />
              {file ? (
                <div>
                  <p className="font-bold text-[#05223D]">{file.name}</p>
                  <p className="text-xs text-[#465B70] mt-1">
                    {(file.size / 1024).toFixed(1)} KB · click to choose a different file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-[#05223D]">Click to choose .xlsx</p>
                  <p className="text-xs text-[#465B70] mt-1">
                    Or drop a file here (Excel 2007+)
                  </p>
                </div>
              )}
            </label>

            <label className="mt-5 flex items-start gap-2.5 text-sm text-[#465B70] cursor-pointer">
              <input
                type="checkbox"
                checked={downloadImages}
                onChange={(e) => setDownloadImages(e.target.checked)}
                data-testid="download-images-toggle"
                className="mt-0.5 w-4 h-4 accent-[#F25C05]"
              />
              <span>
                Download each <code className="bg-[#F5F2EB] px-1.5 py-0.5 rounded text-[12px]">image_url</code> and host it on our CDN
                <span className="block text-xs text-[#465B70]/80 mt-0.5">
                  Recommended. Uncheck only if you want to hot-link the originals.
                </span>
              </span>
            </label>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleImport(true)}
                disabled={busy || !file}
                data-testid="dry-run-button"
                className="inline-flex items-center gap-2 rounded-full border border-[#0A4D8C40] text-[#0A4D8C] hover:bg-[#0A4D8C] hover:text-white text-sm font-bold px-5 py-2.5 transition disabled:opacity-50"
              >
                {busy ? <Loader2 size={15} className="animate-spin" /> : null}
                Preview (dry run)
              </button>
              <button
                type="button"
                onClick={() => handleImport(false)}
                disabled={busy || !file}
                data-testid="import-now-button"
                className="inline-flex items-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] text-white text-sm font-bold px-5 py-2.5 transition disabled:opacity-50"
              >
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                Import now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Errors */}
      {error && (
        <div
          data-testid="import-error"
          className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm flex items-start gap-2"
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {result && <ImportResult result={result} />}
    </div>
  );
}

function ImportResult({ result }) {
  const { inserted, updated, failed, skipped_empty, total_rows, dry_run, errors = [], results = [] } = result;
  const success = inserted + updated;

  return (
    <section className="card-soft p-7 md:p-9" data-testid="import-result">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            failed === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {failed === 0 ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
        </div>
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase font-bold text-[#F25C05]">
            {dry_run ? 'Dry-run preview' : 'Import complete'}
          </p>
          <h2 className="font-display font-bold text-[#05223D] text-xl mt-1">
            {success} {success === 1 ? 'product' : 'products'}{' '}
            {dry_run ? 'would be processed' : 'processed'}
            {failed > 0 && (
              <span className="text-amber-700"> · {failed} failed</span>
            )}
          </h2>
        </div>
      </div>

      {/* Counters */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Total rows" value={total_rows} />
        <Stat label="Inserted" value={inserted} accent="text-emerald-700" />
        <Stat label="Updated" value={updated} accent="text-[#0A4D8C]" />
        <Stat label="Failed" value={failed} accent={failed > 0 ? 'text-amber-700' : ''} />
        <Stat label="Empty / skipped" value={skipped_empty} />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-7">
          <p className="text-sm font-bold text-amber-800 mb-2">
            Rows with errors ({errors.length})
          </p>
          <div className="overflow-x-auto card-soft p-0">
            <table className="w-full text-xs">
              <thead className="bg-amber-50 text-amber-900 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="text-left px-3 py-2">Row</th>
                  <th className="text-left px-3 py-2">Name / slug</th>
                  <th className="text-left px-3 py-2">Reasons</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((e, i) => (
                  <tr key={i} className="border-t border-amber-100/60">
                    <td className="px-3 py-2 font-bold">{e.row}</td>
                    <td className="px-3 py-2">
                      <div className="font-bold text-[#05223D]">{e.name || '—'}</div>
                      <div className="text-[#465B70]">{e.slug}</div>
                    </td>
                    <td className="px-3 py-2 text-amber-900">
                      <ul className="list-disc list-inside space-y-0.5">
                        {e.errors.map((msg, j) => (
                          <li key={j}>{msg}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Per-row results */}
      {results.length > 0 && (
        <div className="mt-7">
          <p className="text-sm font-bold text-[#05223D] mb-2">
            Per-row outcome (first {results.length} shown)
          </p>
          <div className="overflow-x-auto card-soft p-0 max-h-[380px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#F5F2EB] text-[#465B70] uppercase text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2">Row</th>
                  <th className="text-left px-3 py-2">Slug</th>
                  <th className="text-left px-3 py-2">Action</th>
                  <th className="text-left px-3 py-2">Image</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-t border-[#0A4D8C0F]">
                    <td className="px-3 py-2">{r.row}</td>
                    <td className="px-3 py-2 font-bold text-[#05223D]">{r.slug}</td>
                    <td className="px-3 py-2 capitalize">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          r.action === 'inserted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-[#0A4D8C0F] text-[#0A4D8C]'
                        }`}
                      >
                        {r.action}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[#465B70] truncate max-w-[280px]">
                      {r.image || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, accent = '' }) {
  return (
    <div className="rounded-xl border border-[#0A4D8C1A] bg-white px-4 py-3">
      <p className="text-[10px] tracking-[0.18em] uppercase text-[#465B70] font-bold">
        {label}
      </p>
      <p className={`font-display font-extrabold text-2xl mt-1 ${accent || 'text-[#05223D]'}`}>
        {value}
      </p>
    </div>
  );
}
