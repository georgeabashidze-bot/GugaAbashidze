import React, { useCallback, useEffect, useRef } from 'react';

/**
 * Dual-handle price range slider — smartpet.ge style.
 * `min` / `max` are the absolute bounds (set by the parent based on products).
 * `value` is the current [low, high] tuple. Calls `onChange([low, high])`.
 */
export default function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  suffix = '₾',
  step = 1,
  testIdPrefix = 'price-slider',
}) {
  const [low, high] = value;
  const trackRef = useRef(null);
  const dragging = useRef(null); // 'low' | 'high' | null

  const pct = useCallback(
    (v) => ((v - min) / (max - min || 1)) * 100,
    [min, max],
  );

  const valueFromClientX = useCallback(
    (clientX) => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      return Math.round(raw / step) * step;
    },
    [min, max, step],
  );

  const onPointerDown = (which) => (e) => {
    e.preventDefault();
    dragging.current = which;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = useCallback(
    (e) => {
      if (!dragging.current) return;
      const next = valueFromClientX(e.clientX);
      if (dragging.current === 'low') {
        onChange([Math.min(next, high - step), high]);
      } else {
        onChange([low, Math.max(next, low + step)]);
      }
    },
    [valueFromClientX, low, high, step, onChange],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = null;
  }, []);

  // Numeric input handlers
  const onLowInput = (e) => {
    const n = Number(e.target.value);
    if (!Number.isFinite(n)) return;
    onChange([Math.max(min, Math.min(n, high - step)), high]);
  };
  const onHighInput = (e) => {
    const n = Number(e.target.value);
    if (!Number.isFinite(n)) return;
    onChange([low, Math.min(max, Math.max(n, low + step))]);
  };

  // Global listeners — dragging continues outside the handle
  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  const lowPct = pct(low);
  const highPct = pct(high);

  return (
    <div className="space-y-3" data-testid={testIdPrefix}>
      <div className="flex items-center gap-2 text-sm">
        <div className="flex-1 flex items-center gap-1 rounded-lg border border-[#0A4D8C26] bg-white px-2.5 py-1.5">
          <input
            type="number"
            value={Math.round(low)}
            min={min}
            max={high - step}
            onChange={onLowInput}
            data-testid={`${testIdPrefix}-min-input`}
            className="w-full bg-transparent outline-none text-[#05223D] font-bold text-sm"
          />
          <span className="text-[#465B70] text-xs">{suffix}</span>
        </div>
        <span className="text-[#465B70] text-xs">–</span>
        <div className="flex-1 flex items-center gap-1 rounded-lg border border-[#0A4D8C26] bg-white px-2.5 py-1.5">
          <input
            type="number"
            value={Math.round(high)}
            min={low + step}
            max={max}
            onChange={onHighInput}
            data-testid={`${testIdPrefix}-max-input`}
            className="w-full bg-transparent outline-none text-[#05223D] font-bold text-sm"
          />
          <span className="text-[#465B70] text-xs">{suffix}</span>
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative h-1.5 bg-[#0A4D8C1A] rounded-full select-none"
      >
        <div
          className="absolute h-full bg-[#F25C05] rounded-full"
          style={{ left: `${lowPct}%`, width: `${Math.max(0, highPct - lowPct)}%` }}
        />
        <button
          type="button"
          aria-label="Minimum price"
          onPointerDown={onPointerDown('low')}
          data-testid={`${testIdPrefix}-low-handle`}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-[#F25C05] shadow-sm hover:scale-110 transition cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-[#F25C05]/40"
          style={{ left: `${lowPct}%` }}
        />
        <button
          type="button"
          aria-label="Maximum price"
          onPointerDown={onPointerDown('high')}
          data-testid={`${testIdPrefix}-high-handle`}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-[#F25C05] shadow-sm hover:scale-110 transition cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-[#F25C05]/40"
          style={{ left: `${highPct}%` }}
        />
      </div>
    </div>
  );
}
