import React from "react";
import PageShell from "@/components/PageShell";
import PartnerBrandCatalogue from "@/components/PartnerBrandCatalogue";
import { useLang } from "@/lib/LangContext";

/**
 * Category page that — while SmartPaw's own product catalogue is being
 * populated — shows a curated grid of trusted partner brands instead of an
 * empty product list.
 *
 * Props
 * ─────
 *  config: object from /data/partnerBrands.js (one of PARTNER_BRANDS[category])
 *  category: "food" | "hygiene" | "vitamins"
 *  hero: { eyebrow:{en,ka}, title:{en,ka}, intro:{en,ka}, image, imageAlt:{en,ka} }
 */
export default function PartnerCategoryPage({ config, category, hero }) {
  const { lang } = useLang();
  const tx = (obj) => (obj && (obj[lang] || obj.en || obj.ka)) || "";

  return (
    <>
      <PageShell
        eyebrow={tx(hero.eyebrow)}
        title={tx(hero.title)}
        intro={tx(hero.intro)}
        image={hero.image}
        imageAlt={tx(hero.imageAlt)}
      />
      <PartnerBrandCatalogue
        categoryConfig={config}
        testIdPrefix={category}
      />
    </>
  );
}
