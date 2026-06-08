import React from 'react';
import { Quote } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import { useReveal } from '@/lib/useReveal';
import { TID } from '@/constants/testIds';

export default function Testimonials() {
  const { t } = useLang();
  const ref = useReveal();
  return (
    <section data-testid={TID.testimonials} className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div ref={ref} className="reveal max-w-3xl mb-12 md:mb-16">
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{t.testimonials.eyebrow}</p>
          <h2 className="font-display font-bold text-[#05223D] text-4xl sm:text-5xl tracking-[-0.02em] leading-[1.05] mt-3">
            {t.testimonials.title}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
          {t.testimonials.items.map((it, i) => (
            <figure
              key={i}
              className="card-soft p-7 md:p-8 flex flex-col gap-6 hover:-translate-y-1 transition-all duration-300"
            >
              <Quote size={28} className="text-[#F25C05]" />
              <blockquote className="text-[#05223D] text-lg leading-relaxed font-medium">“{it.q}”</blockquote>
              <figcaption className="flex items-center gap-3 mt-auto">
                <div className="w-11 h-11 rounded-full bg-[#0A4D8C] text-white flex items-center justify-center font-bold">
                  {it.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#05223D]">{it.name}</p>
                  <p className="text-xs text-[#465B70]">{it.meta}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
