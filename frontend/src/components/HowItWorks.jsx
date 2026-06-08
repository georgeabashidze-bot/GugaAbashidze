import React from 'react';
import { useLang } from '@/lib/LangContext';
import { useReveal } from '@/lib/useReveal';
import { TID } from '@/constants/testIds';

export default function HowItWorks({ onOpenSignup }) {
  const { t } = useLang();
  const ref = useReveal();
  return (
    <section id="how" data-testid={TID.how} className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div ref={ref} className="reveal grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12 md:mb-16">
          <div className="lg:col-span-5">
            <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{t.how.eyebrow}</p>
            <h2 className="font-display font-bold text-[#05223D] text-4xl sm:text-5xl lg:text-6xl tracking-[-0.02em] leading-[1.02] mt-3">
              {t.how.title}
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-[#465B70] text-lg leading-relaxed">{t.how.body}</p>
            <button onClick={onOpenSignup} className="btn-primary mt-6" data-testid="how-cta-button">
              {t.nav.cta}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {t.how.steps.map((s, i) => (
            <div
              key={i}
              className="card-soft p-7 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(10,77,140,0.08)] transition-all duration-300 relative"
            >
              <p className="font-display font-extrabold text-[#F25C05] text-5xl">{s.n}</p>
              <h3 className="font-display font-bold text-[#05223D] text-xl mt-3">{s.t}</h3>
              <p className="text-sm text-[#465B70] mt-2 leading-relaxed">{s.d}</p>
              {i < t.how.steps.length - 1 && (
                <span className="hidden lg:block absolute top-12 -right-3 w-6 h-px bg-[#0A4D8C33]" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
