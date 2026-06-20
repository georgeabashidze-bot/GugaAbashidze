import React, { useMemo, useState } from "react";
import { ExternalLink, Filter } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import { brandUrlFor } from "@/data/partnerBrands";

/**
 * Renders the temporary partner-brand catalogue for a category page.
 * - Sub-type buttons at the top (filter)
 * - Brand-logo grid below — each card opens the partner URL in a new tab
 *
 * Props
 * ─────
 *  categoryConfig: object from partnerBrands.js (one of PARTNER_BRANDS[category])
 *  testIdPrefix:   string used to derive data-testid values, e.g. "food"
 */
export default function PartnerBrandCatalogue({ categoryConfig, testIdPrefix }) {
  const { lang } = useLang();
  const tx = (obj) => (obj && (obj[lang] || obj.en || obj.ka)) || "";
  const subtypes = categoryConfig?.subtypes || [];
  const brands = categoryConfig?.brands || [];

  const [activeSubtype, setActiveSubtype] = useState("all");

  const filteredBrands = useMemo(() => {
    if (subtypes.length === 0 || activeSubtype === "all") return brands;
    return brands.filter(
      (b) => Array.isArray(b.subtypes) && b.subtypes.includes(activeSubtype),
    );
  }, [brands, subtypes, activeSubtype]);

  const headline = lang === "ka" ? "ჩვენი პარტნიორი ბრენდები" : "Our partner brands";
  const sub = lang === "ka"
    ? "გადახედე ჩვენი სანდო პარტნიორების სრულ კატალოგს."
    : "Explore the full lineup from our trusted partners.";
  const filterLabel = lang === "ka" ? "ფილტრი ტიპის მიხედვით" : "Browse by type";
  const allLabel = lang === "ka" ? "ყველა" : "All";
  const opensExternalLabel = lang === "ka" ? "გადადი პარტნიორთან" : "Visit partner site";
  const emptyLabel = lang === "ka"
    ? "ამ ტიპში ჯერ პარტნიორი არ გვაქვს — სკოროდ დავამატებთ."
    : "No partner brand for this type yet — coming soon.";

  return (
    <section className="py-16 md:py-24" data-testid={`${testIdPrefix}-partner-section`}>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        {/* Sub-type filter (only when the category has sub-types) */}
        {subtypes.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 text-[#465B70] text-xs font-bold tracking-[0.18em] uppercase mb-3">
              <Filter className="w-3.5 h-3.5" /> {filterLabel}
            </div>
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              data-testid={`${testIdPrefix}-subtype-tabs`}
            >
              <SubtypeButton
                active={activeSubtype === "all"}
                onClick={() => setActiveSubtype("all")}
                testId={`${testIdPrefix}-subtype-all`}
              >
                {allLabel}
              </SubtypeButton>
              {subtypes.map((s) => (
                <SubtypeButton
                  key={s.id}
                  active={activeSubtype === s.id}
                  onClick={() => setActiveSubtype(s.id)}
                  testId={`${testIdPrefix}-subtype-${s.id}`}
                >
                  {tx(s.label)}
                </SubtypeButton>
              ))}
            </div>
          </div>
        )}

        {/* Headline */}
        <div className="mb-8 md:mb-10">
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">
            {headline}
          </p>
          <h2 className="font-display font-bold text-[#05223D] text-3xl md:text-4xl tracking-[-0.02em] leading-tight mt-2 max-w-2xl">
            {sub}
          </h2>
        </div>

        {/* Brand grid */}
        {filteredBrands.length === 0 ? (
          <div
            className="rounded-2xl border-2 border-dashed border-[#0A4D8C1A] bg-white/60 p-10 text-center text-[#465B70]"
            data-testid={`${testIdPrefix}-partners-empty`}
          >
            {emptyLabel}
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
            data-testid={`${testIdPrefix}-partner-grid`}
          >
            {filteredBrands.map((b) => (
              <BrandCard
                key={b.id}
                brand={b}
                href={brandUrlFor(b, activeSubtype === "all" ? null : activeSubtype)}
                lang={lang}
                opensLabel={opensExternalLabel}
                testId={`${testIdPrefix}-brand-${b.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SubtypeButton({ active, onClick, children, testId }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      data-active={active}
      className={[
        "px-4 md:px-5 py-2 md:py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap",
        active
          ? "bg-[#0A4D8C] text-white shadow-[0_8px_20px_rgba(10,77,140,0.25)]"
          : "bg-white text-[#05223D] border border-[#0A4D8C1A] hover:border-[#F25C05] hover:text-[#F25C05]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function BrandCard({ brand, href, lang, opensLabel, testId }) {
  const name = (brand.name && (brand.name[lang] || brand.name.en)) || "Brand";
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const accent = brand.accent || "#0A4D8C";
  const isPlaceholder = !brand.logo;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testId}
      title={`${name} — ${opensLabel}`}
      className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-6 md:p-7 min-h-[180px] border border-[#0A4D8C1A] shadow-[0_2px_12px_rgba(10,77,140,0.04)] hover:border-[#F25C05] hover:shadow-[0_14px_40px_rgba(242,92,5,0.18)] transition-all"
    >
      {/* External link indicator */}
      <span
        className="absolute top-3 right-3 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#F5F2EB] text-[#465B70] group-hover:bg-[#F25C05] group-hover:text-white transition-colors"
        aria-hidden
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </span>

      {/* Logo or placeholder */}
      {isPlaceholder ? (
        <div
          className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center font-display font-extrabold text-2xl md:text-3xl text-white shadow-inner"
          style={{ background: accent }}
        >
          {initials}
        </div>
      ) : (
        <img
          src={brand.logo}
          alt={name}
          className="max-h-16 md:max-h-20 max-w-full object-contain"
          loading="lazy"
        />
      )}

      <span className="font-bold text-[#05223D] text-center text-sm md:text-base leading-tight px-1">
        {name}
      </span>

      {isPlaceholder && (
        <span className="text-[10px] tracking-[0.16em] uppercase font-bold text-[#465B70]/70">
          {lang === "ka" ? "ლოგო მალე" : "Logo soon"}
        </span>
      )}
    </a>
  );
}
