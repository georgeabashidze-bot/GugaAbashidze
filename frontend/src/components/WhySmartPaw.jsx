import React from 'react';
import { Check } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import { useReveal } from '@/lib/useReveal';
import { TID } from '@/constants/testIds';

export default function WhySmartPaw({ onOpenSignup }) {
  const { t } = useLang();
  const ref = useReveal();
  return (
    <section data-testid={TID.why} className="py-20 md:py-28 bg-[#0A4D8C] relative overflow-hidden">
      <div className="absolute inset-0 grain pointer-events-none" aria-hidden />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#F25C05]/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" aria-hidden />

      <div ref={ref} className="reveal max-w-7xl mx-auto px-5 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
        <div className="lg:col-span-6">
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{t.why.eyebrow}</p>
          <h2 className="font-display font-bold text-white text-4xl sm:text-5xl lg:text-6xl tracking-[-0.02em] leading-[1.02] mt-3">
            {t.why.title}
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mt-6 max-w-xl">
            {t.why.body}
          </p>
          <button
            onClick={onOpenSignup}
            data-testid="why-cta-button"
            className="btn-primary mt-8"
          >
            {t.nav.cta}
          </button>
        </div>
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {t.why.badges.map((b, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl p-5 hover:bg-white/12 transition"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <span className="w-9 h-9 shrink-0 rounded-full bg-[#F25C05] flex items-center justify-center text-white">
                <Check size={16} strokeWidth={3} />
              </span>
              <p className="text-white font-bold text-lg leading-tight pt-1">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
