import React, { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import { brandUrlFor } from "@/data/partnerBrands";

/**
 * Auto-rotating horizontal brand strip.
 *
 * Layout:
 *   ┌───────────────────────────────────────────────┐
 *   │  [logo]  [logo]  [logo]  [logo]  [logo]       │
 *   └───────────────────────────────────────────────┘
 *
 * - Shows `visible` logos at once (default 5 on desktop, 3 on tablet, 2 on mobile).
 * - Auto-rotates by stepping `visible` positions every `intervalMs` (default 4 s).
 * - Each logo opens the partner site in a new tab (user choice "b").
 */
export default function BrandSlider({
  brands = [],
  intervalMs = 4000,
  testIdPrefix = "brand-slider",
}) {
  const { lang } = useLang();
  const [page, setPage] = useState(0);

  const headline = lang === "ka" ? "ჩვენი პარტნიორი ბრენდები" : "Our partner brands";

  // Reset to first page if the brand list changes
  useEffect(() => { setPage(0); }, [brands.length]);

  // Auto-rotate
  useEffect(() => {
    if (brands.length === 0) return;
    const id = setInterval(() => {
      setPage((p) => (p + 1) % Math.max(1, brands.length));
    }, intervalMs);
    return () => clearInterval(id);
  }, [brands.length, intervalMs]);

  // Visible window: 5 logos starting at `page`, wrapping around
  const visible = useMemo(() => {
    if (brands.length === 0) return [];
    const out = [];
    for (let i = 0; i < Math.min(5, brands.length); i++) {
      out.push(brands[(page + i) % brands.length]);
    }
    return out;
  }, [brands, page]);

  if (brands.length === 0) return null;

  return (
    <section className="py-10 md:py-14" data-testid={`${testIdPrefix}-section`}>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05] text-center mb-6 md:mb-8">
          {headline}
        </p>
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4"
          data-testid={`${testIdPrefix}-strip`}
        >
          {visible.map((b, i) => (
            <BrandCard key={`${b.id}-${page}-${i}`} brand={b} lang={lang} testId={`${testIdPrefix}-${b.id}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandCard({ brand, lang, testId }) {
  const name = (brand.name && (brand.name[lang] || brand.name.en)) || "Brand";
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const accent = brand.accent || "#0A4D8C";
  const isPlaceholder = !brand.logo;
  const href = brandUrlFor(brand, null);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testId}
      title={`${name} — opens in new tab`}
      className="group relative flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-5 min-h-[130px] border border-[#0A4D8C1A] hover:border-[#F25C05] hover:shadow-[0_10px_30px_rgba(242,92,5,0.15)] transition-all animate-fade-in"
    >
      <span
        className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F5F2EB] text-[#465B70] group-hover:bg-[#F25C05] group-hover:text-white transition-colors"
        aria-hidden
      >
        <ExternalLink className="w-3 h-3" />
      </span>
      {isPlaceholder ? (
        <div
          className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center font-display font-extrabold text-lg md:text-xl text-white shadow-inner"
          style={{ background: accent }}
        >
          {initials}
        </div>
      ) : (
        <img src={brand.logo} alt={name} className="max-h-12 md:max-h-14 max-w-full object-contain" loading="lazy" />
      )}
      <span className="font-bold text-[#05223D] text-center text-xs md:text-sm leading-tight px-1 truncate w-full">
        {name}
      </span>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </a>
  );
}
