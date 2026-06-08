import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import { useReveal } from '@/lib/useReveal';
import { TID } from '@/constants/testIds';

const IMGS = [
  'https://images.pexels.com/photos/8434637/pexels-photo-8434637.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/4445456/pexels-photo-4445456.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1436139/pexels-photo-1436139.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/27435433/pexels-photo-27435433.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

export default function Categories({ onOpenSignup }) {
  const { t } = useLang();
  const ref = useReveal();
  return (
    <section data-testid={TID.categories.section} className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div ref={ref} className="reveal max-w-3xl mb-12 md:mb-16">
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{t.categories.eyebrow}</p>
          <h2 className="font-display font-bold text-[#05223D] text-4xl sm:text-5xl tracking-[-0.02em] leading-[1.05] mt-3">
            {t.categories.title}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
          {t.categories.items.map((it, i) => (
            <button
              key={i}
              data-testid={TID.categories.card(i)}
              onClick={onOpenSignup}
              className="group text-left card-soft p-0 overflow-hidden hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(10,77,140,0.10)] transition-all duration-300"
            >
              <div className="relative aspect-[5/4] overflow-hidden">
                <img
                  src={IMGS[i]}
                  alt={it.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="p-5 md:p-6 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-[#05223D] text-xl tracking-tight">{it.title}</h3>
                  <p className="text-sm text-[#465B70] mt-1.5">{it.desc}</p>
                </div>
                <span className="mt-1 w-9 h-9 shrink-0 rounded-full border border-[#0A4D8C33] flex items-center justify-center text-[#0A4D8C] group-hover:bg-[#F25C05] group-hover:border-[#F25C05] group-hover:text-white transition-all">
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
