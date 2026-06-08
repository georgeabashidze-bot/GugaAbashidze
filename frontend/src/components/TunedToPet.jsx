import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import { useReveal } from '@/lib/useReveal';

const IMG = 'https://images.pexels.com/photos/35620584/pexels-photo-35620584.jpeg?auto=compress&cs=tinysrgb&w=1400';

export default function TunedToPet({ onOpenSignup }) {
  const { t } = useLang();
  const ref = useReveal();
  const it = t.features.f3;

  return (
    <section className="py-20 md:py-28" data-testid="tuned-to-pet-section">
      <div ref={ref} className="reveal max-w-7xl mx-auto px-5 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div className="lg:col-span-6 lg:order-2">
          <div className="relative aspect-[5/4] rounded-[2rem] overflow-hidden card-soft group">
            <img
              src={IMG}
              alt={it.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>
        <div className="lg:col-span-6 lg:order-1">
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{it.kicker}</p>
          <h2 className="font-display font-bold text-[#05223D] text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] leading-[1.05] mt-3">
            {it.title}
          </h2>
          <p className="text-[#465B70] text-lg leading-relaxed mt-5 max-w-xl">{it.body}</p>
          <button
            data-testid="tuned-cta-button"
            onClick={onOpenSignup}
            className="mt-7 inline-flex items-center gap-2 text-[#0A4D8C] font-bold hover:text-[#F25C05] transition-colors group"
          >
            {it.cta}
            <span className="w-9 h-9 rounded-full border-2 border-[#0A4D8C] flex items-center justify-center group-hover:bg-[#F25C05] group-hover:border-[#F25C05] group-hover:text-white transition-all">
              <ArrowUpRight size={16} />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
