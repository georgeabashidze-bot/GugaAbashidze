import React from 'react';
import { Check } from 'lucide-react';
import PageShell from '@/components/PageShell';

// Sub-category placeholder used for /catalogue/* and /special-offers/* until real products land.
export default function SubCategoryPage({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
  willInclude = [],
  brands = [],
}) {
  return (
    <PageShell
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      image={image}
      imageAlt={imageAlt}
      comingSoon
      comingSoonNote="real product listings being curated"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="card-soft p-7 md:p-9">
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">What this shelf will include</p>
          <h2 className="font-display font-bold text-[#05223D] text-2xl md:text-3xl tracking-tight mt-3">
            Built for everyday use, not impulse buys.
          </h2>
          <ul className="mt-6 space-y-3">
            {willInclude.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-[#05223D]">
                <span className="w-7 h-7 mt-0.5 shrink-0 rounded-full bg-[#F25C05]/15 text-[#F25C05] flex items-center justify-center">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-soft p-7 md:p-9 bg-[#0A4D8C] text-white relative overflow-hidden">
          <div className="absolute inset-0 grain pointer-events-none" aria-hidden />
          <div className="relative">
            <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">Brand families we’re stocking</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight mt-3">
              Vet-approved, owner-loved.
            </h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {brands.map((b, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-sm"
                >
                  {b}
                </span>
              ))}
            </div>
            <p className="text-white/70 text-sm mt-6 leading-relaxed">
              Final brand list confirmed with each partner — send us a brand you already love and we’ll do our best to stock it.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
