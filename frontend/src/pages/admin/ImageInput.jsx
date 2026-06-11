import React, { useEffect, useRef, useState } from 'react';
import { UploadCloud, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

/**
 * Image input — supports either pasting an external URL OR uploading a file.
 * Emits the resolved image URL via onChange(url).
 */
export default function ImageInput({ value, onChange, testId = 'image-input' }) {
  const inputRef = useRef(null);
  const [mode, setMode] = useState(value && value.includes('/api/uploads/') ? 'upload' : 'url');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (value && value.includes('/api/uploads/') && mode !== 'upload') setMode('upload');
  }, [value, mode]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const data = await adminApi.uploadImage(file);
      onChange(data.url);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div data-testid={testId} className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`text-xs font-bold px-3 py-1.5 rounded-full transition ${
            mode === 'upload' ? 'bg-[#0A4D8C] text-white' : 'bg-white border border-[#0A4D8C26] text-[#465B70]'
          }`}
        >
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`text-xs font-bold px-3 py-1.5 rounded-full transition ${
            mode === 'url' ? 'bg-[#0A4D8C] text-white' : 'bg-white border border-[#0A4D8C26] text-[#465B70]'
          }`}
        >
          External URL
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="ml-auto text-xs text-red-600 hover:text-red-800 inline-flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {mode === 'upload' ? (
        <label
          htmlFor={`${testId}-file`}
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#0A4D8C33] rounded-2xl p-6 cursor-pointer hover:bg-[#0A4D8C]/5 transition"
        >
          <input
            ref={inputRef}
            id={`${testId}-file`}
            data-testid={`${testId}-file`}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          {busy ? (
            <>
              <Loader2 className="animate-spin text-[#F25C05]" size={20} />
              <span className="text-sm text-[#465B70]">Uploading…</span>
            </>
          ) : (
            <>
              <UploadCloud size={22} className="text-[#0A4D8C]" />
              <span className="text-sm font-bold text-[#05223D]">Click to upload</span>
              <span className="text-xs text-[#465B70]">JPG / PNG / WebP — max 6 MB</span>
            </>
          )}
        </label>
      ) : (
        <input
          data-testid={`${testId}-url`}
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://images.example.com/product.jpg"
          className="w-full rounded-xl border border-[#0A4D8C26] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0A4D8C] focus:ring-2 focus:ring-[#F25C05]/20 transition"
        />
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {value && (
        <div className="flex items-center gap-3 rounded-xl bg-white border border-[#0A4D8C1A] p-2">
          <div className="w-16 h-16 rounded-lg bg-[#F5F2EB] overflow-hidden shrink-0 flex items-center justify-center">
            <img
              src={value}
              alt="preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <ImageIcon size={16} className="text-[#465B70] absolute" />
          </div>
          <p className="text-xs text-[#465B70] break-all line-clamp-2">{value}</p>
        </div>
      )}
    </div>
  );
}
