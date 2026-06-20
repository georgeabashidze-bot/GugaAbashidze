import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Filter, Inbox, ShoppingBag } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import BrandSlider from "@/components/BrandSlider";
import { useSignup } from "@/lib/SignupContext";
import { useLang } from "@/lib/LangContext";
import { WHATSAPP_URL } from "@/lib/siteConfig";

/**
 * Streamlined category page used while the SmartPaw product catalogue is
 * being populated.
 *
 * Layout (top → bottom):
 *   1. Breadcrumbs
 *   2. Sub-type tabs (Food / Hygiene; Vitamins has none)
 *   3. Partner-brand SLIDER (auto-rotating, opens partner site in new tab)
 *   4. Popular products grid (placeholder until admin uploads SKUs)
 *   5. 'Request a product' CTA card
 *   6. Bottom blue CTA strip
 */
export default function PartnerCategoryPage({ config, category }) {
  const { openSignup } = useSignup();
  const { t, lang } = useLang();
  const tx = (obj) => (obj && (obj[lang] || obj.en)) || "";
  const ps = t.pageShell || {};

  const subtypes = config?.subtypes || [];
  const brands = config?.brands || [];

  const [activeSubtype, setActiveSubtype] = useState("all");

  // Filter brands by active sub-type
  const visibleBrands = useMemo(() => {
    if (subtypes.length === 0 || activeSubtype === "all") return brands;
    return brands.filter((b) => Array.isArray(b.subtypes) && b.subtypes.includes(activeSubtype));
  }, [brands, subtypes, activeSubtype]);

  // Popular products for this category (real SKUs once admin uploads them)
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoadingProducts(true);
    fetch(`/api/products?sub_category=${category}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((all) => {
        if (!alive) return;
        // Optionally filter by product_type matching activeSubtype
        let filtered = all || [];
        if (activeSubtype !== "all" && subtypes.length > 0) {
          filtered = filtered.filter((p) => (p.product_type || "") === activeSubtype);
        }
        setProducts(filtered);
        setLoadingProducts(false);
      })
      .catch(() => { if (alive) setLoadingProducts(false); });
    return () => { alive = false; };
  }, [category, activeSubtype, subtypes.length]);

  const filterLabel = lang === "ka" ? "ფილტრი ტიპის მიხედვით" : "Browse by type";
  const allLabel = lang === "ka" ? "ყველა" : "All";
  const popularTitle = lang === "ka" ? "პოპულარული პროდუქტები" : "Popular products";
  const requestCta = lang === "ka" ? "მოითხოვე პროდუქტი" : "Request a product";
  const requestSub = lang === "ka"
    ? "ვერ პოულობ რასაც ეძებ? გვითხარი — ჩვენ მოგიძებნით შემდეგი მიწოდებისთვის."
    : "Can't find what you're looking for? Tell us — we'll source it for your next delivery.";
  const noProductsYet = lang === "ka"
    ? "ამ კატეგორიის პროდუქტები მალე იქნება დამატებული. იქამდე — გადახედე პარტნიორი ბრენდების ვებსაიტებს ან მოითხოვე კონკრეტული პროდუქტი."
    : "Products in this category are being uploaded. Meanwhile — browse our partner brands above, or request a specific product.";

  return (
    <>
      {/* 1. Breadcrumbs */}
      <section className="pt-28 md:pt-32 pb-2">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <Breadcrumbs />
        </div>
      </section>

      {/* 2. Sub-type tabs */}
      {subtypes.length > 0 && (
        <section className="pb-2" data-testid={`${category}-subtype-section`}>
          <div className="max-w-7xl mx-auto px-5 md:px-10">
            <div className="flex items-center gap-2 text-[#465B70] text-xs font-bold tracking-[0.18em] uppercase mb-3">
              <Filter className="w-3.5 h-3.5" /> {filterLabel}
            </div>
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              data-testid={`${category}-subtype-tabs`}
            >
              <SubtypeButton
                active={activeSubtype === "all"}
                onClick={() => setActiveSubtype("all")}
                testId={`${category}-subtype-all`}
              >
                {allLabel}
              </SubtypeButton>
              {subtypes.map((s) => (
                <SubtypeButton
                  key={s.id}
                  active={activeSubtype === s.id}
                  onClick={() => setActiveSubtype(s.id)}
                  testId={`${category}-subtype-${s.id}`}
                >
                  {tx(s.label)}
                </SubtypeButton>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Partner-brand slider */}
      <BrandSlider brands={visibleBrands} testIdPrefix={`${category}-brand-slider`} />

      {/* 4. Popular products */}
      <section className="py-10 md:py-14" data-testid={`${category}-products-section`}>
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-display font-bold text-[#05223D] text-2xl md:text-3xl tracking-tight">
              {popularTitle}
            </h2>
          </div>
          {loadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/5] rounded-2xl bg-[#F5F2EB] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div
              className="rounded-2xl border-2 border-dashed border-[#0A4D8C26] bg-white/60 p-8 md:p-12 text-center"
              data-testid={`${category}-products-empty`}
            >
              <Inbox className="mx-auto mb-3 h-10 w-10 text-[#0A4D8C]/40" />
              <p className="text-[#465B70] max-w-xl mx-auto">{noProductsYet}</p>
              <Link
                to="/catalogue/request"
                data-testid={`${category}-products-empty-request-link`}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] text-white text-sm font-bold px-5 py-2.5"
              >
                {requestCta} <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id || p.slug} product={p} lang={lang} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Request a product CTA */}
      <section className="pb-12 md:pb-16" data-testid={`${category}-request-cta-section`}>
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="rounded-3xl bg-[#F5F2EB] border border-[#0A4D8C14] p-7 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">
                {requestCta}
              </p>
              <h3 className="font-display font-bold text-[#05223D] text-2xl md:text-3xl tracking-tight mt-2 max-w-2xl">
                {requestSub}
              </h3>
            </div>
            <Link
              to="/catalogue/request"
              data-testid={`${category}-request-cta-button`}
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] text-white text-sm font-bold px-6 py-3"
            >
              {requestCta} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Bottom blue CTA */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#0A4D8C] px-7 py-12 md:px-14 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-7">
            <div className="absolute inset-0 grain pointer-events-none" aria-hidden />
            <div className="relative">
              <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">SmartPaw Food</p>
              <h2 className="font-display font-bold text-white text-3xl md:text-4xl tracking-[-0.02em] leading-tight mt-2 max-w-lg">
                {ps.ctaTitle || "Ready to skip the next pet-shop run?"}
              </h2>
            </div>
            <div className="relative flex flex-wrap items-center gap-3">
              <button
                onClick={openSignup}
                className="btn-primary"
                data-testid={`partner-${category}-cta-start-button`}
              >
                {ps.ctaStart || "Start your plan"}
                <ArrowRight size={18} />
              </button>
              <a
                href={WHATSAPP_URL()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary !border-white !text-white hover:!bg-white hover:!text-[#0A4D8C]"
                data-testid={`partner-${category}-cta-whatsapp-link`}
              >
                <MessageCircle size={16} />
                {ps.ctaWhatsapp || "Chat on WhatsApp"}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
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

function ProductCard({ product, lang }) {
  const name = (lang === "ka" ? product.name_ka : product.name) || product.name || "";
  const price = product.price != null ? `${product.price} ${product.currency || "GEL"}` : null;
  return (
    <Link
      to={`/catalogue#${product.slug || product.id}`}
      className="group rounded-2xl bg-white border border-[#0A4D8C1A] hover:border-[#F25C05] hover:shadow-[0_10px_30px_rgba(242,92,5,0.15)] transition-all overflow-hidden"
      data-testid={`product-card-${product.slug || product.id}`}
    >
      <div className="aspect-square bg-[#F5F2EB] grid place-items-center">
        {product.image ? (
          <img src={product.image} alt={name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <ShoppingBag className="w-10 h-10 text-[#465B70]/30" />
        )}
      </div>
      <div className="p-4">
        <p className="text-[10px] tracking-[0.16em] uppercase font-bold text-[#465B70]">
          {product.brand || ""}
        </p>
        <h3 className="font-bold text-[#05223D] text-sm md:text-base leading-tight mt-1 line-clamp-2">
          {name}
        </h3>
        {price && <p className="mt-2 font-bold text-[#F25C05]">{price}</p>}
      </div>
    </Link>
  );
}
