import React from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import PartnerBrandCatalogue from "@/components/PartnerBrandCatalogue";
import { useSignup } from "@/lib/SignupContext";
import { useLang } from "@/lib/LangContext";
import { WHATSAPP_URL } from "@/lib/siteConfig";

/**
 * Streamlined category page used while the SmartPaw product catalogue is
 * being populated.
 *
 * Layout (top → bottom):
 *   1. Breadcrumbs (Home / Catalogue / <Category>)
 *   2. Sub-type buttons + partner-brand grid (PartnerBrandCatalogue)
 *   3. Blue "Ready to skip the next pet-shop run?" CTA strip
 *
 * The previous hero block (eyebrow + title + intro + photo) is intentionally
 * removed so the category page leads straight into the partner brands.
 */
export default function PartnerCategoryPage({ config, category }) {
  const { openSignup } = useSignup();
  const { t } = useLang();
  const ps = t.pageShell || {};

  return (
    <>
      {/* Breadcrumbs only — no hero / no photo */}
      <section className="pt-28 md:pt-32 pb-2">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <Breadcrumbs />
        </div>
      </section>

      {/* Sub-type tabs + partner-brand grid */}
      <PartnerBrandCatalogue
        categoryConfig={config}
        testIdPrefix={category}
      />

      {/* Bottom CTA strip (moved from above the logos to below them) */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#0A4D8C] px-7 py-12 md:px-14 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-7">
            <div className="absolute inset-0 grain pointer-events-none" aria-hidden />
            <div className="relative">
              <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">
                SmartPaw Food
              </p>
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
