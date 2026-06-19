import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Link2, Image as ImageIcon, Loader2, X, ArrowRight } from 'lucide-react';

const TOKEN_KEY = 'admin_token';

async function postJSON(path, body) {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `${res.status}`);
  }
  return res.json();
}

async function postImage(path, file) {
  const token = localStorage.getItem(TOKEN_KEY);
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(path, {
    method: 'POST',
    headers: { Authorization: token ? `Bearer ${token}` : '' },
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `${res.status}`);
  }
  return res.json();
}

export default function QuickAddDialog({ open, onClose }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('url'); // 'url' | 'image'
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  if (!open) return null;

  const reset = () => {
    setUrl('');
    setBusy(false);
    setError('');
    setResult(null);
    setMode('url');
  };

  const close = () => {
    reset();
    onClose?.();
  };

  const extractFromUrl = async () => {
    if (!url.trim()) {
      setError('Paste a product URL first');
      return;
    }
    setError('');
    setBusy(true);
    setResult(null);
    try {
      const data = await postJSON('/api/admin/products/quick-extract-url', { url: url.trim() });
      setResult(data);
    } catch (e) {
      setError(e.message || 'Extraction failed');
    } finally {
      setBusy(false);
    }
  };

  const extractFromImage = async (file) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError('Please choose a JPEG, PNG or WebP image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Image too large (>8MB).');
      return;
    }
    setError('');
    setBusy(true);
    setResult(null);
    try {
      const data = await postImage('/api/admin/products/quick-extract-image-upload', file);
      setResult(data);
    } catch (e) {
      setError(e.message || 'Extraction failed');
    } finally {
      setBusy(false);
    }
  };

  const useResult = () => {
    if (!result) return;
    sessionStorage.setItem('smartpaw_quick_add_prefill', JSON.stringify(result));
    close();
    navigate('/admin/products/new');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      data-testid="quick-add-dialog"
      onClick={close}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0A4D8C14]">
          <h2 className="font-display font-bold text-[#05223D] text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F25C05]" />
            Quick add product (AI)
          </h2>
          <button
            onClick={close}
            className="text-[#465B70] hover:text-[#05223D]"
            data-testid="quick-add-close-button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Mode tabs */}
          <div className="flex gap-2 mb-5">
            <button
              data-testid="quick-add-tab-url"
              onClick={() => setMode('url')}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition ${
                mode === 'url'
                  ? 'bg-[#0A4D8C] text-white'
                  : 'bg-[#F5F2EB] text-[#05223D] hover:bg-[#e9e3d2]'
              }`}
            >
              <Link2 size={16} /> From a URL
            </button>
            <button
              data-testid="quick-add-tab-image"
              onClick={() => setMode('image')}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition ${
                mode === 'image'
                  ? 'bg-[#0A4D8C] text-white'
                  : 'bg-[#F5F2EB] text-[#05223D] hover:bg-[#e9e3d2]'
              }`}
            >
              <ImageIcon size={16} /> From a photo
            </button>
          </div>

          {error && (
            <div
              className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3"
              data-testid="quick-add-error"
            >
              {error}
            </div>
          )}

          {!result && mode === 'url' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#465B70] tracking-[0.18em] uppercase">
                Partner product URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://royalcanin.com/.../maxi-adult"
                data-testid="quick-add-url-input"
                disabled={busy}
                className="w-full rounded-xl border border-[#0A4D8C1A] px-4 py-3 text-sm focus:outline-none focus:border-[#F25C05]"
              />
              <p className="text-xs text-[#465B70]">
                Paste the URL of any partner product page. We'll fetch it and ask the AI to extract
                name, brand, size, image and description. Some sites block automated fetching — if
                that happens, use the photo upload instead.
              </p>
              <button
                onClick={extractFromUrl}
                disabled={busy || !url.trim()}
                data-testid="quick-add-extract-url-button"
                className="inline-flex items-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5"
              >
                {busy ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {busy ? 'Extracting…' : 'Extract with AI'}
              </button>
            </div>
          )}

          {!result && mode === 'image' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#465B70] tracking-[0.18em] uppercase">
                Upload a product photo
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => extractFromImage(e.target.files?.[0])}
                data-testid="quick-add-image-input"
                disabled={busy}
                className="block w-full text-sm text-[#465B70] file:mr-4 file:rounded-full file:border-0 file:bg-[#F25C05] file:text-white file:px-5 file:py-2 file:font-bold file:cursor-pointer"
              />
              <p className="text-xs text-[#465B70]">
                JPEG, PNG or WebP, up to 8&nbsp;MB. The AI will recognise the product, brand, size
                and category from the packaging. You'll review before saving.
              </p>
              {busy && (
                <div className="inline-flex items-center gap-2 text-sm text-[#465B70]">
                  <Loader2 className="animate-spin" size={16} /> Analyzing photo…
                </div>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-4" data-testid="quick-add-result">
              <div className="rounded-2xl border border-[#0A4D8C14] bg-[#F5F2EB] p-5">
                <div className="flex items-start gap-4">
                  {result.image_url ? (
                    <img
                      src={result.image_url}
                      alt={result.name || 'product'}
                      className="w-24 h-24 object-cover rounded-xl bg-white shrink-0"
                      onError={(e) => { e.target.style.visibility = 'hidden'; }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-white grid place-items-center shrink-0">
                      <ImageIcon className="w-8 h-8 text-[#465B70]/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#F25C05]">
                      AI suggestion · review before saving
                    </p>
                    <h3 className="font-display font-bold text-[#05223D] text-lg mt-1 break-words">
                      {result.name || 'Unnamed product'}
                    </h3>
                    {result.name_ka && (
                      <p className="text-sm text-[#465B70] mt-0.5">{result.name_ka}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                      {result.brand && (
                        <span className="bg-white rounded-full px-3 py-1 font-bold text-[#05223D]">
                          {result.brand}
                        </span>
                      )}
                      {result.category && (
                        <span className="bg-white rounded-full px-3 py-1 font-bold text-[#05223D]">
                          {result.category}{result.sub_category ? ` · ${result.sub_category}` : ''}
                        </span>
                      )}
                      {result.pet_type && (
                        <span className="bg-white rounded-full px-3 py-1 font-bold text-[#05223D]">
                          {result.pet_type}
                        </span>
                      )}
                      {result.size && (
                        <span className="bg-white rounded-full px-3 py-1 font-bold text-[#05223D]">
                          {result.size}
                        </span>
                      )}
                      {result.price != null && (
                        <span className="bg-white rounded-full px-3 py-1 font-bold text-[#F25C05]">
                          {result.price} {result.currency || 'GEL'}
                        </span>
                      )}
                    </div>
                    {result.description && (
                      <p className="mt-3 text-sm text-[#465B70] line-clamp-3">{result.description}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={useResult}
                  data-testid="quick-add-use-result-button"
                  className="inline-flex items-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] text-white text-sm font-bold px-5 py-2.5"
                >
                  Open in product form <ArrowRight size={16} />
                </button>
                <button
                  onClick={reset}
                  data-testid="quick-add-restart-button"
                  className="inline-flex items-center gap-2 rounded-full border border-[#0A4D8C26] text-[#0A4D8C] hover:bg-[#0A4D8C0A] text-sm font-bold px-5 py-2.5"
                >
                  Try another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
