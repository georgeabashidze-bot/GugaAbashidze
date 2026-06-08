import React from 'react';
import { useLang } from '@/lib/LangContext';
import { TID } from '@/constants/testIds';

const PARTNERS = [
  'https://smartpaw-draft-4.vercel.app/partners/1.png',
  'https://smartpaw-draft-4.vercel.app/partners/2.png',
  'https://smartpaw-draft-4.vercel.app/partners/3.png',
  'https://smartpaw-draft-4.vercel.app/partners/4.png',
  'https://smartpaw-draft-4.vercel.app/partners/5.png',
  'https://smartpaw-draft-4.vercel.app/partners/6.png',
  'https://smartpaw-draft-4.vercel.app/partners/7.png',
];

export default function PartnersMarquee() {
  const { t } = useLang();
  const list = [...PARTNERS, ...PARTNERS];
  return (
    <section
      data-testid={TID.partners}
      className="py-14 md:py-16 border-y border-[#0A4D8C1A] bg-white/60 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <p className="text-xs tracking-[0.24em] uppercase font-bold text-[#465B70] text-center mb-8">
          {t.partners}
        </p>
        <div className="relative overflow-hidden" aria-hidden>
          <div className="marquee-track flex items-center gap-14 md:gap-20 w-max">
            {list.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="h-10 md:h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                loading="lazy"
              />
            ))}
          </div>
          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#FDFBF7] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#FDFBF7] to-transparent" />
        </div>
      </div>
    </section>
  );
}
