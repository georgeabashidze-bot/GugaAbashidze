import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { api } from '@/lib/api';

const ROTATE_MS = 6000;

/**
 * Auto-rotating promo banner used on /special-offers (and Home if desired).
 * Pure presentation - data comes from GET /api/promos.
 */
export default function PromoBanner() {
  const { data, isLoading } = useQuery({
    queryKey: ['promos'],
    queryFn: () => api.listPromos(),
  });
  const promos = data || [];
  const [idx, setIdx] = useState(0);

  // Auto-advance
  useEffect(() => {
    if (promos.length < 2) return undefined;
    const id = setInterval(() => setIdx((i) => (i + 1) % promos.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [promos.length]);

  if (isLoading) {
    return (
      <div
        data-testid="promo-banner-loading"
        className="card-soft h-[260px] md:h-[320px] bg-[#0A4D8C0F] animate-pulse"
      />
    );
  }

  if (promos.length === 0) {
    return null;
  }

  const safeIdx = promos.length ? idx % promos.length : 0;
  const current = promos[safeIdx];
  const next = () => setIdx((i) => (i + 1) % promos.length);
  const prev = () => setIdx((i) => (i - 1 + promos.length) % promos.length);

  return (
    <section data-testid="promo-banner" className="relative">
      <article
        data-testid={`promo-banner-slide-${current.slug}`}
        className="relative overflow-hidden rounded-[28px] md:rounded-[36px] border border-[#0A4D8C14] shadow-[0_28px_60px_rgba(10,77,140,0.12)]"
        style={{ minHeight: 320 }}
      >
        <img
          key={current.image}
          src={current.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-105"
          loading="eager"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(110deg, ${current.accent || '#05223D'}F2 0%, ${current.accent || '#05223D'}B3 38%, transparent 78%)`,
          }}
          aria-hidden
        />
        <div className="absolute inset-0 grain pointer-events-none" aria-hidden />

        <div className="relative grid md:grid-cols-12 gap-6 p-8 md:p-12 lg:p-16 min-h-[320px] md:min-h-[380px]">
          <div className="md:col-span-7 lg:col-span-6 flex flex-col justify-center text-white">
            {current.badge && (
              <span
                data-testid="promo-banner-badge"
                className="inline-flex items-center gap-2 self-start bg-white/15 backdrop-blur-md text-white text-[10px] tracking-[0.22em] uppercase font-bold rounded-full px-3 py-1.5"
              >
                <Tag size={11} />
                {current.badge}
              </span>
            )}
            <h2
              data-testid="promo-banner-title"
              className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl leading-[1.05] tracking-[-0.02em] mt-4"
            >
              {current.title}
            </h2>
            <p className="text-white/90 text-base md:text-lg leading-relaxed max-w-xl mt-4">
              {current.subtitle}
            </p>
            <Link
              to={current.cta_route}
              data-testid="promo-banner-cta"
              className="self-start mt-7 inline-flex items-center gap-2 bg-white text-[#05223D] font-bold px-6 py-3.5 rounded-full hover:bg-[#F25C05] hover:text-white transition-all group"
            >
              {current.cta_label}
              <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
            </Link>
          </div>
        </div>
      </article>

      {/* Controls */}
      {promos.length > 1 && (
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-2" data-testid="promo-banner-dots">
            {promos.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Go to promo ${i + 1}`}
                data-testid={`promo-banner-dot-${i}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === safeIdx ? 'w-10 bg-[#F25C05]' : 'w-5 bg-[#0A4D8C26]'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous promo"
              data-testid="promo-banner-prev"
              className="w-10 h-10 rounded-full border border-[#0A4D8C26] text-[#0A4D8C] flex items-center justify-center hover:bg-[#0A4D8C] hover:text-white transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next promo"
              data-testid="promo-banner-next"
              className="w-10 h-10 rounded-full border border-[#0A4D8C26] text-[#0A4D8C] flex items-center justify-center hover:bg-[#0A4D8C] hover:text-white transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
